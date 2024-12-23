import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreatePromotionDto } from "../dtos/promotion.dto";

export class PromotionValidationService {
  async validateCreatePromotion(input: CreatePromotionDto) {
    // Validate promo code uniqueness
    const existingPromoCode = await prisma.promotion.findUnique({
      where: { promoCode: input.promoCode }
    });
    if (existingPromoCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Promotion code already exists");
    }

    // Validate dates
    const now = new Date();
    // if (new Date(input.startDate) < now) {
    //   throw new ApiError(httpStatus.BAD_REQUEST, "Start date cannot be in the past");
    // }
    if (new Date(input.endDate) <= new Date(input.startDate)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "End date must be after start date");
    }

    // Validate discount values
    if (input.type === "PERCENTAGE") {
      if (input.value <= 0 || input.value > 100) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Percentage discount must be between 0 and 100");
      }
    } else if (input.type === "FIXED") {
      if (input.value <= 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Fixed discount must be greater than 0");
      }
    }

    // Validate order constraints
    if (input.minOrderAmount && input.minOrderAmount < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Minimum order amount cannot be negative");
    }
    if (input.maxDiscount && input.maxDiscount < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Maximum discount cannot be negative");
    }

    // Validate usage limits
    if (input.usageLimit && input.usageLimit < 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Usage limit must be at least 1");
    }
    if (input.maxUsagePerUser && input.maxUsagePerUser < 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Max usage per user must be at least 1");
    }

    // Validate branch if provided
    if (input.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: input.branchId }
      });
      if (!branch) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid branch ID");
      }
    }

    // Validate promotion banner if provided
    if (input.images?.length) {
      input.images.forEach(image => {
        if (!image.url) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Banner URL is required");
        }
        if (!["MOBILE", "TABLET", "DESKTOP"].includes(image.deviceType)) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid device type for banner");
        }
      });
    }
  }

  async validateUserEligibility(userId: string, promotionId: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: { userRedemption: true }
    });

    if (!promotion) {
      throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
    }

    // Check if promotion is active
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Promotion is not active");
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Promotion usage limit reached");
    }

    // Check user-specific usage
    const userRedemption = promotion.userRedemption.find(r => r.userId === userId);

    if (userRedemption && promotion.maxUsagePerUser && userRedemption.usageCount >= promotion.maxUsagePerUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User has reached maximum usage limit for this promotion");
    }

    // Check user type eligibility
    if (promotion.userType !== "ALL") {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      // Add your user type validation logic here
      // Example: NEW_USER might be based on registration date
    }
  }
}
