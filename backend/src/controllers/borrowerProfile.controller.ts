import { Request, Response } from 'express';
import { BorrowerProfileService } from '../services/borrowerProfile.service';
import { borrowerProfileSchema } from '../validators/borrowerProfile.validator';

// Extend Express Request to include `user` (populated by auth middleware)
interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
    // add other fields as needed
  };
}

export class BorrowerProfileController {
  static async upsertProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const validatedData = borrowerProfileSchema.parse(req.body);
      const profile = await BorrowerProfileService.upsertProfile(userId, validatedData);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      // Properly handle unknown error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ success: false, error: errorMessage });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const profile = await BorrowerProfileService.getProfile(userId);
      if (!profile) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
}