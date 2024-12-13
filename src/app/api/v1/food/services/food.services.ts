import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";

import { CreateFoodInput } from "../dtos/food.dto";
import { CreateVariantInput } from "../dtos/variants.dto";
import { AddOnValidationService } from "../validation/addon-validation.service";
import { FoodValidationService } from "../validation/food-validation.service";
import { VariantValidationService } from "../validation/variant-validation.service";

import { AddonService } from "./addon.service";
import { VariantService } from "./variants.service";

export class FoodService {
  constructor(
    private readonly foodValidationService: FoodValidationService,
    private readonly variantService: VariantService,
    private readonly addonService: AddonService
  ) {
    this.foodValidationService = foodValidationService;
    this.variantService = new VariantService(new VariantValidationService());
    this.addonService = new AddonService(new AddOnValidationService());
  }

  // async createFood(input: CreateFoodInput) {
  //   // Validate input
  //   await this.foodValidationService.validateCreateFoodInput(input);

  //   // Create food with all related data in a transaction
  //   const createdFood = await prisma.$transaction(async (tx) => {
  //     // Create the food
  //     const food = await tx.food.create({
  //       data: {
  //         name: input.name,
  //         description: input.description,
  //         basePrice: input.basePrice,
  //         minOrderQuantity: input.minOrderQuantity,
  //         createdById: input.createdBy,

  //         // Create food images
  //         foodImages: {
  //           create: input.images.map((image) => ({
  //             url: image.url,
  //             deviceType: image.deviceType,
  //             width: image.width,
  //             height: image.height,
  //             size: image.size
  //           }))
  //         },

  //         // Connect categories
  //         categories: {
  //           connect: input?.categoryIds?.map(id => ({ id }))
  //         },

  //         // Create variants if present
  //         ...(input.variants && {
  //           variants: {
  //             create: input.variants.map(variant => ({
  //               name: variant.name,
  //               basePrice: variant.basePrice,
  //               isActive: variant.isActive ?? true
  //             }))
  //           }
  //         })
  //       }
  //     });

  //     // Create addon groups and their relationships if present
  //     if (input.addonGroups?.length) {
  //       for (const group of input.addonGroups) {
  //         // Create FoodAddon relationships with group information
  //         await Promise.all(group.addons.map(addon=>
  //           tx.foodAddon.create({
  //             data: {
  //               foodId: food.id,
  //               addonId: addon.addonId,
  //               isRequired: addon.isRequired ?? false,
  //               maxQuantity: addon.maxQuantity ?? 1,
  //               // store group information in metadata or additional fields
  //               minQuantity: addon.minQuantity ?? 1,
  //               defaultQuantity: addon.defaultQuantity ?? 1,
  //               displayOrder: addon.displayOrder ?? 0,
  //               addonGroupId: group.id
  //             }
  //           })
  //         ))
  //       }
  //     }

  //     return food;
  //   });
  //   return createdFood;
  // }

  // step 1 create basic food
  async createBasicFood(input: CreateFoodInput) {
    const food = await prisma.food.create({
      data: {
        name: input.name,
        description: input.description,
        basePrice: input.basePrice,
        minOrderQuantity: input.minOrderQuantity,
        foodImages: {
          create: input.images.map(image => ({
            url: image.url,
            deviceType: image.deviceType,
            width: image.width,
            height: image.height,
            size: image.size
          }))
        },
        categories: {
          connect: input?.categoryIds?.map(id => ({ id }))
        },
        createdById: input.userId
      }
    });
    return food;
  }

  // step 2: Add Variants
  async addFoodVariants(foodId: string, variants: Array<Omit<CreateVariantInput, "foodId">>) {
    const createdVariants = await this.variantService.createBulkVariants(foodId, variants);
    return createdVariants;
  }

  // step 3: add food addon groups
  // async addFoodAddons(foodId: string, input: CreateBulkFoodAddonsInput) {
  //   try {
  //     const { userId } = getCurrentUserId();

  //     const createdFoodAddons = await this.addonService.createBulkFoodAddons(input);
  //   } catch (error) {
  //     console.error("Error in addFoodAddonGroups:", error);
  //     throw error;
  //   }
  // }

