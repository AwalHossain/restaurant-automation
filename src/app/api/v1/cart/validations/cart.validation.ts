import httpStatus from 'http-status';
import { z } from 'zod';
import ApiError from '../../../../../errors/ApiError';
import { prisma } from '../../../../../shared/prisma';

export const addToCartSchema = z.object({
  foodId: z.string().cuid(),
  branchId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().min(1).max(99),
  addons: z.array(z.object({
    addonId: z.string().cuid(),
    quantity: z.number().min(1).max(99)
  })).optional()
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(1).max(99)
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>; 


class CartValidation {

  private async validateCartOperation(
    foodId: string,
    branchId: string,
    variantId?: string,
    addons?: { addonId: string; quantity: number }[]
  ) {
    // Check if food exists and is available in branch
    const branchFood = await prisma.branchFood.findFirst({
      where: {
        foodId,
        branchId,
        isAvailable: true
      },
      include: {
        food: true
      }
    });
  
    if (!branchFood) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Food not available in this branch');
    }
  
    // Validate variant if provided
    if (variantId) {
      const variant = await prisma.foodVariant.findFirst({
        where: {
          id: variantId,
          foodId,
          isActive: true
        }
      });
  
      if (!variant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Variant not found or not available');
      }
    }
  
    // Validate addons if provided
    if (addons?.length) {
      for (const addon of addons) {
        const foodAddon = await prisma.foodAddon.findFirst({
          where: {
            foodId,
            addonId: addon.addonId,
            isActive: true
          },
          include: {
            addon: true
          }
        });
  
        if (!foodAddon) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Addon ${addon.addonId} not available for this food`
          );
        }
  
        // Check addon quantity limits
        if (addon.quantity > foodAddon.maxSelections) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Maximum ${foodAddon.maxSelections} selections allowed for ${foodAddon.addon.name}`
          );
        }
      }
    }
  }
}

export const cartValidation = new CartValidation()