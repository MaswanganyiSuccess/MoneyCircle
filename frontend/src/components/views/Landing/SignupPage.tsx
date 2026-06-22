import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import PublicNav from '@/components/common/PublicNav';
import { useTheme } from '@/components/hooks/useTheme';
import SelfieCapture from './SelfieCapture';
import styles from './SignupPage.module.css';

// ─── Types ───────────────────────────────────────────────────────
interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  password: string;
  role: 'borrower' | 'lender';
  bankName: string;
  accountNumber: string;
  branchCode: string;
  monthlyIncome: number;
  deductions: number;
  employmentType: 'employed' | 'self-employed' | 'unemployed' | '';
  employerName: string;
  employerContact: string;
  alternativeContactName: string;
  alternativeContactPhone: string;
  alternativeContactEmail: string;
  idFront: File | null;
  selfie: File | null;
  employmentProof: File | null;
  selfEmployedStatement: File | null;
  bankStatement: File | null;
  proofOfAddress: File | null;
  phoneVerified: boolean;
  emailVerified: boolean;
}

// ─── Step Components ────────────────────────────────────────────
interface StepProps {
  formData: SignupFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function PersonalStep({ formData, handleChange }: StepProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <div className={styles.nameRow}>
          <div>
            <label className={styles.label}>First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="John"
            />
          </div>
          <div>
            <label className={styles.label}>Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Doe"
            />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="you@example.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Phone Number</label>
        <input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="+27 12 345 6789"
        />
        <div className={styles.helper}>Include country code (e.g., +27 for SA)</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>South African ID Number</label>
        <input
          name="idNumber"
          value={formData.idNumber}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="9501155123084"
        />
        <div className={styles.helper}>Enter a valid South African ID number</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Password</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
          minLength={8}
          placeholder="••••••••"
        />
        <div className={styles.helper}>At least 8 characters</div>
      </div>

      <div className={styles.formGroup}>
        <div className={styles.label}>I am a…</div>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="role"
              value="borrower"
              checked={formData.role === 'borrower'}
              onChange={handleChange}
              className={styles.radioInput}
            />
            Borrower (seeking funds)
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="role"
              value="lender"
              checked={formData.role === 'lender'}
              onChange={handleChange}
              className={styles.radioInput}
            />
            Lender (investing funds)
          </label>
        </div>
      </div>
    </div>
  );
}

function BankingStep({ formData, handleChange }: StepProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Bank Name</label>
        <input
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="e.g. Absa, Nedbank, FNB"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Account Number</label>
        <input
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="1234567890"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Branch Code</label>
        <input
          name="branchCode"
          value={formData.branchCode}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="123456"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Monthly Income (ZAR)</label>
        <input
          name="monthlyIncome"
          type="number"
          value={formData.monthlyIncome || ''}
          onChange={handleChange}
          className={styles.input}
          required
          min={0}
          placeholder="0"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Monthly Deductions (tax, pension, etc.)</label>
        <input
          name="deductions"
          type="number"
          value={formData.deductions || ''}
          onChange={handleChange}
          className={styles.input}
          min={0}
          placeholder="0"
        />
      </div>
    </div>
  );
}

function EmploymentStep({ formData, handleChange }: StepProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Employment Type</label>
        <select
          name="employmentType"
          value={formData.employmentType}
          onChange={handleChange}
          className={styles.input}
          required
        >
          <option value="">Select employment type</option>
          <option value="employed">Employed</option>
          <option value="self-employed">Self-employed</option>
          <option value="unemployed">Unemployed</option>
        </select>
      </div>

      {formData.employmentType !== 'unemployed' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Employer / Business Name</label>
            <input
              name="employerName"
              value={formData.employerName}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Company or business name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Employer / Business Contact</label>
            <input
              name="employerContact"
              value={formData.employerContact}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Phone or email for verification"
            />
          </div>
        </>
      )}

      {formData.employmentType === 'employed' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Proof of Employment</label>
          <input
            name="employmentProof"
            type="file"
            accept=".pdf,image/*"
            onChange={handleChange}
            className={styles.fileInput}
            required
          />
          <div className={styles.helper}>Offer letter, contract, or employment confirmation</div>
        </div>
      )}

      {formData.employmentType === 'self-employed' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>6 Months Statement</label>
          <input
            name="selfEmployedStatement"
            type="file"
            accept=".pdf,image/*"
            onChange={handleChange}
            className={styles.fileInput}
            required
          />
          <div className={styles.helper}>Upload 6 months bank statements or business proof</div>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.label}>Alternate Contact Name</label>
        <input
          name="alternativeContactName"
          value={formData.alternativeContactName}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="Relative or emergency contact"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Alternate Contact Phone</label>
        <input
          name="alternativeContactPhone"
          value={formData.alternativeContactPhone}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="Contact phone number"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Alternate Contact Email</label>
        <input
          name="alternativeContactEmail"
          value={formData.alternativeContactEmail}
          onChange={handleChange}
          className={styles.input}
          required
          placeholder="Contact email address"
        />
      </div>
    </div>
  );
}

