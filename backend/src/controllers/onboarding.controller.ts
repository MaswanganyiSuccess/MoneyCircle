import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { BorrowerOnboarding } from '../models/BorrowerOnboarding.model';
import { User } from '../models/User.model';
import { uploadToCloud } from '../utils/upload';
import { hashPassword } from '../services/auth.service';
import { borrowerOnboardingSchema } from '../validators/onboarding.validator';
import { validateSAID } from '../utils/id-validator';
import { sendError, sendSuccess } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export const submitOnboarding = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (
      !files?.idFront?.[0] ||
      !files?.selfie?.[0] ||
      !files?.bankStatement?.[0] ||
      !files?.proofOfAddress?.[0]
    ) {
      return sendError(res, 'All required documents must be uploaded', 400);
    }

    const parsed = borrowerOnboardingSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [{ email: parsed.email.toLowerCase() }, { idNumber: parsed.idNumber }],
    });

    if (existingUser) {
      return sendError(res, 'A user with this email or ID number already exists', 409);
    }

    const idValidation = validateSAID(parsed.idNumber);
    if (!idValidation.isValid) {
      return sendError(res, 'Invalid South African ID number', 400, idValidation.errors.map((message) => ({ message })));
    }

    const [idFrontUrl, selfieUrl, bankStatementUrl, proofOfAddressUrl] = await Promise.all([
      uploadToCloud(files.idFront[0]),
      uploadToCloud(files.selfie[0]),
      uploadToCloud(files.bankStatement[0]),
      uploadToCloud(files.proofOfAddress[0]),
    ]);

    const hashedPassword = await hashPassword(parsed.password);

    const user = new User({
      email: parsed.email.toLowerCase(),
      passwordHash: hashedPassword,
      firstName: parsed.firstName.trim(),
      lastName: parsed.lastName.trim(),
      phoneNumber: parsed.phoneNumber,
      idNumber: parsed.idNumber,
      role: parsed.role,
      isEmailVerified: parsed.emailVerified,
      status: 'pending',
      kycStatus: 'pending',
      kycDocuments: {
        idDocument: idFrontUrl,
        proofOfAddress: proofOfAddressUrl,
        selfie: selfieUrl,
      },
      dateOfBirth: idValidation.parsed?.dateOfBirth,
      gender: idValidation.parsed?.gender,
      age: idValidation.parsed?.age,
    });

    await user.save();

    const onboarding = new BorrowerOnboarding({
      userId: user._id,
      personal: {
        firstName: parsed.firstName.trim(),
        lastName: parsed.lastName.trim(),
        email: parsed.email.toLowerCase(),
        phone: parsed.phoneNumber,
        idNumber: parsed.idNumber,
        password: hashedPassword,
        role: parsed.role,
      },
      banking: {
        bankName: parsed.bankName.trim(),
        accountNumber: parsed.accountNumber,
        branchCode: parsed.branchCode,
        monthlyIncome: parsed.monthlyIncome,
        deductions: parsed.deductions,
      },
      documents: {
        idFront: idFrontUrl,
        selfie: selfieUrl,
        bankStatement: bankStatementUrl,
        proofOfAddress: proofOfAddressUrl,
      },
      verification: {
        status: 'pending',
        score: 0,
        idExtracted: {
          fullName: `${parsed.firstName.trim()} ${parsed.lastName.trim()}`,
          idNumber: parsed.idNumber,
          photo: selfieUrl,
        },
        selfieMatch: false,
        accountMatch: false,
        notes: 'Awaiting verification',
      },
    });

    const savedOnboarding = await onboarding.save();

    return sendSuccess(res, { onboardingId: savedOnboarding._id, userId: user._id }, 'Onboarding submitted successfully', 201);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, error.errors);
    }

    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }));
      return sendError(res, 'Validation failed', 400, errors);
    }

    return sendError(res, 'Internal server error', 500);
  }
};