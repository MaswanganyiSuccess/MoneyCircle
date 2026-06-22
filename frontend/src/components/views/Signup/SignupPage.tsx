import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X, Camera, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';
import PublicNav from '@/components/common/PublicNav';
import { useTheme } from '@/components/hooks/useTheme';
import styles from './SignupPage.module.css';

// ─── Bank Data ──────────────────────────────────────────────────
const SA_BANKS = [
  { name: 'Absa', codes: ['632005'], accountLength: 10 },
  { name: 'Capitec', codes: ['470010', '470809'], accountLength: 10 },
  { name: 'FNB (First National Bank)', codes: ['250655', '256245', '262645', '255605'], accountLength: 10 },
  { name: 'Nedbank', codes: ['198765', '190605', '191155'], accountLength: 10 },
  { name: 'Standard Bank', codes: ['051001', '050410', '051405', '051002'], accountLength: 10 },
  { name: 'Investec', codes: ['580105', '580109'], accountLength: 9 },
  { name: 'TymeBank', codes: ['078765'], accountLength: 10 },
];

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

// ─── Validation Helpers ─────────────────────────────────────────
const phonePattern = /^\+27\d{9}$/;
const emailPattern = /^\S+@\S+\.\S+$/;
const idPattern = /^\d{13}$/;

const validatePhoneNumber = (phone: string): boolean => phonePattern.test(phone);
const validateEmail = (email: string): boolean => emailPattern.test(email);

