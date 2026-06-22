/**
 * Client-side validation schemas for onboarding form
 */

import { validateSAID } from '@/utils/id-validator';

export interface OnboardingFormData {
  // Step 1: Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  password: string;
  confirmPassword: string;

  // Step 2: Employment
  employmentType: 'employed' | 'self-employed' | 'unemployed' | '';
  employerName: string;
  employerContact: string;

  // Step 3: Banking
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: 'current' | 'savings' | 'cheque' | 'investment';
  monthlyIncome: number;
  deductions: number;

  // Step 4: Documents
  documents: {
    idFront: File | null;
    selfie: File | null;
    bankStatement: File | null;
    proofOfAddress: File | null;
  };

  // Step 5: Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  emergencyContactRelationship: string;

  // Verification flags
  phoneVerified: boolean;
  emailVerified: boolean;
}

// Regular expressions
const NAME_PATTERN = /^[A-Za-z\s''-]+$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PHONE_PATTERN = /^\+27\d{9}$/;
const ID_PATTERN = /^\d{13}$/;
const ACCOUNT_NUMBER_PATTERN = /^\d{8,10}$/;
const BRANCH_CODE_PATTERN = /^\d{6}$/;

/**
 * Validate first name
 */
export function validateFirstName(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'First name is required' };
  }
  if (value.length > 50) {
    return { valid: false, error: 'First name must be 50 characters or less' };
  }
  if (!NAME_PATTERN.test(value)) {
    return { valid: false, error: 'First name can only contain letters, spaces, apostrophes, and hyphens' };
  }
  return { valid: true };
}

/**
 * Validate last name
 */
export function validateLastName(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Last name is required' };
  }
  if (value.length > 50) {
    return { valid: false, error: 'Last name must be 50 characters or less' };
  }
  if (!NAME_PATTERN.test(value)) {
    return { valid: false, error: 'Last name can only contain letters, spaces, apostrophes, and hyphens' };
  }
  return { valid: true };
}

/**
 * Validate email
 */
export function validateEmail(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Email is required' };
  }
  if (!EMAIL_PATTERN.test(value)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Phone number is required' };
  }
  if (!PHONE_PATTERN.test(value)) {
    return { valid: false, error: 'Phone number must be in format +27XXXXXXXXX (e.g., +27123456789)' };
  }
  return { valid: true };
}

/**
 * Validate ID number
 */
export function validateIDNumber(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'ID number is required' };
  }
  if (!ID_PATTERN.test(value)) {
    return { valid: false, error: 'ID number must be exactly 13 digits' };
  }
  const result = validateSAID(value);
  if (!result.isValid) {
    return { valid: false, error: result.errors.join(', ') };
  }

  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Password is required' };
  }
  if (value.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  // Optional: Add complexity requirements
  // const hasUpperCase = /[A-Z]/.test(value);
  // const hasLowerCase = /[a-z]/.test(value);
  // const hasNumbers = /\d/.test(value);
  // const hasSpecialChar = /[!@#$%^&*]/.test(value);
  // if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
  //   return { valid: false, error: 'Password must contain uppercase, lowercase, and numbers' };
  // }
  return { valid: true };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(password: string, confirm: string): { valid: boolean; error?: string } {
  if (!confirm) {
    return { valid: false, error: 'Password confirmation is required' };
  }
  if (password !== confirm) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true };
}

/**
 * Validate employment type
 */
export function validateEmploymentType(value: string): { valid: boolean; error?: string } {
  if (!value || value === '') {
    return { valid: false, error: 'Employment type is required' };
  }
  if (!['employed', 'self-employed', 'unemployed'].includes(value)) {
    return { valid: false, error: 'Invalid employment type' };
  }
  return { valid: true };
}

/**
 * Validate employer name
 */
export function validateEmployerName(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Employer or business name is required' };
  }
  if (value.length < 2) {
    return { valid: false, error: 'Employer name must be at least 2 characters' };
  }
  return { valid: true };
}

/**
 * Validate employer contact
 */
export function validateEmployerContact(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Employer contact is required' };
  }
  if (value.length < 5) {
    return { valid: false, error: 'Employer contact must be at least 5 characters' };
  }
  const isValidPhone = PHONE_PATTERN.test(value);
  const isValidEmail = EMAIL_PATTERN.test(value);
  if (!isValidPhone && !isValidEmail) {
    return { valid: false, error: 'Employer contact must be a valid phone (+27XXXXXXXXX) or email' };
  }
  return { valid: true };
}

/**
 * Validate bank name
 */
export function validateBankName(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Bank name is required' };
  }
  return { valid: true };
}

/**
 * Validate account number
 */
export function validateAccountNumber(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Account number is required' };
  }
  if (!ACCOUNT_NUMBER_PATTERN.test(value)) {
    return { valid: false, error: 'Account number must be 8 to 10 digits' };
  }
  return { valid: true };
}

/**
 * Validate branch code
 */
export function validateBranchCode(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Branch code is required' };
  }
  if (!BRANCH_CODE_PATTERN.test(value)) {
    return { valid: false, error: 'Branch code must be exactly 6 digits' };
  }
  return { valid: true };
}

/**
 * Validate monthly income
 */
export function validateMonthlyIncome(value: number | string | undefined | null): { valid: boolean; error?: string } {
  if (value === undefined || value === null || value === '') {
    return { valid: false, error: 'Monthly income is required' };
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Monthly income must be a number' };
  }
  if (numValue < 0) {
    return { valid: false, error: 'Monthly income must be at least 0' };
  }
  return { valid: true };
}

/**
 * Validate deductions
 */
