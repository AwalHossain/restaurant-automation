import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreatePromotionDto } from "../dtos/promotion.dto";
import { PromotionValidationService } from "../validation/promotion-validation.service";

export class PromotionService {
  constructor(private promotionValidationService: PromotionValidationService) {
    this.promotionValidationService = new PromotionValidationService();
  }
  async createPromotion(input: CreatePromotionDto) {
    // validate all the data
    await this.promotionValidationService.validateCreatePromotion(input);

       // Remove images from input data to avoid Prisma error
       const { images, ...promotionData } = input;


    const result = await prisma.promotion.create({
      data: {
        ...promotionData,
        tenantId:input.tenantId,
        foods: {
          connect: input?.foods?.map(food => ({ id: food }))
        },
        promotionBanner: {
          create: images?.map(image => ({
            url: image.url,
            deviceType: image.deviceType,
            width: image.width,
            height: image.height,
            size: image.size
          }))
        }
      },
      include: {
        promotionBanner: true,
        branch: true
      }
    });
    return result;
  }

  async updatePromotion(id: string, input: Partial<CreatePromotionDto>) {
    // validate all the data
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id }
    });
    if (!existingPromotion) {
      throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
    }

      // Remove images from input to handle them separately
      const { images, ...updateData } = input;

     // Prepare the update data
     const updateObject: any = {
      ...updateData,
      foods: input.foods ? {
        set: input.foods.map(food => ({ id: food }))
      } : undefined
    };

    if (images?.length) {
      updateObject.promotionBanner = {
        deleteMany: {},
        create: images.map(image => ({
          url: image.url,
          deviceType: image.deviceType,
          width: image.width,
          height: image.height,
          size: image.size
        }))
      };
    }

    const result = await prisma.promotion.update({
      where: { id },
      data: updateObject,
      include: {
        promotionBanner: true,
        branch: true
      }
    });
    return result;
  }

  // Add new method to get foods by promotion
async getPromotionFoods(promotionId: string) {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId, isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
    include: {
      foods: {
        include: {
          foodImages: true,
          variants: true,
          categories: true,
          branches: true,
          campaign: true,
          foodAddons: true
        }
      }
    }
  });

  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
  }

  return promotion.foods;
}

  async getActivePromotions() {
    const now = new Date();
    const result = await prisma.promotion.findMany({
      where: {
        isActive: true,
        // startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        promotionBanner: true,
        branch: true,
        userRedemption: true
      },
      orderBy: {
        priority: "desc" // Higher priority promotions first
      }
    });
    console.log(result,'active promotion');
    
    return result;
  }
  async getUpcomingPromotions() {
    const now = new Date();
    const result = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { gt: now } // Start date is in the future
      },
      include: {
        promotionBanner: true,
        branch: true
      },
      orderBy: {
        priority: "asc" //soonest starting promotions first
      }
    });
    return result;
  }

  async getUserPromotionHistory(userId: string) {
    const result = await prisma.userPromotion.findMany({
      where: {
        userId
      },
      include: {
        promotion: {
          include: {
            promotionBanner: true
          }
        }
      },
      orderBy: {
        lastUsedAt: "desc" // Most recent usage first
      }
    });
    return result;
  }

  async checkPromotionEligibility(userId: string, promotionId: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        userRedemption: {
          where: { userId }
        }
      }
    });

    if (!promotion) {
      throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
    }

    // Check if promotion is active
    const now = new Date();
    // now < promotion.startDate ||
    if ( now > promotion.endDate || !promotion.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Promotion is not active");
    }

    // Check overall usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Promotion usage limit reached");
    }

    // Check user-specific usage limit
    const userUsage = promotion.userRedemption[0]?.usageCount || 0;
    if (promotion.maxUsagePerUser && userUsage >= promotion.maxUsagePerUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "You have reached the maximum usage limit for this promotion");
    }

    // If all checks pass, return eligibility status
    return {
      eligible: true,
      remainingUses: promotion.maxUsagePerUser ? promotion.maxUsagePerUser - userUsage : null,
      totalRemainingUses: promotion.usageLimit ? promotion.usageLimit - promotion.usedCount : null
    };
  }

  async trackPromotionUsage(userId: string, promotionId: string) {
    // First check eligibility
    await this.checkPromotionEligibility(userId, promotionId);

    // Use transaction to ensure data consistency
    return prisma.$transaction(async tx => {
      // Increment total usage
      const updatedPromotion = await tx.promotion.update({
        where: { id: promotionId },
        data: {
          usedCount: { increment: 1 }
        }
      });

      // Update or create user redemption record
      const userRedemption = await tx.userPromotion.upsert({
        where: {
          userId_promotionId: {
            userId,
            promotionId
          }
        },
        update: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        },
        create: {
          userId,
          promotionId,
          usageCount: 1,
          lastUsedAt: new Date()
        }
      });

      return {
        promotion: updatedPromotion,
        userRedemption
      };
    });
  }

  async getPromotionById(id: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        promotionBanner: true,
        branch: true,
        userRedemption: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!promotion) {
      throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
    }

    // Add some useful calculated fields
    const now = new Date();
    const isActive = now >= promotion.startDate && now <= promotion.endDate && promotion.isActive;

    const remainingUses = promotion.usageLimit ? promotion.usageLimit - promotion.usedCount : null;

    return {
      ...promotion,
      isCurrentlyActive: isActive,
      remainingUses,
      totalRedemptions: promotion.usedCount
    };
  }


  async getAllPromotions(){
    return await prisma.promotion.findMany();
  }
}