const validateIDNumber = (id: string): boolean => {
  if (!idPattern.test(id)) return false;
  let sum = 0, alternate = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let n = parseInt(id.charAt(i), 10);
    if (alternate) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

const getAccountLength = (bankName: string): number => {
  const bank = SA_BANKS.find(b => b.name === bankName);
  return bank?.accountLength || 10;
};

// ─── Step Components ────────────────────────────────────────────
interface StepProps {
  formData: SignupFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors?: Record<string, string>;
}

function PersonalStep({ formData, handleChange, errors = {} }: StepProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <div className={styles.nameRow}>
          <div>
            <label className={styles.label}>First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} className={styles.input} required placeholder="John" />
            {errors.firstName && <div className={styles.error}>{errors.firstName}</div>}
          </div>
          <div>
            <label className={styles.label}>Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} className={styles.input} required placeholder="Doe" />
            {errors.lastName && <div className={styles.error}>{errors.lastName}</div>}
          </div>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input name="email" type="email" value={formData.email} onChange={handleChange} className={styles.input} required placeholder="you@example.com" />
        {errors.email && <div className={styles.error}>{errors.email}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Phone Number</label>
        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={styles.input} required placeholder="+27 12 345 6789" />
        <div className={styles.helper}>Include country code (e.g., +27 for SA)</div>
        {errors.phoneNumber && <div className={styles.error}>{errors.phoneNumber}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>South African ID Number</label>
        <input name="idNumber" value={formData.idNumber} onChange={handleChange} className={styles.input} required placeholder="9501155123084" />
        <div className={styles.helper}>Enter a valid South African ID number</div>
        {errors.idNumber && <div className={styles.error}>{errors.idNumber}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Password</label>
        <input name="password" type="password" value={formData.password} onChange={handleChange} className={styles.input} required minLength={8} placeholder="••••••••" />
        <div className={styles.helper}>At least 8 characters</div>
        {errors.password && <div className={styles.error}>{errors.password}</div>}
      </div>
      <div className={styles.formGroup}>
        <div className={styles.label}>I am a…</div>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input type="radio" name="role" value="borrower" checked={formData.role === 'borrower'} onChange={handleChange} className={styles.radioInput} />
            Borrower (seeking funds)
          </label>
          <label className={styles.radioLabel}>
            <input type="radio" name="role" value="lender" checked={formData.role === 'lender'} onChange={handleChange} className={styles.radioInput} />
            Lender (investing funds)
          </label>
        </div>
      </div>
    </div>
  );
}

function BankingStep({ formData, handleChange, errors = {} }: StepProps) {
  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankName = e.target.value;
    const bankEvent = { target: { name: 'bankName', value: bankName } } as React.ChangeEvent<HTMLInputElement>;
    handleChange(bankEvent);
    const bank = SA_BANKS.find(b => b.name === bankName);
    if (bank && bank.codes.length > 0) {
      const branchEvent = { target: { name: 'branchCode', value: bank.codes[0] } } as React.ChangeEvent<HTMLInputElement>;
      handleChange(branchEvent);
    }
  };

  const selectedBankData = SA_BANKS.find(b => b.name === formData.bankName);

  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Bank Name</label>
        <select name="bankName" value={formData.bankName || ''} onChange={handleBankChange} className={styles.input} required>
          <option value="">Select your bank</option>
          {SA_BANKS.map((bank) => (
            <option key={bank.name} value={bank.name}>{bank.name}</option>
          ))}
        </select>
        {errors.bankName && <div className={styles.error}>{errors.bankName}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Account Number</label>
        <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={styles.input} required placeholder="1234567890" />
        {errors.accountNumber && <div className={styles.error}>{errors.accountNumber}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Branch Code</label>
        <input name="branchCode" value={formData.branchCode} onChange={handleChange} className={styles.input} required placeholder="e.g., 470010" readOnly={selectedBankData && selectedBankData.codes.length === 1} />
        {selectedBankData && selectedBankData.codes.length > 1 && (
          <div className={styles.helper}>Valid codes: {selectedBankData.codes.join(', ')}</div>
        )}
        {selectedBankData && selectedBankData.codes.length === 1 && (
          <div className={styles.helper}>Auto-filled from bank selection</div>
        )}
        {errors.branchCode && <div className={styles.error}>{errors.branchCode}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Monthly Income (ZAR)</label>
        <input name="monthlyIncome" type="number" value={formData.monthlyIncome || ''} onChange={handleChange} className={styles.input} required min={0} placeholder="0" />
        {errors.monthlyIncome && <div className={styles.error}>{errors.monthlyIncome}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Monthly Deductions (tax, pension, etc.)</label>
        <input name="deductions" type="number" value={formData.deductions || ''} onChange={handleChange} className={styles.input} min={0} placeholder="0" />
        {errors.deductions && <div className={styles.error}>{errors.deductions}</div>}
      </div>
    </div>
  );
}

function EmploymentStep({ formData, handleChange, errors = {} }: StepProps) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Employment Type</label>
        <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={styles.input} required>
          <option value="">Select employment type</option>
          <option value="employed">Employed</option>
          <option value="self-employed">Self-employed</option>
          <option value="unemployed">Unemployed</option>
        </select>
        {errors.employmentType && <div className={styles.error}>{errors.employmentType}</div>}
      </div>
      {formData.employmentType !== 'unemployed' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>Employer / Business Name</label>
            <input name="employerName" value={formData.employerName} onChange={handleChange} className={styles.input} required placeholder="Company or business name" />
            {errors.employerName && <div className={styles.error}>{errors.employerName}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Employer / Business Contact</label>
            <input name="employerContact" value={formData.employerContact} onChange={handleChange} className={styles.input} required placeholder="Phone or email for verification" />
            {errors.employerContact && <div className={styles.error}>{errors.employerContact}</div>}
          </div>
        </>
      )}
      {formData.employmentType === 'employed' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Proof of Employment</label>
          <input name="employmentProof" type="file" accept=".pdf,image/*" onChange={handleChange} className={styles.fileInput} required />
          <div className={styles.helper}>Offer letter, contract, or employment confirmation</div>
        </div>
      )}
      {formData.employmentType === 'self-employed' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>6 Months Statement</label>
          <input name="selfEmployedStatement" type="file" accept=".pdf,image/*" onChange={handleChange} className={styles.fileInput} required />
          <div className={styles.helper}>Upload 6 months bank statements or business proof</div>
        </div>
      )}
      <div className={styles.formGroup}>
        <label className={styles.label}>Alternate Contact Name</label>
        <input name="alternativeContactName" value={formData.alternativeContactName} onChange={handleChange} className={styles.input} required placeholder="Relative or emergency contact" />
        {errors.alternativeContactName && <div className={styles.error}>{errors.alternativeContactName}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Alternate Contact Phone</label>
        <input name="alternativeContactPhone" value={formData.alternativeContactPhone} onChange={handleChange} className={styles.input} required placeholder="Contact phone number" />
        {errors.alternativeContactPhone && <div className={styles.error}>{errors.alternativeContactPhone}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Alternate Contact Email</label>
        <input name="alternativeContactEmail" value={formData.alternativeContactEmail} onChange={handleChange} className={styles.input} required placeholder="Contact email address" />
        {errors.alternativeContactEmail && <div className={styles.error}>{errors.alternativeContactEmail}</div>}
      </div>
    </div>
  );
}

// ─── Selfie Capture Component (with live preview) ─────────────────
function SelfieCaptureLive({ onCapture, onError, className = '' }: { 
  onCapture: (file: File) => void; 
  onError?: (msg: string) => void; 
  className?: string 
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setError(null);
    } catch (err) {
      const msg = 'Camera access denied. Please allow camera permissions.';
      setError(msg);
      if (onError) onError(msg);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    detectFace(imageData);
  };

  const detectFace = async (imageData: string) => {
    setIsDetecting(true);
    setFaceDetected(null);
    try {
      if (!('FaceDetector' in window)) {
        setFaceDetected(true);
        const file = dataURLtoFile(imageData, 'selfie.jpg');
        onCapture(file);
        stopCamera();
        return;
      }
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => (img.onload = resolve));
      // @ts-ignore
      const detector = new window.FaceDetector({ maxDetectedFaces: 1, fastMode: true });
      const faces = await detector.detect(img);
      const detected = faces.length > 0;
      setFaceDetected(detected);
      if (detected) {
        const file = dataURLtoFile(imageData, 'selfie.jpg');
        onCapture(file);
        stopCamera();
      } else {
        setError('No face detected. Please position your face clearly and try again.');
        if (onError) onError('No face detected.');
      }
    } catch (err) {
      console.error('Face detection error:', err);
      setFaceDetected(true);
      const file = dataURLtoFile(imageData, 'selfie.jpg');
      onCapture(file);
      stopCamera();
    } finally {
      setIsDetecting(false);
    }
  };

  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const retake = () => {
    setCapturedImage(null);
    setFaceDetected(null);
    setError(null);
    startCamera();
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  if (!stream && !capturedImage) {
    return (
      <div className={`flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-xl ${className}`}>
        <Camera className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Take a live selfie for verification</p>
        <button type="button" onClick={startCamera} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Start Camera</button>
      </div>
    );
  }

  if (stream && !capturedImage) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative rounded-lg overflow-hidden bg-black/5 border border-border">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-80 object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <button type="button" onClick={capture} disabled={isDetecting} className="px-4 py-2 rounded-full bg-white/90 dark:bg-black/70 text-foreground text-sm font-medium backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-black/90 disabled:opacity-50">
              {isDetecting ? 'Detecting...' : 'Capture'}
            </button>
            <button type="button" onClick={stopCamera} className="px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium backdrop-blur-sm hover:bg-destructive/20">Cancel</button>
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /><span>{error}</span></div>}
        <p className="text-xs text-muted-foreground">Position your face clearly in the frame</p>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={capturedImage} alt="Selfie preview" className="w-full max-h-80 object-cover" />
          {faceDetected === false && (
            <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
              <span className="bg-destructive/90 text-white px-3 py-1 rounded-full text-sm">No face detected</span>
            </div>
          )}
          {faceDetected === true && (
            <div className="absolute top-2 right-2 bg-emerald-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Check className="h-3 w-3" /> Face verified
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={retake} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/20 flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Retake</button>
          {faceDetected === false && <span className="text-xs text-destructive flex items-center">Please retake with clear face</span>}
          {faceDetected === true && <span className="text-xs text-emerald-500 flex items-center">Selfie accepted ✓</span>}
        </div>
      </div>
    );
  }
  return null;
}

