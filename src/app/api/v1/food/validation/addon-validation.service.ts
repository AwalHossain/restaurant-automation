import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreateAddonInput } from "../dtos/addon.dto";

// Input type definitions
type BulkAddonInput = {
  addonId: string;
  maxSelections?: number;
  isRequired?: boolean;
  displayOrder?: number;
};

export class AddOnValidationService {
  // Validation schema for addon creation
  private readonly createAddonSchema = z.object({
    name: z
      .string()
      .min(2, "Addon name must be at least 2 characters")
      .max(50, "Addon name cannot exceed 50 characters"),

    price: z.number().min(0, "Price cannot be negative").max(999999.99, "Price is too high"),

    description: z.string().max(200, "Description cannot exceed 200 characters").optional(),

    category: z.enum(["TOPPING", "SAUCE", "SIDE", "DRINK", "EXTRA"]),

    imageUrl: z.string().url("Invalid image URL"),

    imageSize: z.number().max(5 * 1024 * 1024, "Image size cannot exceed 5MB"),

    preparationTime: z
      .number()
      .int("Preparation time must be a whole number")
      .min(0, "Preparation time cannot be negative")
      .max(180, "Preparation time cannot exceed 180 minutes")
      .optional(),

    allergens: z.array(z.string()).max(20, "Too many allergens listed").optional(),

    nutritionInfo: z.record(z.any()).optional(),

    createdById: z.string().uuid("Invalid creator ID"),
    updatedById: z.string().uuid("Invalid updater ID")
  });

  // Validation schema for addon group creation
  private readonly createAddonGroupSchema = z.object({
    name: z
      .string()
      .min(2, "Group name must be at least 2 characters")
      .max(50, "Group name cannot exceed 50 characters"),

    isRequired: z.boolean(),

    maxSelectionsAllowed: z
      .number()
      .int("Maximum selections must be a whole number")
      .min(1, "Maximum selections must be at least 1")
      .max(20, "Maximum selections cannot exceed 20"),

    addons: z.array(
      z.object({
        addonId: z.string().cuid("Invalid addon ID")
      })
    )
  });

  // Validation method for single addon
  async validateCreateAddonInput(input: CreateAddonInput): Promise<void> {
    try {
      // name validation
      if (!input.name || input.name.trim() === "") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Addon name is required");
      }
      await this.createAddonSchema.parseAsync(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      throw error;
    }
  }



  // Validation for addon price
  validateAddonPrice(price: number): void {
    if (price < 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Addon price cannot be negative");
    }
    if (price > 999999.99) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Addon price exceeds maximum allowed value");
    }
  }

  // Validation for addon relationships
  validateAddonRelationships(foodId: string, addonId: string): void {
    if (!foodId || !addonId) {
      throw new Error("Both food ID and addon ID are required");
    }
  }

  // Validation for addon quantities
  validateAddonQuantities(input: { maxQuantity: number; minQuantity: number; defaultQuantity: number }): void {
    const { maxQuantity, minQuantity, defaultQuantity } = input;

    if (minQuantity < 0) {
      throw new ApiError(400, "Minimum quantity cannot be negative");
    }
    if (maxQuantity < minQuantity) {
      throw new ApiError(400, "Maximum quantity cannot be less than minimum quantity");
    }
    if (defaultQuantity < minQuantity || defaultQuantity > maxQuantity) {
      throw new ApiError(400, "Default quantity must be between minimum and maximum quantities");
    }
  }

  // Validation for addon update
  async validateUpdateAddonInput(input: Partial<CreateAddonInput>): Promise<void> {
    // Create a partial schema for updates
    const updateSchema = this.createAddonSchema.partial();

    try {
      await updateSchema.parseAsync(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      throw error;
    }
  }

  // Validation for bulk operations
  // Validation for bulk operations
  async validateBulkAddonIds(addonIds: BulkAddonInput[]): Promise<void> {
    console.log(addonIds, "addonIds");
    if (addonIds.length === 0) {
      throw new ApiError(400, "At least one addon is required");
    }
    if (!addonIds.every(addon => 
      typeof addon === 'object' && 
      'addonId' in addon && 
      typeof addon.addonId === 'string'
    )) {
      throw new ApiError(400, "Invalid addon format - each item must have a valid addonId");
    }

    // check if addonId is valid
    const result = await prisma.addon.findMany({
      where: {
        id: {
          in: addonIds.map(addon => addon.addonId)
        }
      }
    });

    console.log(result, "result");

    if (result.length !== addonIds.length) {
      throw new ApiError(400, "Invalid addon IDs");
    }


    const addonIdSet = new Set(addonIds.map(addon => addon.addonId));
    // console.log(addonIdSet, "addonIdSet", addonIds.length);

    if (addonIdSet.size !== addonIds.length) {
      throw new ApiError(400, "Duplicate addon IDs are not allowed");
    }
  }
}
