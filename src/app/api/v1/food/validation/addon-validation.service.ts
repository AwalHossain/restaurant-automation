import { z } from "zod";
import ApiError from "../../../../../errors/ApiError";
import { CreateAddonGroupInput, CreateAddonInput } from "../dtos/addon.dto";

// Input type definitions

export class AddOnValidationService {
  // Validation schema for addon creation
  private readonly createAddonSchema = z.object({
    name: z.string()
      .min(2, "Addon name must be at least 2 characters")
      .max(50, "Addon name cannot exceed 50 characters"),
    
    price: z.number()
      .min(0, "Price cannot be negative")
      .max(999999.99, "Price is too high"),
    
    description: z.string()
      .max(200, "Description cannot exceed 200 characters")
      .optional(),
    
    category: z.enum([
      'TOPPING',
      'SAUCE',
      'SIDE',
      'DRINK',
      'EXTRA'
    ]).optional(),
    
    imageUrl: z.string().url("Invalid image URL").optional(),
    
    size: z.number()
    .max(5 * 1024 * 1024, "Image size cannot exceed 5MB")
    .optional(),
    
    preparationTime: z.number()
      .int("Preparation time must be a whole number")
      .min(0, "Preparation time cannot be negative")
      .max(180, "Preparation time cannot exceed 180 minutes")
      .optional(),
    
    allergens: z.array(z.string())
      .max(20, "Too many allergens listed")
      .optional(),
    
    nutritionInfo: z.record(z.any())
      .optional(),
    
    createdById: z.string().uuid("Invalid creator ID"),
    updatedById: z.string().uuid("Invalid updater ID")
  });

  // Validation schema for addon group creation
  private readonly createAddonGroupSchema = z.object({
    name: z.string()
      .min(2, "Group name must be at least 2 characters")
      .max(50, "Group name cannot exceed 50 characters"),
    
    isRequired: z.boolean(),
    
    maxSelectionsAllowed: z.number()
      .int("Maximum selections must be a whole number")
      .min(1, "Maximum selections must be at least 1")
      .max(20, "Maximum selections cannot exceed 20"),
    
    addons: z.array(this.createAddonSchema)
      .min(1, "Addon group must contain at least one addon")
      .max(50, "Too many addons in group")
  });

  // Validation method for single addon
  async validateCreateAddonInput(input: CreateAddonInput): Promise<void> {
    try {
      await this.createAddonSchema.parseAsync(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      throw error;
    }
  }

  // Validation method for addon group with its addons
  async validateCreateAddonGroupInput(input: CreateAddonGroupInput): Promise<void> {
    try {
      await this.createAddonGroupSchema.parseAsync(input);
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
      throw new ApiError(400, "Addon price cannot be negative");
    }
    if (price > 999999.99) {
      throw new ApiError(400, "Addon price exceeds maximum allowed value");
    }
  }

  // Validation for addon relationships
  validateAddonRelationships(foodId: string, addonId: string): void {
    if (!foodId || !addonId) {
      throw new Error("Both food ID and addon ID are required");
    }
  }

  // Validation for addon quantities
  validateAddonQuantities(input: {
    maxQuantity: number;
    minQuantity: number;
    defaultQuantity: number;
  }): void {
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
  validateBulkAddonIds(addonIds: string[]): void {
    if (!Array.isArray(addonIds)) {
      throw new ApiError(400, "Invalid addon IDs format");
    }
    if (addonIds.length === 0) {
      throw new ApiError(400, "At least one addon ID is required");
    }
    if (new Set(addonIds).size !== addonIds.length) {
      throw new ApiError(400, "Duplicate addon IDs are not allowed");
    }
  }
}