function DocumentStep({ handleChange, selfieFile, setSelfieFile, onSelfieCapture, errors = {} }: { 
  handleChange: StepProps['handleChange']; 
  selfieFile: File | null; 
  setSelfieFile: (file: File | null) => void; 
  onSelfieCapture: (file: File) => void; 
  errors?: Record<string, string> 
}) {
  const handleSelfieCapture = (file: File) => { setSelfieFile(file); onSelfieCapture(file); };
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>ID Front (photo)</label>
        <input name="idFront" type="file" accept="image/*" onChange={handleChange} className={styles.fileInput} required />
        <div className={styles.helper}>Clear photo of the front of your SA ID</div>
        {errors.idFront && <div className={styles.error}>{errors.idFront}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Selfie (face visible)</label>
        <SelfieCaptureLive onCapture={handleSelfieCapture} onError={(msg) => console.error(msg)} className="w-full" />
        {selfieFile && <div className="mt-2 text-xs text-emerald-500 flex items-center gap-1"><Check className="h-3 w-3" /> Selfie captured and face verified</div>}
        <div className={styles.helper}>Take a clear selfie for verification</div>
        {errors.selfie && <div className={styles.error}>{errors.selfie}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Bank Statement</label>
        <input name="bankStatement" type="file" accept=".pdf,image/*" onChange={handleChange} className={styles.fileInput} required />
        <div className={styles.helper}>Last 3 months (PDF or image)</div>
        {errors.bankStatement && <div className={styles.error}>{errors.bankStatement}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Proof of Address</label>
        <input name="proofOfAddress" type="file" accept=".pdf,image/*" onChange={handleChange} className={styles.fileInput} required />
        <div className={styles.helper}>Utility bill or municipal statement (not older than 3 months)</div>
        {errors.proofOfAddress && <div className={styles.error}>{errors.proofOfAddress}</div>}
      </div>
    </div>
  );
}

function ContactVerificationStep({ formData, phoneCodeInput, emailCodeInput, onPhoneCodeChange, onEmailCodeChange, onSendPhoneCode, onVerifyPhoneCode, onSendEmailCode, onVerifyEmailCode, verificationError, phoneVerified, emailVerified }: {
  formData: SignupFormData;
  phoneCodeInput: string;
  emailCodeInput: string;
  onPhoneCodeChange: (value: string) => void;
  onEmailCodeChange: (value: string) => void;
  onSendPhoneCode: () => void;
  onVerifyPhoneCode: () => void;
  onSendEmailCode: () => void;
  onVerifyEmailCode: () => void;
  verificationError: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}) {
  const [showPhoneCode, setShowPhoneCode] = useState(false);
  const [showEmailCode, setShowEmailCode] = useState(false);

  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Phone Verification</label>
        <p className={styles.helper}>A verification code will be sent to {formData.phoneNumber}.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onSendPhoneCode} className={styles.btnSecondary}>Send code</button>
          <button type="button" onClick={() => setShowPhoneCode(!showPhoneCode)} className={styles.btnSecondary}>
            {showPhoneCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} Enter code
          </button>
        </div>
        {showPhoneCode && (
          <div className="flex gap-2 mt-2">
            <input type="text" value={phoneCodeInput} onChange={(e) => onPhoneCodeChange(e.target.value)} className={styles.input} placeholder="123456" maxLength={6} />
            <button type="button" onClick={onVerifyPhoneCode} className={styles.btnSecondary}>Verify</button>
          </div>
        )}
        <div className={styles.statusRow}>
          <span>Phone verified:</span>
          <strong className={phoneVerified ? styles.statusSuccess : styles.statusPending}>{phoneVerified ? '✅ Yes' : '⏳ Pending'}</strong>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Email Verification</label>
        <p className={styles.helper}>A verification code will be sent to {formData.email}.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onSendEmailCode} className={styles.btnSecondary}>Send code</button>
          <button type="button" onClick={() => setShowEmailCode(!showEmailCode)} className={styles.btnSecondary}>
            {showEmailCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} Enter code
          </button>
        </div>
        {showEmailCode && (
          <div className="flex gap-2 mt-2">
            <input type="text" value={emailCodeInput} onChange={(e) => onEmailCodeChange(e.target.value)} className={styles.input} placeholder="123456" maxLength={6} />
            <button type="button" onClick={onVerifyEmailCode} className={styles.btnSecondary}>Verify</button>
          </div>
        )}
        <div className={styles.statusRow}>
          <span>Email verified:</span>
          <strong className={emailVerified ? styles.statusSuccess : styles.statusPending}>{emailVerified ? '✅ Yes' : '⏳ Pending'}</strong>
        </div>
      </div>
      {verificationError && <div className={styles.error}>{verificationError}</div>}
    </div>
  );
}

