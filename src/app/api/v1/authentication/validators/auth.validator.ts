import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
}); 
