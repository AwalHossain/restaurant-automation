import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";

import { CreateFoodInput } from "../dtos/food.dto";
import { CreateVariantInput } from "../dtos/variants.dto";
import { FoodValidationService } from "../validation/food-validation.service";
import { VariantValidationService } from "../validation/variant-validation.service";

import { AddonService } from "./addon.service";
import { VariantService } from "./variants.service";

interface FoodFilter {
  branchId?: string;
  tenantId?: string;
  restaurantId?: string;
}
export class FoodService {
  constructor(
    private readonly foodValidationService: FoodValidationService,
    private readonly variantService: VariantService,
    private readonly addonService: AddonService
  ) {
    this.foodValidationService = new FoodValidationService();
    this.variantService = new VariantService(new VariantValidationService());
    this.addonService = new AddonService();
  }

  private createBaseQuery (filter: FoodFilter) {
    const where:any = {};
    if(filter.tenantId){
      where.tenantId = filter.tenantId
    }
    if(filter.branchId){
      where.OR = [
        {isGlobal: true},
        {targetBranchIds: {
          has: filter.branchId
        }}
      ]
    }
    return where;
  }
  
  // step 1 create basic food
  async createBasicFood(input: CreateFoodInput) {

    // validate input
  const validatedInput = await this.foodValidationService.validateCreateFoodInput(input);
  let targetBranchIds: string[] = [];
  if(input.isGlobal){
    const branches = await prisma.branch.findMany({
      where: {
        tenantId: input.tenantId,
        isActive: true,
        isDeleted: false
      },
      select: {
        id: true
      }
    })
    targetBranchIds = branches.map(branch => branch.id);
  }else{
    targetBranchIds = input.targetBranchIds || []
  }
    const food = await prisma.food.create({
      data: {
        name: input.name,
        tenantId: input.tenantId,
        description: input.description,
        basePrice: input.basePrice,
        minOrderQuantity: input.minOrderQuantity,

        isGlobal: input.isGlobal,
        targetBranchIds: targetBranchIds,
        allowCustomization: input.allowCustomization,
        baseRecipe: input.baseRecipe,
        status: input.status,
        approvalStatus: input.approvalStatus,

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
  async addFoodVariants(foodId: string, tenantId: string, variants: Array<CreateVariantInput>) {
    const createdVariants = await this.variantService.createBulkVariants(foodId, tenantId,  variants);
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
  // First verify the user exists
  const userExists = await prisma.user.findUnique({
    where: { id: input.updatedBy }
});

if (!userExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, `User with ID ${input.updatedBy} not found`);
}

// branchDate assignme
const branchDate = input.isGlobal ? {isGlobal: true, targetBranchIds: input.targetBranchIds} : {isGlobal: false, targetBranchIds:input.branchIds || []}

  
    const updatedFood = await prisma.food.update({
      where: { id: input.id },
      data: {
        ...branchDate,
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
          set: input?.categoryIds?.map(id => ({ id }))
        },
        updatedById: input.updatedBy,
        ...(input.images?.length && {
          foodImages:{
            deleteMany:{},
            create:input.images.map(image=>({
              url:image.url,
              deviceType: image.deviceType,
              width: image.width,
              height: image.height,
              size: image.size
            }))
          }
        })
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

  async getAllFoods(branchId?: string) {
    const baseWhere = this.createBaseQuery({branchId})
    const foods = await prisma.food.findMany({
      where: baseWhere,
      include: {
        foodImages: true,
        variants: true,
        categories: true,
        foodAddons: {
          include: {
            addon: true
          }
        }
      }
    });
    return foods;
  }  

  async getFoodById(foodId: string, tenantId:string, branchId?:string) {
    const baseWhere = this.createBaseQuery({tenantId, branchId,})
    console.log(baseWhere, "baseWhere", tenantId,branchId);
    
    const food = await prisma.food.findFirst({
      where: { id: foodId, 
        // isGlobal: true,
        // targetBranchIds:{
        //   has: branchId
        // }
      },
      include: {
        foodImages: true,
        variants: true,
        categories: true,
        branches: true,
        campaign: true,
        foodAddons: true,
        branchFood: true
      }
    });

    console.log(food, "food");
    
    return food;
  }

  async getFoodByMainCategoryId(id: string, tenantId: string, branchId?:string) {
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
                  { id, isActive: true, tenantId: tenantId }, // main caegory
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

  async getFoodBySubCategoryId(subCategoryId: string, tenantId: string, branchId?:string) {
    // verify this is active sub-category
    const baseWhere = this.createBaseQuery({tenantId, branchId,})
    const subCategory = await prisma.category.findUnique({
      where: { id: subCategoryId,
       },
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
              { id: subCategoryId },
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

  async getFoodsByCategory(categoryId: string, tenantId:string, branchId?:string) {
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


  // // copy food to branch
  // async copyFoodToBranches(tx: Prisma.TransactionClient, foodId: string, tenantId: string) {
  //   const globalFood = await tx.food.findFirst({
  //     where: { id: foodId, tenantId: tenantId, 
  //       OR: [
  //         {
  //           id: foodId,
  //           isGlobal: true,
  //           tenantId: tenantId
  //         },
  //         {
  //           id: foodId,
  //           tenantId: tenantId,
  //         }
  //       ]
  //      },
  //      include: {
  //       foodImages: true,
  //       variants: true,
  //       categories: true,
  //       foodAddons: {
  //         include: {
  //           addon: true
  //         }
  //       },
  //      }
  //   });

  //   if(!globalFood){
  //     throw new ApiError(httpStatus.NOT_FOUND, "Global Food Template not found");
  //   }
  //   console.log(globalFood, "globalFood", tenantId);
    
  // // 2. Validate that all target branches exist
  // const existingBranches = await tx.branch.findMany({
  //   where: {
  //     id: {
  //       in: globalFood.targetBranchIds
  //     },
  //     tenantId: tenantId,
  //     isActive: true
  //   },
  //   select: { id: true }
  // });

  // console.log(existingBranches, "existingBranches");

  // const validBranchIds = existingBranches.map(branch => branch.id);

  // if (validBranchIds.length === 0) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "No valid active branches found for copying");
  // }


  //     // 2. Create foods for each target branch
  //     const branchFoods = await Promise.all(globalFood.targetBranchIds.map(async (branchId) => {
  //       // create the branch food
  //       const branchFood = await tx.branchFood.create({
  //         data:{
  //           tenantId: tenantId,
  //           branchId: branchId,
  //           foodId: globalFood.id,

  //           // copy the food details
  //           name: globalFood.name,
  //           description: globalFood.description,
  //           basePrice: globalFood.basePrice,

  //           // copy settings 
  //           allowCustomization: globalFood.allowCustomization,
  //           baseRecipe: globalFood.baseRecipe ||  undefined,
  //           status: 'PUBLISHED',

  //                 // Copy marketing fields
  //         isActive: true,
  //         isPopular: globalFood.isPopular,
  //         isRecommended: globalFood.isRecommended,
  //         isNewArrival: globalFood.isNewArrival,
  //         isFeatured: globalFood.isFeatured,

  //          // Copy pricing
  //           minOrderQuantity: globalFood.minOrderQuantity,
          
  //                   // Copy availability config
  //           availabilityConfig: globalFood.availabilityConfig || undefined,
  //             //  Copy images
  //            defaultImageUrl: globalFood.defaultImageUrl,
  //            foodImages: {
  //             create: globalFood.foodImages.map(image => ({
  //               url: image.url,
  //               deviceType: image.deviceType,
  //               width: image.width,
  //               height: image.height,
  //               size: image.size
  //             }))
  //           },

  //                  // Copy categories
  //         categories: {
  //           connect: globalFood.categories.map(category => ({
  //             id: category.id
  //           }))
  //         },

  //              // Variants - only create if exists
  //       variants: globalFood.variants.length > 0 ? {
  //         create: globalFood.variants.map(variant => ({
  //           tenantId: globalFood.tenantId,
  //           branchId: branchId,
  //           name: variant.name,
  //           description: variant.description,
  //           basePrice: variant.basePrice,
  //           isRequired: variant.isRequired,
  //           isActive: true,
  //           isAvailable: true,
  //           originalVariantId: variant.id
  //         }))
  //       } : undefined,

  //      // Addons - only create if exists
  //      addons: globalFood.foodAddons.length > 0 ? {
  //       create: globalFood.foodAddons.map(foodAddon => ({
  //         branchId: branchId,
  //         tenantId: globalFood.tenantId,
  //         name: foodAddon.addon.name,
  //         price: foodAddon.addon.price,
  //         description: foodAddon.addon.description,
  //         maxSelections: foodAddon.maxSelections,
  //         isRequired: foodAddon.isRequired,
  //         displayOrder: foodAddon.displayOrder,
  //         isActive: true,
  //         isAvailable: true,
  //         originalAddonId: foodAddon.addon.id,
  //         preparationTime: foodAddon.addon.preparationTime,
  //         allergens: foodAddon.addon.allergens,
  //         nutritionInfo: foodAddon.addon.nutritionInfo || undefined,
  //         imageUrl: foodAddon.addon.imageUrl
  //       }))
  //     } : undefined,
  //         }
  //       })

  //       return branchFood;
  //     }))

  //     return branchFoods;
  // }



  // // update the approval process to trigger the copy food to branch
  // async approveFoodTemplate(foodId: string, tenantId: string, userId: string) {
  //  // 1. update the approval status to approved
  //   const updatedFood = await prisma.$transaction(async (tx) => {
  //     const food = await tx.food.update({
  //       where: { id: foodId, 
  //         tenantId: tenantId,
  //       approvalStatus: "PENDING"
  //      },
  //      data: {
  //       approvalStatus: "APPROVED",
  //       updatedById: userId
  //      }
  //   })



  //       //2. if approval is approved, then copy the food to all branches
  //       if(food.isGlobal || food.targetBranchIds.length > 0){
  //     await this.copyFoodToBranches(tx, foodId, tenantId);
  //   }
  //   return food;
  // })
  // }
}