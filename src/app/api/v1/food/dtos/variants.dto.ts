import { z } from "zod";

export type CreateVariantInput = {
  name: string;
  basePrice: number;
  isActive?: boolean;
  isRequired?: boolean;
  foodId: string;
  tenantId: string;
};

export type UpdateVariantInput = {
  id: string;
  variantId: string;
  name?: string;
  basePrice?: number;
  isActive?: boolean;
  isRequired?: boolean;
};

export type VariantResponse = {
  id: string;
  name: string;
  basePrice: number;
  isActive: boolean;
  isRequired: boolean;
  foodId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Zod schema for validation
export const createVariantSchema = z.object({
  name: z.string().min(2, "Variant name must be at least 2 characters"),
  basePrice: z.number().min(0, "Price cannot be negative"),
  isActive: z.boolean().optional().default(true),
  isRequired: z.boolean().optional().default(false),
  foodId: z.string().cuid("Invalid food ID")
});

export const updateVariantSchema = createVariantSchema.partial().extend({
  id: z.string().cuid("Invalid variant ID")
});
