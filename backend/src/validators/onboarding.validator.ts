import { z } from 'zod';
import { validateSAID } from '../utils/id-validator';

const bankBranchCodeMap = {
  absa: {
    displayName: 'Absa',
    codes: ['632005', '632005', '632005', '632005', '632005'],
  },
  fnb: {
    displayName: 'FNB',
    codes: ['250655', '256245', '262645', '255605', '250655'],
  },
  'standard bank': {
    displayName: 'Standard Bank',
    codes: ['051001', '050410', '051001', '051405', '051002'],
  },
  nedbank: {
    displayName: 'Nedbank',
    codes: ['198765', '190605', '191155', '198765', '198765'],
  },
  capitec: {
    displayName: 'Capitec',
    codes: ['470010', '470809', '470010', '470010'],
  },
  investec: {
    displayName: 'Investec',
    codes: ['580105', '580109', '580105'],
  },
  tymebank: {
    displayName: 'TymeBank',
    codes: ['078765', '078765'],
  },
  'discovery bank': {
    displayName: 'Discovery Bank',
    codes: ['580105', '580109'],
  },
  'african bank': {
    displayName: 'African Bank',
    codes: ['421109', '421109'],
  },
  'bidvest bank': {
    displayName: 'Bidvest Bank',
    codes: ['456909', '456909'],
  },
  'mercantile bank': {
    displayName: 'Mercantile Bank',
    codes: ['581330'],
  },
  'postbank': {
    displayName: 'Postbank',
    codes: ['460005'],
  },
  'sasfin bank': {
    displayName: 'Sasfin Bank',
    codes: ['632005'],
  },
} as const;

// ---------- Helpers ----------
const normalizeName = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

const findSupportedBank = (value: string) => {
  const normalizedValue = normalizeName(value);
  return Object.values(bankBranchCodeMap).find((bank) => {
    const normalizedBank = normalizeName(bank.displayName);
    return (
      normalizedValue === normalizedBank ||
      normalizedValue.includes(normalizedBank) ||
      normalizedBank.includes(normalizedValue)
    );
  });
};

// ---------- Patterns ----------
const phonePattern = /^\+27\d{9}$/;
const emailPattern = /^\S+@\S+\.\S+$/;
const namePattern = /^[A-Za-z\s'’\-]+$/;
const accountNumberPattern = /^\d{8,10}$/;
const branchCodePattern = /^\d{6}$/;

// ---------- Types ----------
export type OnboardingFieldName =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phoneNumber'
  | 'idNumber'
  | 'password'
  | 'bankName'
  | 'accountNumber'
  | 'branchCode'
  | 'monthlyIncome'
  | 'deductions';

// ---------- Field Validators ----------
const fieldValidators: Record<OnboardingFieldName, (value: any, context?: { bankName?: string }) => { isValid: boolean; error?: string }> = {
  firstName: (value) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'First name is required' };
    if (value.length > 50) return { isValid: false, error: 'First name must be 50 characters or less' };
    if (!namePattern.test(value)) return { isValid: false, error: 'First name can only contain letters, spaces, apostrophes, and hyphens' };
    return { isValid: true };
  },
  lastName: (value) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'Last name is required' };
    if (value.length > 50) return { isValid: false, error: 'Last name must be 50 characters or less' };
    if (!namePattern.test(value)) return { isValid: false, error: 'Last name can only contain letters, spaces, apostrophes, and hyphens' };
    return { isValid: true };
  },
  email: (value) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'Email is required' };
    if (!emailPattern.test(value)) return { isValid: false, error: 'Invalid email address' };
    return { isValid: true };
  },
  phoneNumber: (value) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'Phone number is required' };
    if (!phonePattern.test(value)) return { isValid: false, error: 'Phone number must be a South African E.164 number, e.g. +27123456789' };
    return { isValid: true };
  },
  idNumber: (value) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'ID number is required' };
    if (!/^\d{13}$/.test(value)) return { isValid: false, error: 'ID number must be exactly 13 digits' };
    const result = validateSAID(value);
    if (!result.isValid) return { isValid: false, error: result.errors.join(', ') };
    return { isValid: true };
  },
  password: (value) => {
    if (typeof value !== 'string' || !value) return { isValid: false, error: 'Password is required' };
    if (value.length < 8) return { isValid: false, error: 'Password must be at least 8 characters' };
    return { isValid: true };
  },
  bankName: (value) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'Bank name is required' };
    const bank = findSupportedBank(value);
    if (!bank) return { isValid: false, error: 'Bank name must be a recognized South African bank' };
    return { isValid: true };
  },
  accountNumber: (value) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'Account number is required' };
    if (!accountNumberPattern.test(value)) return { isValid: false, error: 'Account number must be 8 to 10 digits' };
    return { isValid: true };
  },
  branchCode: (value, context) => {
    if (typeof value !== 'string' || !value.trim()) return { isValid: false, error: 'Branch code is required' };
    if (!branchCodePattern.test(value)) return { isValid: false, error: 'Branch code must be exactly 6 digits' };
    if (context?.bankName) {
      const bank = findSupportedBank(context.bankName);
      if (!bank) return { isValid: false, error: 'Bank name must be selected before validating branch code' };
      // ✅ Fix: use `some` with explicit casting to avoid 'never' type error
      const codes = bank.codes as readonly string[];
      if (!codes.some((code) => code === value)) {
        return { isValid: false, error: 'Branch code does not match selected bank' };
      }
    }
    return { isValid: true };
  },
  monthlyIncome: (value) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) return { isValid: false, error: 'Monthly income must be a number' };
    if (amount < 0) return { isValid: false, error: 'Monthly income must be at least 0' };
    return { isValid: true };
  },
  deductions: (value) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) return { isValid: false, error: 'Deductions must be a number' };
    if (amount < 0) return { isValid: false, error: 'Deductions must be at least 0' };
    return { isValid: true };
  },
};

