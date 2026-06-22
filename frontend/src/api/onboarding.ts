const baseUrl = import.meta.env.VITE_API_URL || '';

export async function submitBorrowerOnboarding(data: FormData) {
  const response = await fetch(`${baseUrl}/api/onboarding/borrower-onboarding`, {
    method: 'POST',
    body: data,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || 'Onboarding submission failed';
    throw new Error(message);
  }

  return response.json();
}

export async function validateOnboardingField(field: string, value: any) {
  const response = await fetch(`${baseUrl}/api/onboarding/validate-field`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, value }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || 'Validation failed';
    throw new Error(message);
  }

  return response.json();
}

export async function checkEmailUnique(email: string) {
  const response = await validateOnboardingField('email', email);
  return response;
}

export async function checkIdUnique(idNumber: string) {
  const response = await validateOnboardingField('idNumber', idNumber);
  return response;
}

export async function checkPhoneUnique(phoneNumber: string) {
  const response = await validateOnboardingField('phoneNumber', phoneNumber);
  return response;
}

export async function checkBankBranch(bankName: string, branchCode: string) {
  const response = await fetch(`${baseUrl}/api/onboarding/validate-field`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field: 'branchCode', value: branchCode, bankName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || 'Branch code validation failed';
    throw new Error(message);
  }

  return response.json();
}
