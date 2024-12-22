import { z } from 'zod';

export const createAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isDefault: z.boolean().optional(),
  label: z.string().optional(),
  additionalDirections: z.string().optional(),
});

export const updateAddressSchema = createAddressSchema.partial().extend({
  id: z.string().cuid(),
}); 