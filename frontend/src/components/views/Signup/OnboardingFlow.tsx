import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SA_BANKS, getDefaultBranchCode, getBankById, getBranchCodes } from '@/constants/banks';
import type { OnboardingFormData } from '@/validators/onboarding';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateEmail,
  validatePhoneNumber,
} from '@/validators/onboarding';
import { normalizePhoneNumber } from '@/utils/phone-validator';
import { formatIDNumber } from '@/utils/id-validator';
import { submitBorrowerOnboarding } from '@/api/onboarding';

const initialFormData: OnboardingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  idNumber: '',
  password: '',
  confirmPassword: '',
  employmentType: '',
  employerName: '',
  employerContact: '',
  bankName: '',
  accountNumber: '',
  branchCode: '',
  accountType: 'current',
  monthlyIncome: 0,
  deductions: 0,
  documents: {
    idFront: null,
    selfie: null,
    bankStatement: null,
    proofOfAddress: null,
  },
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactEmail: '',
  emergencyContactRelationship: '',
  phoneVerified: false,
  emailVerified: false,
};

const stepTitles = [
  'Personal details',
  'Employment details',
  'Bank details',
  'Documents',
  'Emergency contact',
  'Review & submit',
];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return validateStep1(formData).valid;
      case 1:
        return validateStep2(formData).valid;
      case 2:
        return validateStep3(formData).valid;
      case 3:
        return validateStep4(formData).valid;
      case 4:
        return validateStep5(formData).valid;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleFieldChange = (field: keyof OnboardingFormData, value: any) => {
    setFormErrors((prev) => ({ ...prev, [field]: '' }));

    if (field === 'phoneNumber') {
      value = normalizePhoneNumber(value);
    }

    if (field === 'idNumber') {
      value = formatIDNumber(value);
    }

    if (field === 'bankName') {
      const bank = getBankById(value.toLowerCase());
      const defaultBranch = bank ? getDefaultBranchCode(bank.id) : '';
      setFormData((prev) => ({
        ...prev,
        bankName: bank ? bank.displayName : value,
        branchCode: defaultBranch || prev.branchCode,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentChange = (field: keyof OnboardingFormData['documents'], file: File | null) => {
    setFormErrors((prev) => ({ ...prev, [`documents.${field}`]: '' }));
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file,
      },
    }));
  };

  const handleNext = () => {
    let validation;

    switch (currentStep) {
      case 0:
        validation = validateStep1(formData);
        break;
      case 1:
        validation = validateStep2(formData);
        break;
      case 2:
        validation = validateStep3(formData);
        break;
      case 3:
        validation = validateStep4(formData);
        break;
      case 4:
        validation = validateStep5(formData);
        break;
      default:
        validation = { valid: false, errors: {} };
    }

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const fullValidation = validateStep5(formData);
    if (!fullValidation.valid) {
      setFormErrors(fullValidation.errors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('idNumber', formData.idNumber);
      data.append('password', formData.password);
      data.append('role', 'borrower');
      data.append('bankName', formData.bankName);
      data.append('accountNumber', formData.accountNumber);
      data.append('branchCode', formData.branchCode);
      data.append('monthlyIncome', String(formData.monthlyIncome));
      data.append('deductions', String(formData.deductions));
      data.append('employmentType', formData.employmentType);
      data.append('employerName', formData.employerName);
      data.append('employerContact', formData.employerContact);
      data.append('alternativeContactName', formData.emergencyContactName);
      data.append('alternativeContactPhone', formData.emergencyContactPhone);
      data.append('alternativeContactEmail', formData.emergencyContactEmail);
      data.append('phoneVerified', String(formData.phoneVerified));
      data.append('emailVerified', String(formData.emailVerified));
      if (formData.documents.idFront) data.append('idFront', formData.documents.idFront);
      if (formData.documents.selfie) data.append('selfie', formData.documents.selfie);
      if (formData.documents.bankStatement) data.append('bankStatement', formData.documents.bankStatement);
      if (formData.documents.proofOfAddress) data.append('proofOfAddress', formData.documents.proofOfAddress);

      await submitBorrowerOnboarding(data);
      setSubmitSuccess('Onboarding submitted successfully. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStepTitle = stepTitles[currentStep];
  const bankOptions = SA_BANKS;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-6 rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Borrower Onboarding</p>
            <h1 className="text-2xl font-semibold">Complete your signup</h1>
          </div>
          <div className="rounded-full bg-muted px-4 py-2 text-sm text-foreground/80">
            Step {currentStep + 1} / {stepTitles.length}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-border/60 bg-background/90 p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Progress</h2>
          <div className="space-y-3">
            {stepTitles.map((title, index) => (
              <button
                key={title}
                type="button"
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  index === currentStep
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/70 bg-background/70 text-foreground'
                }`}
                disabled={index > currentStep}
                onClick={() => setCurrentStep(index)}
              >
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">{index + 1}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{currentStepTitle}</p>
              <h2 className="text-xl font-semibold">Fill in the required details</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {canProceed ? 'All fields valid for this step' : 'Complete required fields to continue'}
            </div>
          </div>

          {submitError && (
            <div className="mb-4 rounded-2xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-600">
              {submitSuccess}
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="First name"
                  />
                  {formErrors.firstName && <p className="mt-2 text-xs text-destructive">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Last name"
                  />
                  {formErrors.lastName && <p className="mt-2 text-xs text-destructive">{formErrors.lastName}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Email address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="you@example.com"
                  />
                  {formErrors.email && <p className="mt-2 text-xs text-destructive">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Phone number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="+27123456789"
                  />
                  {formErrors.phoneNumber && <p className="mt-2 text-xs text-destructive">{formErrors.phoneNumber}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">South African ID number</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleFieldChange('idNumber', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="1234567890123"
                  />
                  {formErrors.idNumber && <p className="mt-2 text-xs text-destructive">{formErrors.idNumber}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Create a password"
                  />
                  {formErrors.password && <p className="mt-2 text-xs text-destructive">{formErrors.password}</p>}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Confirm password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Confirm password"
                />
                {formErrors.confirmPassword && <p className="mt-2 text-xs text-destructive">{formErrors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Employment type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select employment type</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="unemployed">Unemployed</option>
                </select>
                {formErrors.employmentType && <p className="mt-2 text-xs text-destructive">{formErrors.employmentType}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Employer / Business name</label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) => handleFieldChange('employerName', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Employer or business name"
                  />
                  {formErrors.employerName && <p className="mt-2 text-xs text-destructive">{formErrors.employerName}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Employer contact</label>
                  <input
                    type="text"
                    value={formData.employerContact}
                    onChange={(e) => handleFieldChange('employerContact', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Phone or email"
                  />
                  {formErrors.employerContact && <p className="mt-2 text-xs text-destructive">{formErrors.employerContact}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Bank name</label>
                <select
                  value={formData.bankName}
                  onChange={(e) => handleFieldChange('bankName', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select your bank</option>
                  {bankOptions.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.displayName}
                    </option>
                  ))}
                </select>
                {formErrors.bankName && <p className="mt-2 text-xs text-destructive">{formErrors.bankName}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Account number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="8-10 digits"
                  />
                  {formErrors.accountNumber && <p className="mt-2 text-xs text-destructive">{formErrors.accountNumber}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Branch code</label>
                  <select
                    value={formData.branchCode}
                    onChange={(e) => handleFieldChange('branchCode', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select branch code</option>
                    {getBranchCodes(formData.bankName.toLowerCase()).map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  {formErrors.branchCode && <p className="mt-2 text-xs text-destructive">{formErrors.branchCode}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Monthly income</label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleFieldChange('monthlyIncome', Number(e.target.value))}
                    min={0}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Monthly income"
                  />
                  {formErrors.monthlyIncome && <p className="mt-2 text-xs text-destructive">{formErrors.monthlyIncome}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Deductions</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => handleFieldChange('deductions', Number(e.target.value))}
                    min={0}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Deductions"
                  />
                  {formErrors.deductions && <p className="mt-2 text-xs text-destructive">{formErrors.deductions}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Upload ID front</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleDocumentChange('idFront', e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {formErrors['documents.idFront'] && <p className="mt-2 text-xs text-destructive">{formErrors['documents.idFront']}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Upload selfie</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleDocumentChange('selfie', e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {formErrors['documents.selfie'] && <p className="mt-2 text-xs text-destructive">{formErrors['documents.selfie']}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Upload bank statement</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleDocumentChange('bankStatement', e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {formErrors['documents.bankStatement'] && <p className="mt-2 text-xs text-destructive">{formErrors['documents.bankStatement']}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Upload proof of address</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => handleDocumentChange('proofOfAddress', e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {formErrors['documents.proofOfAddress'] && <p className="mt-2 text-xs text-destructive">{formErrors['documents.proofOfAddress']}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Emergency contact name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleFieldChange('emergencyContactName', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Emergency contact name"
                />
                {formErrors.emergencyContactName && <p className="mt-2 text-xs text-destructive">{formErrors.emergencyContactName}</p>}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Emergency contact phone</label>
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleFieldChange('emergencyContactPhone', normalizePhoneNumber(e.target.value))}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="+27123456789"
                  />
                  {formErrors.emergencyContactPhone && <p className="mt-2 text-xs text-destructive">{formErrors.emergencyContactPhone}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Emergency contact email</label>
                  <input
                    type="email"
                    value={formData.emergencyContactEmail}
                    onChange={(e) => handleFieldChange('emergencyContactEmail', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="contact@example.com"
                  />
                  {formErrors.emergencyContactEmail && <p className="mt-2 text-xs text-destructive">{formErrors.emergencyContactEmail}</p>}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleFieldChange('emergencyContactRelationship', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="E.g. spouse, parent, friend"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border/70 bg-muted/40 p-5">
                <h3 className="text-lg font-semibold">Review your data</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-background p-4">
                    <h4 className="font-semibold">Personal</h4>
                    <p className="text-sm text-muted-foreground">{formData.firstName} {formData.lastName}</p>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                    <p className="text-sm text-muted-foreground">{formData.phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">{formData.idNumber}</p>
                  </div>
                  <div className="rounded-2xl bg-background p-4">
                    <h4 className="font-semibold">Banking</h4>
                    <p className="text-sm text-muted-foreground">{formData.bankName}</p>
                    <p className="text-sm text-muted-foreground">Account: {formData.accountNumber}</p>
                    <p className="text-sm text-muted-foreground">Branch: {formData.branchCode}</p>
                    <p className="text-sm text-muted-foreground">Income: ZAR {formData.monthlyIncome}</p>
                  </div>
                  <div className="rounded-2xl bg-background p-4">
                    <h4 className="font-semibold">Employment</h4>
                    <p className="text-sm text-muted-foreground">{formData.employmentType}</p>
                    <p className="text-sm text-muted-foreground">{formData.employerName}</p>
                    <p className="text-sm text-muted-foreground">{formData.employerContact}</p>
                  </div>
                  <div className="rounded-2xl bg-background p-4">
                    <h4 className="font-semibold">Emergency Contact</h4>
                    <p className="text-sm text-muted-foreground">{formData.emergencyContactName}</p>
                    <p className="text-sm text-muted-foreground">{formData.emergencyContactPhone}</p>
                    <p className="text-sm text-muted-foreground">{formData.emergencyContactEmail}</p>
                    <p className="text-sm text-muted-foreground">{formData.emergencyContactRelationship}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || submitting}
              className="w-full rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Back
            </button>
            {currentStep < stepTitles.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed || submitting}
                className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !canProceed}
                className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting ? 'Submitting...' : 'Submit onboarding'}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
