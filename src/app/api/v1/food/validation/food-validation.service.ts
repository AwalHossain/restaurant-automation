import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreateFoodInput } from "../dtos/food.dto";

// @Injectable()
export class FoodValidationService {
  async validateCreateFoodInput(input: CreateFoodInput) {
    // basic validation
    if (input.basePrice <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Base price must be greater than 0");
    }

    if (input.minOrderQuantity < 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Minimum order quantity must be at least 1");
    }

    // Validate categories exist
    const categories = await prisma.category.findMany({
      where: { id: { in: input?.categoryIds } }
    });
    if (categories.length !== input?.categoryIds?.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "One or more category IDs are invalid");
    }

    // validate variants exist
    if (input.variants?.length) {
      this.validateVariants(input.variants);
    } else if (input.isVariantRequired) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Variants are required for this food item");
    }

    //     // Validate at least one image is present
    if (!input.images?.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "At least one image is required");
    }
    // Validate image types
    const hasRequiredDeviceTypes = input.images.some(img => img.deviceType === "MOBILE");
    if (!hasRequiredDeviceTypes) {
      throw new ApiError(httpStatus.BAD_REQUEST, "At least one mobile image is required");
    }

    // Validate time formats if provided
    if (input.availableStartTime || input.availableEndTime) {
      this.validateTimeFormat(input.availableStartTime, "Available start time");
      this.validateTimeFormat(input.availableEndTime, "Available end time");
    }

    if (input.trendingStartTime || input.trendingEndTime) {
      this.validateTimeFormat(input.trendingStartTime, "Trending start time");
      this.validateTimeFormat(input.trendingEndTime, "Trending end time");
    }

    // Validate discounted price if discount is enabled
    if (input.haveDiscount && (!input.discountedPrice || input.discountedPrice >= input.basePrice)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Discounted price must be less than base price");
    }
  }

  private validateVariants(variants: CreateFoodInput["variants"]) {
    // check for duplicate names
    const variantNames = new Set();
    variants?.forEach(variants => {
      if (variantNames.has(variants.name.toLowerCase())) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Duplicate variant names are not allowed");
      }
      variantNames.add(variants.name.toLowerCase());

      // validate base price
      if (variants.basePrice <= 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Base price must be greater than 0");
      }
    });
  }

  async validateUpdateFoodInput(input: CreateFoodInput) {
    // Validate food exists
    const existingFood = await prisma.food.findUnique({
      where: { id: input.id }
    });

    if (!existingFood) {
      throw new ApiError(httpStatus.NOT_FOUND, "Food item not found");
    }

    // Basic validation
    if (input.basePrice && input.basePrice <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Base price must be greater than 0");
    }

    if (input.minOrderQuantity && input.minOrderQuantity < 1) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Minimum order quantity must be at least 1");
    }

    // Validate categories if provided
    if (input.categoryIds?.length) {
      const categories = await prisma.category.findMany({
        where: { id: { in: input.categoryIds } }
      });
      if (categories.length !== input.categoryIds.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, "One or more category IDs are invalid");
      }
    }

    // Validate variants if provided
    if (input.variants?.length) {
      this.validateVariants(input.variants);
    }

    // Validate images if provided
    if (input.images?.length) {
      // Validate at least one mobile image exists
      const hasRequiredDeviceTypes = input.images.some(img => img.deviceType === "MOBILE");
      if (!hasRequiredDeviceTypes) {
        throw new ApiError(httpStatus.BAD_REQUEST, "At least one mobile image is required");
      }
    }

    // Validate time formats if provided
    if (input.availableStartTime || input.availableEndTime) {
      this.validateTimeFormat(input.availableStartTime, "Available start time");
      this.validateTimeFormat(input.availableEndTime, "Available end time");
    }

    if (input.trendingStartTime || input.trendingEndTime) {
      this.validateTimeFormat(input.trendingStartTime, "Trending start time");
      this.validateTimeFormat(input.trendingEndTime, "Trending end time");
    }

    // Validate discounted price if discount is enabled
    if (input.haveDiscount && (!input.discountedPrice || input.discountedPrice >= input.basePrice)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Discounted price must be less than base price");
    }
  }

  private validateTimeFormat(time: string | undefined, fieldName: string) {
    if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} must be in 24-hour format (HH:mm)`);
    }
  }
}