  async updateFoodDetails(input: CreateFoodInput) {
    const updatedFood = await prisma.food.update({
      where: { id: input.id },
      data: {
        // Basic food properties
        basePrice: input.basePrice,
        minOrderQuantity: input.minOrderQuantity,
        // Marketing/visibility flags
        isPopular: input.isPopular,
        isRecommended: input.isRecommended,
        isNewArrival: input.isNewArrival,
        // Delivery options
        freeDelivery: input.freeDelivery,
        specialDeliveryFee: input.specialDeliveryFee,
        // Pricing and discounts
        haveDiscount: input.haveDiscount,
        discountedPrice: input.discountedPrice,
        // Feature flags
        topSnacks: input.topSnacks,
        dynamicHome: input.dynamicHome,
        trending: input.trending,
        isFree: input.isFree,
        isFeatured: input.isFeatured,
        // Availability
        expiryDate: input.expiryDate,
        availableStartTime: input.availableStartTime,
        availableEndTime: input.availableEndTime,
        trendingStartTime: input.trendingStartTime,
        trendingEndTime: input.trendingEndTime,
        // Relations
        categories: {
          connect: input?.categoryIds?.map(id => ({ id }))
        },
        updatedById: input.userId
      },
      include: {
        foodImages: true,
        variants: true,
        categories: true,
        branches: true
      }
    });
    return updatedFood;
  }

  async getAllFoods() {
    const foods = await prisma.food.findMany({
      include: {
        foodImages: true,
        variants: true,
        categories: true,
        branches: true
      }
    });
    return foods;
  }

  async getFoodById(id: string) {
    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        foodImages: true,
        variants: true,
        categories: true,
        branches: true,
        campaign: true,
        foodAddons: true
      }
    });
    return food;
  }

  async getFoodByMainCategoryId(id: string) {
    // check i main category is active or not
    const mainCategory = await prisma.category.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!mainCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Main category not found");
    }

    if (!mainCategory.isActive) {
      return []; // Return empty if main category is inactive
    }

    const food = await prisma.food.findMany({
      where: {
        categories: {
          some: {
            AND: [
              // check the category relation
              {
                OR: [
                  { id }, // main caegory
                  {
                    AND: [
                      { parentId: id },
                      { isActive: true } // ensure sub category is active
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      include: {
        foodImages: true,
        variants: true,
        categories: true,
        branches: true,
        foodAddons: true,
        campaign: true
      }
    });
    return food;
  }

  async getFoodBySubCategoryId(id: string) {
    // verify this is active sub-category
    const subCategory = await prisma.category.findUnique({
      where: { id },
      select: {
        parentId: true,
        isActive: true,
        parent: {
          select: {
            isActive: true
          }
        }
      }
    });
    if (!subCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    if (!subCategory.parentId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Provided ID is not a subcategory");
    }

    if (!subCategory.isActive) {
      return []; // Return empty if subcategory is inactive
    }

    const food = await prisma.food.findMany({
      where: {
        categories: {
          some: {
            AND: [
              { id },
              { isActive: true },
              {
                parent: {
                  isActive: true
                }
              }
            ]
          }
        }
      },
      include: {
        foodImages: true,
        variants: true,
        categories: {
          where: {
            isActive: true
          }
        },
        branches: true,
        foodAddons: true,
        campaign: true
      }
    });
    return food;
  }

  async getFoodsByCategory(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        parentId: true,
        isActive: true,
        // if its sub category, check its parent is active or not
        parent: {
          select: {
            isActive: true
          }
        }
      }
    });

    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    if (!category.isActive) {
      return []; // Return empty if subcategory is inactive
    }

    // If it's a subcategory, check if parent is active
    if (category.parentId && !category.parent?.isActive) {
      return [];
    }

    const food = await prisma.food.findMany({
      where: {
        categories: {
          some: {
            AND: [
              // if parenId is null, it's main category, so include it sub category
              // if parentId is not null, it's sub category, so just look for exact match
              category.parentId === null
                ? {
                    OR: [
                      { id: categoryId },
                      {
                        AND: [
                          { parentId: categoryId },
                          { isActive: true } // ensure sub category is active
                        ]
                      }
                    ]
                  }
                : {
                    AND: [
                      { id: categoryId },
                      { isActive: true },
                      {
                        parent: {
                          isActive: true
                        }
                      }
                    ],
                    isActive: true
                  }
            ]
          }
        }
      },
      include: {
        foodImages: true,
        variants: true,
        categories: {
          where: {
            isActive: true
          }
        },
        branches: true,
        foodAddons: true,
        campaign: true
      }
    });
    return food;
  }
}
