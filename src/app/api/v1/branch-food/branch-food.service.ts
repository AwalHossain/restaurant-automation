import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../../errors/ApiError";
import { CacheService } from "../../../../shared/cache/cache.service";
import { prisma } from "../../../../shared/prisma";
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from "../../../../types/permission.types";
import { CreateBranchVariantInput } from "../../../branch-variant/branch-variant.dto";
import { BranchVariantService } from "../../../branch-variant/branch-variant.service";
import { UserRoleService } from "../role-permission/services/userRoleService";
import { BranchFoodValidationService } from "./branch-food.validation";
import { CreateBranchFoodInput } from "./branch.dto";



interface FoodFilter {
  branchId?: string;
  tenantId?: string;
  restaurantId?: string;
}
export class BranchFoodService {
  private readonly branchFoodValidationService: BranchFoodValidationService
  private readonly branchVariantService: BranchVariantService
  private readonly userRoleService: UserRoleService

  constructor() {
    this.branchFoodValidationService = new BranchFoodValidationService();
    this.branchVariantService = new BranchVariantService();
    this.userRoleService = new UserRoleService();

  }

  private readonly cacheService = CacheService.getInstance();





  private createBaseQuery(filter: FoodFilter) {
    const where: any = {};
    if (filter.tenantId) {
      where.tenantId = filter.tenantId
    }
    if (filter.branchId) {
      where.OR = [
        { isGlobal: true },
        {
          targetBranchIds: {
            has: filter.branchId
          }
        }
      ]
    }
    return where;
  }

  // step 1 create basic food
  async createBasicBranchFood(input: CreateBranchFoodInput) {

    // validate input
    const validatedInput = await this.branchFoodValidationService.validateCreateFoodInput(input);
    const food = await prisma.branchFood.create({
      data: {
        name: input.name,
        tenantId: input.tenantId,
        branchId: input.branchId,
        description: input.description,
        basePrice: input.basePrice,
        minOrderQuantity: input.minOrderQuantity,

        allowCustomization: input.allowCustomization,
        baseRecipe: input.baseRecipe,
        status: input.status,

        foodImages: {
          create: input.images.map(image => ({
            url: image.url,
            deviceType: image.deviceType,
            width: image.width,
            height: image.height,
            size: image.size
          }))
        },
        branchCategories: {
          connect: input?.categoryIds?.map(id => ({ id }))
        },
        createdById: input.userId
      },
      include: {
        branch: true
      }
    },
    );
    return food;
  }

  // step 2: Add Variants
  async addBranchFoodVariants(foodId: string, tenantId: string, branchId: string, variants: Array<CreateBranchVariantInput>) {
    const createdVariants = await this.branchVariantService.createBulkBranchVariants(foodId, tenantId, branchId, variants);
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

  async updateBranchFoodDetails(input: CreateBranchFoodInput) {
    console.log(input, "input");

    // First verify the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: input.userId }
    });

