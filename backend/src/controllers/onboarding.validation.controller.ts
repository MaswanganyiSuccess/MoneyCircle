import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { validateOnboardingField } from '../validators/onboarding.validator';
import { sendError, sendSuccess } from '../utils/helpers';

export const validateOnboardingFieldController = async (req: Request, res: Response) => {
  try {
    const { field, value, bankName } = req.body as {
      field: string;
      value: any;
      bankName?: string;
    };

    if (!field) {
      return sendError(res, 'Validation field is required', 400);
    }

    const validation = validateOnboardingField(field, value, bankName);
    if (!validation.isValid) {
      return sendError(res, validation.error || 'Field validation failed', 400);
    }

    if (field === 'email') {
      const emailExists = await User.exists({ email: String(value).toLowerCase() });
      if (emailExists) {
        return sendError(res, 'Email already exists', 409);
      }
    }

    if (field === 'idNumber') {
      const idExists = await User.exists({ idNumber: String(value) });
      if (idExists) {
        return sendError(res, 'ID number already exists', 409);
      }
    }

    if (field === 'phoneNumber') {
      const phoneExists = await User.exists({ phoneNumber: String(value) });
      if (phoneExists) {
        return sendError(res, 'Phone number already exists', 409);
      }
    }

    return sendSuccess(res, { field, valid: true }, 'Field is valid');
  } catch (error) {
    return sendError(res, 'Field validation failed', 500);
  }
};