// ---------- Public Validation Helper ----------
export function validateOnboardingField(field: string, value: any, bankName?: string) {
  if (!fieldValidators[field as OnboardingFieldName]) {
    return { isValid: false, error: 'Unsupported validation field' };
  }
  return fieldValidators[field as OnboardingFieldName](value, { bankName });
}

// ---------- Zod Schema ----------
export const borrowerOnboardingSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50)
      .regex(namePattern, 'First name can only contain letters, spaces, apostrophes, and hyphens'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50)
      .regex(namePattern, 'Last name can only contain letters, spaces, apostrophes, and hyphens'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().regex(phonePattern, 'Phone number must be a South African E.164 number, e.g. +27123456789'),
    idNumber: z
      .string()
      .regex(/^\d{13}$/, 'ID number must be exactly 13 digits')
      .refine((value) => validateSAID(value).isValid, 'Invalid South African ID number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['borrower', 'lender']).default('borrower'),
    bankName: z
      .string()
      .min(2, 'Bank name is required')
      .refine((value) => Boolean(findSupportedBank(value)), 'Bank name must be a recognized South African bank'),
    accountNumber: z.string().regex(accountNumberPattern, 'Account number must be 8 to 10 digits'),
    branchCode: z.string().regex(branchCodePattern, 'Branch code must be exactly 6 digits'),
    monthlyIncome: z.coerce.number().min(0, 'Monthly income must be at least 0'),
    deductions: z.coerce.number().min(0, 'Deductions must be at least 0'),
    employmentType: z.enum(['employed', 'self-employed', 'unemployed', '']).refine((value) => value !== '', 'Employment type is required'),
    employerName: z.string().min(2, 'Employer or business name is required'),
    employerContact: z
      .string()
      .min(5, 'Employer contact is required')
      .refine(
        (value) => phonePattern.test(value) || emailPattern.test(value),
        'Employer contact must be a valid phone or email'
      ),
    alternativeContactName: z
      .string()
      .min(2, 'Alternate contact name is required')
      .regex(namePattern, 'Alternate contact name can only contain letters, spaces, apostrophes, and hyphens'),
    alternativeContactPhone: z.string().regex(phonePattern, 'Alternate contact phone must be a South African E.164 phone number'),
    alternativeContactEmail: z.string().email('Alternate contact email must be valid'),
    phoneVerified: z.preprocess((value) => value === 'true' || value === true, z.boolean()).refine((value) => value === true, 'Phone must be verified'),
    emailVerified: z.preprocess((value) => value === 'true' || value === true, z.boolean()).refine((value) => value === true, 'Email must be verified'),
  })
  .refine((data) => {
    const bank = findSupportedBank(data.bankName);
    if (!bank) return false;
    const codes = bank.codes as readonly string[];
    return codes.some((code) => code === data.branchCode);
  }, {
    message: 'Branch code does not match selected bank',
    path: ['branchCode'],
  });

// ---------- Exported List of Supported Banks (ONLY ONCE) ----------
export const supportedBankNames = Object.values(bankBranchCodeMap).map((bank) => bank.displayName);