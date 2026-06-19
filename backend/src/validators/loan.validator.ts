import { z } from 'zod';

export const applyLoanSchema = z.object({
  amount: z.number().min(5000, 'Minimum loan amount is R5,000').max(500000, 'Maximum loan amount is R500,000'),
  termMonths: z.number().min(3, 'Minimum term is 3 months').max(84, 'Maximum term is 84 months'),
  purpose: z.string().min(3, 'Purpose is required').max(200, 'Purpose cannot exceed 200 characters'),
  loanType: z.enum(['personal', 'secured', 'business', 'student']).default('personal'),
  collateral: z.array(z.object({
    type: z.string(),
    value: z.number().positive(),
  })).optional(),
});

export const fundLoanSchema = z.object({
  lenderId: z.string(),
});

export const updateLoanStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'defaulted', 'rejected']),
  reason: z.string().optional(),
});

export const repaymentSchema = z.object({
  amount: z.number().positive('Repayment amount must be positive'),
});

export const listLoansQuerySchema = z.object({
  status: z.enum(['pending', 'active', 'completed', 'defaulted', 'rejected']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().default('createdAt'),
});