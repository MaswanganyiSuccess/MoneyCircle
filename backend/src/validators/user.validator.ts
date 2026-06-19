import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().default('createdAt'),
  role: z.enum(['borrower', 'lender']).optional(),
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  search: z.string().optional(),
});