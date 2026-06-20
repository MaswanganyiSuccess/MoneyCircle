/**
 * South African ID Number Validator
 *
 * Format: YYMMDD SSSS C AZ
 * - YYMMDD: Date of birth (6 digits)
 * - SSSS: Gender (0000-4999 = Female, 5000-9999 = Male)
 * - C: Citizenship (0 = SA Citizen, 1 = Permanent Resident)
 * - AZ: Check digits (Luhn algorithm)
 *
 * Total: 13 digits
 */

export interface IDValidationResult {
  isValid: boolean;
  errors: string[];
  parsed?: {
    dateOfBirth: Date;
    gender: 'Male' | 'Female';
    citizenship: 'SA Citizen' | 'Permanent Resident';
    age: number;
  };
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validate a South African ID number
 */
export function validateSAID(idNumber: string): IDValidationResult {
  const errors: string[] = [];

  // 1. Must be exactly 13 digits
  if (!/^\d{13}$/.test(idNumber)) {
    errors.push('ID number must be exactly 13 digits');
    return { isValid: false, errors };
  }

  const digits = idNumber.split('').map(Number);

  // 2. Extract parts
  const yy = digits[0] * 10 + digits[1];
  const mm = digits[2] * 10 + digits[3];
  const dd = digits[4] * 10 + digits[5];
  const genderCode = digits[6] * 1000 + digits[7] * 100 + digits[8] * 10 + digits[9];
  const citizenship = digits[10];

  // 3. Validate date of birth (future‑proof century)
  const currentYear = new Date().getFullYear();
  const century = (yy <= currentYear % 100) ? 2000 : 1900;
  const year = century + yy;
  const dateOfBirth = new Date(year, mm - 1, dd);

  if (
    dateOfBirth.getFullYear() !== year ||
    dateOfBirth.getMonth() !== mm - 1 ||
    dateOfBirth.getDate() !== dd
  ) {
    errors.push('Invalid date of birth');
  }

  // 4. Check that date is not in the future
  const today = new Date();
  if (dateOfBirth > today) {
    errors.push('Date of birth cannot be in the future');
  }

  // 5. Validate gender code
  if (genderCode < 0 || genderCode > 9999) {
    errors.push('Invalid gender code');
  }

  // 6. Validate citizenship
  if (citizenship !== 0 && citizenship !== 1) {
    errors.push('Citizenship must be 0 (SA Citizen) or 1 (Permanent Resident)');
  }

  // 7. Validate check digits (corrected Luhn algorithm)
  if (!validateLuhn(idNumber)) {
    errors.push('Invalid check digits (Luhn validation failed)');
  }

  // Return result
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Calculate age
  const age = calculateAge(dateOfBirth);

  return {
    isValid: true,
    errors: [],
    parsed: {
      dateOfBirth,
      gender: genderCode >= 5000 ? 'Male' : 'Female',
      citizenship: citizenship === 0 ? 'SA Citizen' : 'Permanent Resident',
      age,
    },
  };
}

/**
 * Standard Luhn algorithm – used for SA ID check digits
 */
function validateLuhn(idNumber: string): boolean {
  const digits = idNumber.split('').map(Number);
  let sum = 0;
  let double = false;

  // Iterate from rightmost to leftmost
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}