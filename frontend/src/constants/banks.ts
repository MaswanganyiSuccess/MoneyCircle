/**
 * South African Banks - Top 5 + Capitec
 */

export interface BankInfo {
  id: string;
  displayName: string;
  branchCodes: Array<{
    code: string;
    location?: string;
  }>;
}

export const SA_BANKS: BankInfo[] = [
  {
    id: 'capitec',
    displayName: 'Capitec Bank',
    branchCodes: [
      { code: '470010', location: 'Main' },
      { code: '470809', location: 'Alternative' },
    ],
  },
  {
    id: 'fnb',
    displayName: 'FNB',
    branchCodes: [
      { code: '250655', location: 'Johannesburg' },
      { code: '256245', location: 'Cape Town' },
      { code: '262645', location: 'Durban' },
      { code: '255605', location: 'Pretoria' },
    ],
  },
  {
    id: 'absa',
    displayName: 'Absa',
    branchCodes: [
      { code: '632005', location: 'Main' },
    ],
  },
  {
    id: 'standardbank',
    displayName: 'Standard Bank',
    branchCodes: [
      { code: '051001', location: 'Johannesburg' },
      { code: '050410', location: 'Main' },
      { code: '051405', location: 'Alternative 1' },
      { code: '051002', location: 'Alternative 2' },
    ],
  },
  {
    id: 'nedbank',
    displayName: 'Nedbank',
    branchCodes: [
      { code: '198765', location: 'Main' },
      { code: '190605', location: 'Alternative 1' },
      { code: '191155', location: 'Alternative 2' },
    ],
  },
];

// Create a map for quick lookups
export const BANK_MAP = SA_BANKS.reduce(
  (acc, bank) => {
    acc[bank.id] = bank;
    acc[bank.displayName.toLowerCase()] = bank;
    return acc;
  },
  {} as Record<string, BankInfo>
);

/**
 * Get bank by ID or display name
 */
export function getBankById(id: string): BankInfo | undefined {
  return BANK_MAP[id.toLowerCase()];
}

/**
 * Get bank by display name
 */
export function getBankByName(name: string): BankInfo | undefined {
  return BANK_MAP[name.toLowerCase()];
}

/**
 * Get branch codes for a bank
 */
export function getBranchCodes(bankId: string): string[] {
  const bank = getBankById(bankId);
  return bank ? bank.branchCodes.map(bc => bc.code) : [];
}

/**
 * Validate if branch code belongs to bank
 */
export function isValidBranchCodeForBank(bankId: string, branchCode: string): boolean {
  const codes = getBranchCodes(bankId);
  return codes.includes(branchCode);
}

/**
 * Get default branch code for bank
 */
export function getDefaultBranchCode(bankId: string): string | undefined {
  const bank = getBankById(bankId);
  return bank?.branchCodes[0]?.code;
}

/**
 * Get all supported bank names for dropdown
 */
export function getSupportedBankNames(): string[] {
  return SA_BANKS.map(bank => bank.displayName);
}

/**
 * Normalize bank name for comparison
 */
export function normalizeBankName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Find bank by partial name match
 */
export function findBankByPartialName(name: string): BankInfo | undefined {
  const normalized = normalizeBankName(name);
  return SA_BANKS.find(bank => {
    const bankNormalized = normalizeBankName(bank.displayName);
    return bankNormalized.includes(normalized) || normalized.includes(bankNormalized);
  });
}