export function validateDeductions(value: number | string | undefined | null): { valid: boolean; error?: string } {
  if (value === undefined || value === null || value === '') {
    return { valid: true }; // Optional field
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Deductions must be a number' };
  }
  if (numValue < 0) {
    return { valid: false, error: 'Deductions must be at least 0' };
  }
  return { valid: true };
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File | null, fieldName: string): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `${fieldName} must be less than 10MB` };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: `${fieldName} must be a valid image or PDF file` };
  }

  return { valid: true };
}

/**
 * Validate emergency contact name
 */
export function validateEmergencyContactName(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'Emergency contact name is required' };
  }
  if (value.length < 2) {
    return { valid: false, error: 'Emergency contact name must be at least 2 characters' };
  }
  if (!NAME_PATTERN.test(value)) {
    return { valid: false, error: 'Emergency contact name can only contain letters, spaces, apostrophes, and hyphens' };
  }
  return { valid: true };
}

/**
 * Validate emergency contact phone
 */
export function validateEmergencyContactPhone(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Emergency contact phone is required' };
  }
  if (!PHONE_PATTERN.test(value)) {
    return { valid: false, error: 'Emergency contact phone must be in format +27XXXXXXXXX' };
  }
  return { valid: true };
}

/**
 * Validate emergency contact email
 */
export function validateEmergencyContactEmail(value: string): { valid: boolean; error?: string } {
  if (!value) {
    return { valid: false, error: 'Emergency contact email is required' };
  }
  if (!EMAIL_PATTERN.test(value)) {
    return { valid: false, error: 'Emergency contact email must be valid' };
  }
  return { valid: true };
}

/**
 * Validate all step 1 fields
 */
export function validateStep1(data: Partial<OnboardingFormData>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const firstNameValidation = validateFirstName(data.firstName || '');
  if (!firstNameValidation.valid) errors.firstName = firstNameValidation.error || '';

  const lastNameValidation = validateLastName(data.lastName || '');
  if (!lastNameValidation.valid) errors.lastName = lastNameValidation.error || '';

  const emailValidation = validateEmail(data.email || '');
  if (!emailValidation.valid) errors.email = emailValidation.error || '';

  const phoneValidation = validatePhoneNumber(data.phoneNumber || '');
  if (!phoneValidation.valid) errors.phoneNumber = phoneValidation.error || '';

  const idValidation = validateIDNumber(data.idNumber || '');
  if (!idValidation.valid) errors.idNumber = idValidation.error || '';

  const passwordValidation = validatePassword(data.password || '');
  if (!passwordValidation.valid) errors.password = passwordValidation.error || '';

  const confirmValidation = validatePasswordConfirmation(data.password || '', data.confirmPassword || '');
  if (!confirmValidation.valid) errors.confirmPassword = confirmValidation.error || '';

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate all step 2 fields
 */
export function validateStep2(data: Partial<OnboardingFormData>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const employmentValidation = validateEmploymentType(data.employmentType || '');
  if (!employmentValidation.valid) errors.employmentType = employmentValidation.error || '';

  const employerValidation = validateEmployerName(data.employerName || '');
  if (!employerValidation.valid) errors.employerName = employerValidation.error || '';

  const contactValidation = validateEmployerContact(data.employerContact || '');
  if (!contactValidation.valid) errors.employerContact = contactValidation.error || '';

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate all step 3 fields
 */
export function validateStep3(data: Partial<OnboardingFormData>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const bankValidation = validateBankName(data.bankName || '');
  if (!bankValidation.valid) errors.bankName = bankValidation.error || '';

  const accountValidation = validateAccountNumber(data.accountNumber || '');
  if (!accountValidation.valid) errors.accountNumber = accountValidation.error || '';

  const branchValidation = validateBranchCode(data.branchCode || '');
  if (!branchValidation.valid) errors.branchCode = branchValidation.error || '';

  const incomeValidation = validateMonthlyIncome(data.monthlyIncome || 0);
  if (!incomeValidation.valid) errors.monthlyIncome = incomeValidation.error || '';

  const deductionsValidation = validateDeductions(data.deductions || 0);
  if (!deductionsValidation.valid) errors.deductions = deductionsValidation.error || '';

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate all step 4 fields
 */
export function validateStep4(data: Partial<OnboardingFormData>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (data.documents) {
    const idFrontValidation = validateDocumentFile(data.documents.idFront || null, 'ID Front');
    if (!idFrontValidation.valid) errors['documents.idFront'] = idFrontValidation.error || '';

    const selfieValidation = validateDocumentFile(data.documents.selfie || null, 'Selfie');
    if (!selfieValidation.valid) errors['documents.selfie'] = selfieValidation.error || '';

    const bankStatementValidation = validateDocumentFile(data.documents.bankStatement || null, 'Bank Statement');
    if (!bankStatementValidation.valid) errors['documents.bankStatement'] = bankStatementValidation.error || '';

    const proofOfAddressValidation = validateDocumentFile(data.documents.proofOfAddress || null, 'Proof of Address');
    if (!proofOfAddressValidation.valid) errors['documents.proofOfAddress'] = proofOfAddressValidation.error || '';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate all step 5 fields
 */
export function validateStep5(data: Partial<OnboardingFormData>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const nameValidation = validateEmergencyContactName(data.emergencyContactName || '');
  if (!nameValidation.valid) errors.emergencyContactName = nameValidation.error || '';

  const phoneValidation = validateEmergencyContactPhone(data.emergencyContactPhone || '');
  if (!phoneValidation.valid) errors.emergencyContactPhone = phoneValidation.error || '';

  const emailValidation = validateEmergencyContactEmail(data.emergencyContactEmail || '');
  if (!emailValidation.valid) errors.emergencyContactEmail = emailValidation.error || '';

  return { valid: Object.keys(errors).length === 0, errors };
}
