/**
 * South African Phone Number Validator
 * Format: +27XXXXXXXXX (12 digits total including +27)
 * - Starts with +27
 * - Followed by 9 digits
 * - Total 12 characters
 */

export interface PhoneValidationResult {
  isValid: boolean;
  errors: string[];
  formatted?: string;
}

/**
 * Validate South African phone number in E.164 format
 */
export function validateSAPhone(phoneNumber: string): PhoneValidationResult {
  const errors: string[] = [];

  if (!phoneNumber) {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }

  // E.164 format: +27XXXXXXXXX (12 chars total, 9 digits after +27)
  const pattern = /^\+27\d{9}$/;

  if (!pattern.test(phoneNumber)) {
    if (!phoneNumber.startsWith('+27')) {
      errors.push('Phone number must start with +27');
    } else if (phoneNumber.length < 12) {
      errors.push('Phone number must have 9 digits after +27');
    } else if (phoneNumber.length > 12) {
      errors.push('Phone number has too many digits');
    } else {
      errors.push('Phone number format is invalid (use +27XXXXXXXXX)');
    }
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
}

/**
 * Format phone number as user types
 * Convert from 0712345678 or 712345678 to +27XXXXXXXXX
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // If starts with 27, use as is
  if (digits.startsWith('27')) {
    return `+${digits.slice(0, 11)}`;
  }

  // If starts with 0, remove it and add 27
  if (digits.startsWith('0')) {
    return `+27${digits.slice(1, 10)}`;
  }

  // Otherwise, just add 27 prefix
  return `+27${digits.slice(0, 9)}`;
}

/**
 * Normalize phone input - accepts multiple formats and converts to E.164
 */
export function normalizePhoneNumber(input: string): string {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');

  // If already has 27 prefix (12 digits)
  if (digits.length === 12 && digits.startsWith('27')) {
    return `+${digits}`;
  }

  // If has 0 prefix (10 digits)
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+27${digits.slice(1)}`;
  }

  // If has 9 digits (no prefix)
  if (digits.length === 9) {
    return `+27${digits}`;
  }

  // If has 11 digits (27 without +)
  if (digits.length === 11 && digits.startsWith('27')) {
    return `+${digits}`;
  }

  // Return formatted if possible, otherwise return original
  return input;
}
