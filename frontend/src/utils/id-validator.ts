/**
 * South African ID Number Validator
 * Format: YYMMDD SSSS C AZ
 * - YYMMDD: Date of birth (6 digits)
 * - SSSS: Gender (0000-4999 = Female, 5000-9999 = Male)
 * - C: Citizenship (0 = SA Citizen, 1 = Permanent Resident)
 * - AZ: Check digits (Luhn algorithm)
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
 * Validate Luhn check digits
 */
function validateLuhn(idNumber: string): boolean {
  const digits = idNumber.split('').map((d) => Number(d));
  if (digits.length !== 13 || digits.some((d) => Number.isNaN(d))) return false;

  // sum of digits in positions 0,2,4,6,8,10 (leftmost index 0)
  let sumOdd = 0;
  for (let i = 0; i <= 10; i += 2) {
    sumOdd += digits[i];
  }

  // concatenate even position digits 1,3,5,7,9,11
  let evenConcat = '';
  for (let i = 1; i <= 11; i += 2) {
    evenConcat += String(digits[i]);
  }

  const doubled = String(Number(evenConcat) * 2);
  let sumDoubledDigits = 0;
  for (const ch of doubled) sumDoubledDigits += Number(ch);

  const total = sumOdd + sumDoubledDigits;
  const checkDigit = (10 - (total % 10)) % 10;
  return checkDigit === digits[12];
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

  // 3. Validate date of birth (future-proof century)
  const currentYear = new Date().getFullYear();
  const century = yy <= currentYear % 100 ? 2000 : 1900;
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

  // 7. Validate check digits
  if (!validateLuhn(idNumber)) {
    errors.push('Invalid check digits');
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
 * Format ID number as user types (add spaces for readability)
 */
export function formatIDNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 13);
}
