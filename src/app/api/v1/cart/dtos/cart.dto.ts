import { z } from 'zod'

export const addToCartSchema = z.object({
  foodId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().min(1),
  addons: z.array(z.object({
    addonId: z.string(),
    quantity: z.number().min(1)
  })).optional(),
  branchId: z.string()
})

export const updateCartItemSchema = z.object({
  cartItemId: z.string(),
  quantity: z.number().min(1)
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema> 