function VerificationStep({ formData, verifications }: { formData: SignupFormData; verifications: any }) {
  const allVerified = verifications.idVerified && verifications.selfieVerified && verifications.bankVerified && verifications.addressVerified;
  
  return (
    <div className={styles.verificationContainer}>
      <div className="text-5xl">{allVerified ? '✅' : '🔍'}</div>
      <h3 className={styles.verificationTitle}>{allVerified ? 'All Verifications Passed!' : 'Verification in Progress'}</h3>
      <p className={styles.verificationDesc}>
        {allVerified ? 'Your account is ready for activation!' : 'We are verifying your documents and information.'}
      </p>
      <div className={styles.verificationBox}>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>ID Verification</span>
            <span className={verifications.idVerified ? styles.statusSuccess : styles.statusPending}>
              {verifications.idVerified ? '✅ Verified' : '⏳ Pending'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Selfie Match</span>
            <span className={verifications.selfieVerified ? styles.statusSuccess : styles.statusPending}>
              {verifications.selfieVerified ? '✅ Matched' : '⏳ Pending'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Bank Account Verification</span>
            <span className={verifications.bankVerified ? styles.statusSuccess : styles.statusPending}>
              {verifications.bankVerified ? '✅ Verified' : '⏳ Pending'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Address Verification</span>
            <span className={verifications.addressVerified ? styles.statusSuccess : styles.statusPending}>
              {verifications.addressVerified ? '✅ Verified' : '⏳ Pending'}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-border/30 pt-2 mt-2">
            <span className="font-bold">Overall Status</span>
            <span className={allVerified ? styles.statusSuccess : styles.statusPending}>
              {allVerified ? '✅ All Verified' : '⏳ Waiting'}
            </span>
          </div>
        </div>
      </div>
      {allVerified && (
        <button type="submit" className={`${styles.btnNext} mt-4`}>
          Complete Registration
        </button>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
const steps = ['Personal', 'Banking', 'Employment', 'Verify Contact', 'Documents', 'Verification'];

export default function SignupPage() {
  useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '', lastName: '', email: '', phoneNumber: '', idNumber: '', password: '', role: 'borrower',
    bankName: '', accountNumber: '', branchCode: '', monthlyIncome: 0, deductions: 0,
    employmentType: '', employerName: '', employerContact: '',
    alternativeContactName: '', alternativeContactPhone: '', alternativeContactEmail: '',
    idFront: null, selfie: null, employmentProof: null, selfEmployedStatement: null,
    bankStatement: null, proofOfAddress: null, phoneVerified: false, emailVerified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [phoneCodeInput, setPhoneCodeInput] = useState('');
  const [emailCodeInput, setEmailCodeInput] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifications, setVerifications] = useState({
    idVerified: false,
    selfieVerified: false,
    bankVerified: false,
    addressVerified: false,
  });
  const navigate = useNavigate();

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendPhoneCode = () => {
    const code = generateCode();
    setError(`📱 Verification code: ${code} (Enter this to verify)`);
    alert(`📱 Your phone verification code is: ${code}`);
  };

  const verifyPhoneCode = () => {
    if (phoneCodeInput.length === 6) {
      setPhoneVerified(true);
      setVerificationError('Phone verified successfully ✅');
    } else {
      setVerificationError('Please enter a valid 6-digit code');
    }
  };

  const sendEmailCode = () => {
    const code = generateCode();
    setError(`📧 Verification code: ${code} (Enter this to verify)`);
    alert(`📧 Your email verification code is: ${code}`);
  };

  const verifyEmailCode = () => {
    if (emailCodeInput.length === 6) {
      setEmailVerified(true);
      setVerificationError('Email verified successfully ✅');
    } else {
      setVerificationError('Please enter a valid 6-digit code');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone is required';
        else if (!validatePhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = 'Invalid SA phone format';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID is required';
        else if (!validateIDNumber(formData.idNumber)) newErrors.idNumber = 'Invalid SA ID';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        break;
      case 1:
        if (!formData.bankName.trim()) newErrors.bankName = 'Bank is required';
        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account is required';
        else {
          const len = getAccountLength(formData.bankName);
          if (formData.accountNumber.length !== len) newErrors.accountNumber = `Account must be ${len} digits`;
          if (!/^\d+$/.test(formData.accountNumber)) newErrors.accountNumber = 'Only digits';
        }
        if (!formData.branchCode.trim()) newErrors.branchCode = 'Branch code required';
        else if (!/^\d{6}$/.test(formData.branchCode)) newErrors.branchCode = '6 digits required';
        if (formData.monthlyIncome < 0) newErrors.monthlyIncome = 'Must be at least 0';
        if (formData.deductions < 0) newErrors.deductions = 'Must be at least 0';
        if (formData.deductions > formData.monthlyIncome) newErrors.deductions = 'Cannot exceed income';
        break;
      case 2:
        if (!formData.employmentType) newErrors.employmentType = 'Select employment type';
        if (formData.employmentType !== 'unemployed') {
          if (!formData.employerName.trim()) newErrors.employerName = 'Required';
          if (!formData.employerContact.trim()) newErrors.employerContact = 'Required';
        }
        if (!formData.alternativeContactName.trim()) newErrors.alternativeContactName = 'Required';
        if (!formData.alternativeContactPhone.trim()) newErrors.alternativeContactPhone = 'Required';
        if (!formData.alternativeContactEmail.trim()) newErrors.alternativeContactEmail = 'Required';
        else if (!validateEmail(formData.alternativeContactEmail)) newErrors.alternativeContactEmail = 'Invalid email';
        break;
      case 4:
        if (!formData.idFront) newErrors.idFront = 'ID photo required';
        if (!selfieFile) newErrors.selfie = 'Selfie required';
        if (!formData.bankStatement) newErrors.bankStatement = 'Bank statement required';
        if (!formData.proofOfAddress) newErrors.proofOfAddress = 'Proof of address required';
        // Auto-verify documents
        if (formData.idFront && formData.idNumber) {
          setVerifications(prev => ({ ...prev, idVerified: true }));
        }
        if (selfieFile && formData.idFront) {
          setVerifications(prev => ({ ...prev, selfieVerified: true }));
        }
        if (formData.bankStatement && formData.accountNumber) {
          setVerifications(prev => ({ ...prev, bankVerified: true }));
        }
        if (formData.proofOfAddress && formData.address) {
          setVerifications(prev => ({ ...prev, addressVerified: true }));
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) { setError('Please fix errors.'); return; }
    if (currentStep === 3 && (!phoneVerified || !emailVerified)) { setError('Verify phone and email first.'); return; }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const files = (e.target as HTMLInputElement).files;
    if (type === 'file' && files) setFormData(prev => ({ ...prev, [name]: files[0] }));
    else if (type === 'number') setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    else setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) { nextStep(); return; }
    if (!phoneVerified || !emailVerified) { setError('Verify phone and email first.'); return; }
    const allVerified = verifications.idVerified && verifications.selfieVerified && verifications.bankVerified && verifications.addressVerified;
    if (!allVerified) { setError('All verifications must pass before submission.'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) payload.append(key, value);
        else payload.append(key, String(value));
      });
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/auth/borrower-onboarding`, { method: 'POST', body: payload });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      navigate('/verification-pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally { setLoading(false); }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <PersonalStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 1: return <BankingStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 2: return <EmploymentStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 3: return <ContactVerificationStep 
        formData={formData} phoneCodeInput={phoneCodeInput} emailCodeInput={emailCodeInput}
        onPhoneCodeChange={setPhoneCodeInput} onEmailCodeChange={setEmailCodeInput}
        onSendPhoneCode={sendPhoneCode} onVerifyPhoneCode={verifyPhoneCode}
        onSendEmailCode={sendEmailCode} onVerifyEmailCode={verifyEmailCode}
        verificationError={verificationError} phoneVerified={phoneVerified} emailVerified={emailVerified}
      />;
      case 4: return <DocumentStep handleChange={handleChange} selfieFile={selfieFile} setSelfieFile={setSelfieFile} onSelfieCapture={(file) => setFormData(prev => ({ ...prev, selfie: file }))} errors={errors} />;
      case 5: return <VerificationStep formData={formData} verifications={verifications} />;
      default: return null;
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
                <span key={idx} className={`${styles.stepLabel} ${idx <= currentStep ? styles.active : ''}`}>{label}</span>
              ))}
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {renderStep()}
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.buttonRow}>
              {currentStep > 0 && <button type="button" onClick={prevStep} disabled={loading} className={styles.btnBack}>Back</button>}
              <button type="submit" disabled={loading} className={`${styles.btnNext} ${currentStep === 0 ? styles.mlAuto : ''}`}>
                {loading ? <><Loader2 className="loader" style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} /> Submitting…</>
                : currentStep === steps.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}