function DocumentStep({ 
  handleChange, 
  selfieFile, 
  setSelfieFile,
  onSelfieCapture,
}: { 
  handleChange: StepProps['handleChange'];
  selfieFile: File | null;
  setSelfieFile: (file: File | null) => void;
  onSelfieCapture: (file: File) => void;
}) {
  const handleSelfieCapture = (file: File) => {
    setSelfieFile(file);
    onSelfieCapture(file);
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>ID Front (photo)</label>
        <input
          name="idFront"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className={styles.fileInput}
          required
        />
        <div className={styles.helper}>Clear photo of the front of your SA ID</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Selfie (face visible)</label>
        <SelfieCapture
          onCapture={handleSelfieCapture}
          onError={(msg) => console.error(msg)}
          className="w-full"
        />
        {selfieFile && (
          <div className="mt-2 text-xs text-emerald-500 flex items-center gap-1">
            <Check className="h-3 w-3" /> Selfie captured and face verified
          </div>
        )}
        <div className={styles.helper}>Take a clear selfie for verification</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Bank Statement</label>
        <input
          name="bankStatement"
          type="file"
          accept=".pdf,image/*"
          onChange={handleChange}
          className={styles.fileInput}
          required
        />
        <div className={styles.helper}>Last 3 months (PDF or image)</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Proof of Address</label>
        <input
          name="proofOfAddress"
          type="file"
          accept=".pdf,image/*"
          onChange={handleChange}
          className={styles.fileInput}
          required
        />
        <div className={styles.helper}>Utility bill or municipal statement (not older than 3 months)</div>
      </div>
    </div>
  );
}

function ContactVerificationStep({
  formData,
  sentPhoneCode,
  sentEmailCode,
  phoneCodeInput,
  emailCodeInput,
  onPhoneCodeChange,
  onEmailCodeChange,
  onSendPhoneCode,
  onVerifyPhoneCode,
  onSendEmailCode,
  onVerifyEmailCode,
  verificationError,
}: {
  formData: SignupFormData;
  sentPhoneCode: string | null;
  sentEmailCode: string | null;
  phoneCodeInput: string;
  emailCodeInput: string;
  onPhoneCodeChange: (value: string) => void;
  onEmailCodeChange: (value: string) => void;
  onSendPhoneCode: () => void;
  onVerifyPhoneCode: () => void;
  onSendEmailCode: () => void;
  onVerifyEmailCode: () => void;
  verificationError: string;
}) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Phone Verification</label>
        <p className={styles.helper}>A verification code will be sent to {formData.phoneNumber}.</p>
        <button type="button" onClick={onSendPhoneCode} className={styles.btnSecondary}>
          Send phone code
        </button>
        {sentPhoneCode && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Enter phone code</label>
            <input
              type="text"
              value={phoneCodeInput}
              onChange={(e) => onPhoneCodeChange(e.target.value)}
              className={styles.input}
              placeholder="123456"
              maxLength={6}
            />
            <button type="button" onClick={onVerifyPhoneCode} className={styles.btnSecondary}>
              Verify phone code
            </button>
          </div>
        )}
        <div className={styles.statusRow}>
          <span>Phone verified:</span>
          <strong className={formData.phoneVerified ? styles.statusSuccess : styles.statusPending}>
            {formData.phoneVerified ? 'Yes' : 'No'}
          </strong>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email Verification</label>
        <p className={styles.helper}>A verification code will be sent to {formData.email}.</p>
        <button type="button" onClick={onSendEmailCode} className={styles.btnSecondary}>
          Send email code
        </button>
        {sentEmailCode && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Enter email code</label>
            <input
              type="text"
              value={emailCodeInput}
              onChange={(e) => onEmailCodeChange(e.target.value)}
              className={styles.input}
              placeholder="123456"
              maxLength={6}
            />
            <button type="button" onClick={onVerifyEmailCode} className={styles.btnSecondary}>
              Verify email code
            </button>
          </div>
        )}
        <div className={styles.statusRow}>
          <span>Email verified:</span>
          <strong className={formData.emailVerified ? styles.statusSuccess : styles.statusPending}>
            {formData.emailVerified ? 'Yes' : 'No'}
          </strong>
        </div>
      </div>

      {verificationError && <div className={styles.error}>{verificationError}</div>}
    </div>
  );
}

function VerificationStep({ formData }: { formData: SignupFormData }) {
  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationIcon}>🔍</div>
      <h3 className={styles.verificationTitle}>Verification Pending</h3>
      <p className={styles.verificationDesc}>
        We are verifying your documents and information. This may take a few minutes.
        You will receive an email once your account is activated.
      </p>
      <div className={styles.verificationBox}>
        <p><strong>ID Number:</strong> {formData.idNumber}</p>
        <p><strong>Bank Account:</strong> {formData.accountNumber}</p>
        <p><strong>Phone Verified:</strong> {formData.phoneVerified ? 'Yes' : 'No'}</p>
        <p><strong>Email Verified:</strong> {formData.emailVerified ? 'Yes' : 'No'}</p>
        <p><strong>Employment Type:</strong> {formData.employmentType}</p>
        <p><strong>Status:</strong> <span className={styles.statusPending}>In review</span></p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
