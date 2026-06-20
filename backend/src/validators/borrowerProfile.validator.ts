import { z } from 'zod';

export const borrowerProfileSchema = z.object({
  employment: z.object({
    employerName: z.string().min(2),
    employerAddress: z.string().min(5),
    employerContact: z.string().min(5), // could be phone or email
    employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'student', 'retired']),
  }),
  monthlyIncome: z.number().positive(),
  deductions: z.number().min(0).default(0),
  netIncome: z.number().positive(),
  dependents: z.number().int().min(0).default(0),
  monthlyExpenses: z.number().min(0).default(0),
  address: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    province: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().default('South Africa'),
    sameAsId: z.boolean().default(false),
  }),
  banking: z.object({
    bankName: z.string().min(2),
    accountNumber: z.string().min(5), // can be validated further
    branchCode: z.string().min(3),
    accountType: z.enum(['current', 'savings', 'cheque', 'investment']),
    proofOfBanking: z.string().url().optional(), // file URL
  }),
  emergencyContact: z.object({
    name: z.string().min(2),
    relationship: z.string().min(2),
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/), // E.164
  }),
  documents: z.object({
    idCopy: z.string().url(),
    bankStatements: z.array(z.string().url()).min(6).max(6), // exactly 6 months
    proofOfAddress: z.string().url(),
  }),
});

export type BorrowerProfileInput = z.infer<typeof borrowerProfileSchema>;