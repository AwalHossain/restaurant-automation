import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreateFoodInput } from "../dtos/food.dto";

// @Injectable()
export class FoodValidationService {

  private readonly createFoodSchema = z.object({
    name: z.string().min(2, "Food name must be at least 2 characters"),
    tetantId: z.string({required_error: "Tenant id is required"}),
    targetBranchIds: z.array(z.string()).optional(),
    allowCustomization: z.boolean().optional(),
    baseRecipe: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),

    isGlobal: z.boolean().optional(),

    description: z.string().optional(),
    basePrice: z.number().min(0, "Base price must be greater than 0"),
    minOrderQuantity: z.number().min(1, "Minimum order quantity must be at least 1"),
    
    // Boolean flags
    isPopular: z.boolean().optional(),
    isRecommended: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    freeDelivery: z.boolean().optional(),
    specialDeliveryFee: z.boolean().optional(),
    haveDiscount: z.boolean().optional(),
    topSnacks: z.boolean().optional(),
    dynamicHome: z.boolean().optional(),
    trending: z.boolean().optional(),
    isFree: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isDefaultImage: z.boolean().optional(),
    
    // Price related
    discountedPrice: z.number().optional(),
    
    // Time related
    availableStartTime: z.string().optional(),
    availableEndTime: z.string().optional(),
    trendingStartTime: z.string().optional(),
    trendingEndTime: z.string().optional(),
    expiryDate: z.string().optional(), // or z.date() if you're passing Date objects
    
    // Relations and IDs
    categoryIds: z.array(z.string()),
    campaignId: z.string().optional(),
    
    // Arrays
    images: z.array(z.object({
      url: z.string(),
      deviceType: z.enum(['MOBILE', 'TABLET', 'DESKTOP']),
      width: z.number(),
      height: z.number(),
      size: z.number()
    })).min(1, "At least one image is required"),
    
    // Variants
    variants: z.array(z.object({
      name: z.string(),
      basePrice: z.number().min(0, "Variant base price must be greater than 0"),
      isRequired: z.boolean().optional()
    })).optional(),
    
    // Additional fields
    offer: z.string().optional(),
  });

  async validateCreateFoodInput(input: CreateFoodInput) {
    // basic validation
    console.log(input, "input");
    
      // Validate branch assignments
  if (!input.isGlobal && (!input.targetBranchIds || input.targetBranchIds.length === 0)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST, 
      "At least one branch must be selected when food is not global"
    );
  }

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

    const updateSchema = this.createFoodSchema.partial();

    try {
      await updateSchema.parseAsync(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      throw error;
    }

    console.log(input.categoryIds?.length, "input.categoryIds.length");

    // Validate categories if provided && check empty string
// In your validation service
if (Array.isArray(input.categoryIds)) {
  // Filter out empty strings and undefined values
  const validCategoryIds = input.categoryIds.filter(id => id && id.trim().length > 0);
  
  // If array is empty or contains only empty strings
  if (validCategoryIds.length === 0) {
    // Either throw error or allow empty (depending on your business logic)
    throw new ApiError(httpStatus.BAD_REQUEST, "At least one valid category ID is required");
  }

  // Validate the remaining category IDs exist in database
  const categories = await prisma.category.findMany({
    where: { id: { in: validCategoryIds } }
  });
  
  if (categories.length !== validCategoryIds.length) {
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

    return input;
  }

  private validateTimeFormat(time: string | undefined, fieldName: string) {
    if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} must be in 24-hour format (HH:mm)`);
    }
  }
}
