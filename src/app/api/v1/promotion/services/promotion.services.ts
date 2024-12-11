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

    const result = await prisma.promotion.create({
      data: {
        ...input,
        promotionBanner: {
          create: input?.images?.map(image => ({
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
  }

  async updatePromotion(id: string, input: Partial<CreatePromotionDto>) {
    // validate all the data
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id }
    });
    if (!existingPromotion) {
      throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
    }

    const result = await prisma.promotion.update({
      where: { id },
      data: {
        ...input,
        promotionBanner: {
          deleteMany: {},
          create: input?.images?.map(image => ({
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

  async getActivePromotions() {
    const now = new Date();
    return prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
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
  }
  async getUpcomingPromotions() {
    const now = new Date();
    return prisma.promotion.findMany({
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
  }

  async getUserPromotionHistory(userId: string) {
    return prisma.userPromotion.findMany({
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
    if (now < promotion.startDate || now > promotion.endDate || !promotion.isActive) {
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
}