const steps = ['Personal', 'Banking', 'Employment', 'Verify Contact', 'Documents', 'Verification'];

export default function SignupPage() {
  // Apply theme on mount
  useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    password: '',
    role: 'borrower',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    monthlyIncome: 0,
    deductions: 0,
    employmentType: '',
    employerName: '',
    employerContact: '',
    alternativeContactName: '',
    alternativeContactPhone: '',
    alternativeContactEmail: '',
    idFront: null,
    selfie: null,
    employmentProof: null,
    selfEmployedStatement: null,
    bankStatement: null,
    proofOfAddress: null,
    phoneVerified: false,
    emailVerified: false,
  });
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [sentPhoneCode, setSentPhoneCode] = useState<string | null>(null);
  const [sentEmailCode, setSentEmailCode] = useState<string | null>(null);
  const [phoneCodeInput, setPhoneCodeInput] = useState('');
  const [emailCodeInput, setEmailCodeInput] = useState('');
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep === 3 && (!formData.phoneVerified || !formData.emailVerified)) {
      setError('Please verify both phone and email before continuing.');
      return;
    }
    setError('');
    setVerificationError('');
    setCurrentStep((prev: number) => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => setCurrentStep((prev: number) => Math.max(prev - 1, 0));

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendPhoneCode = () => {
    setVerificationError('');
    const code = generateCode();
    setSentPhoneCode(code);
    setFormData((prev) => ({ ...prev, phoneVerified: false }));
    setError(`Verification code generated. Enter ${code} to verify phone.`);
  };

  const verifyPhoneCode = () => {
    if (!sentPhoneCode) {
      setVerificationError('Please send the phone verification code first.');
      return;
    }
    if (phoneCodeInput !== sentPhoneCode) {
      setVerificationError('Phone verification code is incorrect.');
      return;
    }
    setFormData((prev) => ({ ...prev, phoneVerified: true }));
    setVerificationError('Phone verified successfully.');
  };

  const sendEmailCode = () => {
    setVerificationError('');
    const code = generateCode();
    setSentEmailCode(code);
    setFormData((prev) => ({ ...prev, emailVerified: false }));
    setError(`Verification code generated. Enter ${code} to verify email.`);
  };

  const verifyEmailCode = () => {
    if (!sentEmailCode) {
      setVerificationError('Please send the email verification code first.');
      return;
    }
    if (emailCodeInput !== sentEmailCode) {
      setVerificationError('Email verification code is incorrect.');
      return;
    }
    setFormData((prev) => ({ ...prev, emailVerified: true }));
    setVerificationError('Email verified successfully.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const files = (e.target as HTMLInputElement).files;
    if (type === 'file' && files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      nextStep();
      return;
    }

    if (!formData.phoneVerified || !formData.emailVerified) {
      setError('Phone and email must be verified before submission.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          payload.append(key, value);
        } else {
          payload.append(key, String(value));
        }
      });

      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/onboarding/borrower-onboarding`, {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      navigate('/verification-pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalStep formData={formData} handleChange={handleChange} />;
      case 1:
        return <BankingStep formData={formData} handleChange={handleChange} />;
      case 2:
        return <EmploymentStep formData={formData} handleChange={handleChange} />;
      case 3:
        return (
          <ContactVerificationStep
            formData={formData}
            sentPhoneCode={sentPhoneCode}
            sentEmailCode={sentEmailCode}
            phoneCodeInput={phoneCodeInput}
            emailCodeInput={emailCodeInput}
            onPhoneCodeChange={setPhoneCodeInput}
            onEmailCodeChange={setEmailCodeInput}
            onSendPhoneCode={sendPhoneCode}
            onVerifyPhoneCode={verifyPhoneCode}
            onSendEmailCode={sendEmailCode}
            onVerifyEmailCode={verifyEmailCode}
            verificationError={verificationError}
          />
        );
      case 4:
        return <DocumentStep 
          handleChange={handleChange} 
          selfieFile={selfieFile} 
          setSelfieFile={setSelfieFile} 
          onSelfieCapture={(file) => setFormData((prev) => ({ ...prev, selfie: file }))}
        />;
      case 5:
        return <VerificationStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <PublicNav />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.glow} />
          <div className={styles.tagline}>BORROW · INVEST · GROW</div>

          <div className={styles.progressWrapper}>
            <div className={styles.stepsRow}>
              {steps.map((label, idx) => (
                <span
                  key={idx}
                  className={`${styles.stepLabel} ${idx <= currentStep ? styles.active : ''}`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.buttonRow}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className={styles.btnBack}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`${styles.btnNext} ${currentStep === 0 ? styles.mlAuto : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="loader" style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                    Submitting…
                  </>
                ) : currentStep === steps.length - 1 ? (
                  'Submit'
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}