    if (!userExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, `User with ID ${input.updatedBy} not found`);
    }

    const updatedFood = await prisma.branchFood.update({
      where: { id: input.foodId },
      data: {
        name: input.name,
        description: input.description,
        basePrice: input.basePrice,
        baseRecipe: input.baseRecipe,
        allowCustomization: input.allowCustomization,
        status: input.status,
        minOrderQuantity: input.minOrderQuantity,
        isPopular: input.isPopular,
        isRecommended: input.isRecommended,
        isNewArrival: input.isNewArrival,
        freeDelivery: input.freeDelivery,
        specialDeliveryFee: input.specialDeliveryFee,
        haveDiscount: input.haveDiscount,
        discountedPrice: input.discountedPrice,
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
        branchCategories: {
          set: input?.categoryIds?.map(id => ({ id }))
        },
        updatedById: input.updatedBy,

        ...(input.images?.length && {
          foodImages: {
            deleteMany: {},
            create: input.images.map(image => ({
              url: image.url,
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
        branchVariants: true,
        branchCategories: true,
        branch: true


      }
    });
    return updatedFood;
  }

  // get all branch all food
  async getAllFoods(tenantId: string, user: JwtPayload) {
    // Check roles and permissions
    const isRestaurantAdmin = user.location?.role === RRole.RESTAURANT_ADMIN;
    const isBranchManager = user.location?.role === RRole.BRANCH_MANAGER;

    const hasRestaurantPermission = user.permissions?.includes(RPN.MANAGE_RESTAURANT_BRANCHES);
    const hasBranchFoodPermission = user.permissions?.includes(BPN.MANAGE_BRANCH_FOOD);
    const hasViewPermission = user.permissions?.includes(BPN.BRANCH_VIEW_FOOD || RPN.VIEW_RESTAURANT_FOOD);



    let food: any;

    console.log(tenantId, "tenantId", user.branchId, "branchId", "hasBranchFoodPermission", isBranchManager, 'restaurant admin', isRestaurantAdmin, 'restaurant permission', hasRestaurantPermission);




    if (hasBranchFoodPermission || isBranchManager || hasViewPermission) {
      food = await prisma.branchFood.findMany({
        where: {
          tenantId: tenantId,
          branchId: user.branchId
        },
        include: {
          foodImages: true,
          branchVariants: true,
          branchCategories: true,
          branch: true,
          branchAddons: true,
        }

      })
      return [
        ...food,
        {
          type: "BRANCH"
        }
      ]




    } else if (hasRestaurantPermission || isRestaurantAdmin) {
      food = await prisma.branchFood.findMany({
        where: {
          tenantId: tenantId,
        },
        include: {
          foodImages: true,
          branchVariants: true,
          branchCategories: true,
          branch: true,
          branchAddons: true,


        }
      })

      return [
        ...food,  
        {
          type: "RESTAURANT",
        }
      ]


    } else {
      food = await prisma.branchFood.findMany({

        where: {
          tenantId: tenantId,
          branchId: user.branchId
        },
      })

      return [
        {
          type: "PUBLIC",
        },
        ...food,
      ]
    }
  }




  // get all food belongs to a branch
  async getAllFoodsbyBranchId(tenantId: string, branchId: string) {
    const foods = await prisma.branchFood.findMany({
      where: {
        tenantId: tenantId,
        branchId: branchId
      },
      include: {
        foodImages: true,
        branchVariants: true,
        branchCategories: true,
        branch: true
      }

    });
    return foods;
  }

  async getBranchFoodById(foodId: string, tenantId: string, branchId?: string) {
    const baseWhere = this.createBaseQuery({ tenantId, branchId, })
    console.log(baseWhere, "baseWhere", tenantId, branchId);

    const food = await prisma.branchFood.findUnique({
      where: {
        id: foodId,
        tenantId: tenantId,
        branchId: branchId,
        // isGlobal: true,
        // targetBranchIds:{
        //   has: branchId
        // }
      },
      include: {
        foodImages: true,
        branchVariants: true,
        branchCategories: {
          select:{

            name: true,
            id: true,
            isActive: true,
            parentId: true,
          }
        },
        branch: {
          select:{
            name: true,
            id: true,
            isActive: true,
            tenantId: true,
            restaurantId: true,
          }
        },
        branchAddons: true
      }
    });

    console.log(food, "food");

    return food;
  }

  async getBranchFoodByMainCategoryId(id: string, tenantId: string, branchId?: string) {
    // check i main category is active or not
    console.log(id, "id services", tenantId, "tenantId services", branchId, "branchId services");
    const mainCategory = await prisma.branchCategory.findUnique({
      where: { id, branchId, tenantId },
      select: { isActive: true }
    });
    console.log(mainCategory, "mainCategory");


    if (!mainCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Main category not found");
    }

    if (!mainCategory.isActive) {
      return []; // Return empty if main category is inactive
    }

    const food = await prisma.branchFood.findMany({
      where: {
        branchCategories: {
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
        branchVariants: true,
        branchAddons: true,
        branch: true,
        // foodAddons: true,
        // campaign: true
      }

    });
    return food;
  }

  async getBranchFoodBySubCategoryId(subCategoryId: string, tenantId: string, branchId?: string) {
    // verify this is active sub-category
    const baseWhere = this.createBaseQuery({ tenantId, branchId, })
    const subCategory = await prisma.branchCategory.findUnique({

      where: {
        id: subCategoryId,
        branchId: branchId,
        tenantId: tenantId,
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

    const food = await prisma.branchFood.findMany({
      where: {
        branchCategories: {
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
        branchVariants: true,
        branchCategories: {
          where: {

            isActive: true
          }
        },

        branch: true,
        // foodAddons: true,
        // campaign: true
      }
    });
    return food;
  }

  async getBranchFoodsByCategory(categoryId: string, tenantId: string, branchId?: string) {
    console.log(branchId, "branchId services", tenantId, "tenantId services");
    
    const category = await prisma.branchCategory.findUnique({
      where: { id: categoryId, branchId: branchId, tenantId: tenantId },
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
    console.log(category, "category");

    const food = await prisma.branchFood.findMany({
      where: {
        branchCategories: {
          some: {
            AND: [
              // if parenId is null, it's main category, so include it sub category
              // if parentId is not null, it's sub category, so just look for exact match
              category.parentId === null

                ? {
                  OR: [
                    { id: categoryId, branchId: branchId, tenantId: tenantId },
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
                    { id: categoryId, branchId: branchId, tenantId: tenantId },
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
        branchVariants: true,
        branchCategories: {
          where: {
            isActive: true
          }
        },
        branch: true,
        branchAddons: true
      }
    });

    console.log(food, "food");

    if(!food){
      throw new ApiError(httpStatus.NOT_FOUND, "No food found in this category");
    }

    return food;
  }



}