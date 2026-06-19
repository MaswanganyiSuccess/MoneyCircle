import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/helpers';
import { updateProfileSchema, changePasswordSchema, listUsersQuerySchema } from '../validators/user.validator';
import { ZodError } from 'zod';

export class UserController {
  // GET /api/users/me
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await UserService.getProfile(req.user!.id);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // PUT /api/users/me
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await UserService.updateProfile(req.user!.id, data);
      await UserService.logAction(req.user!.id, 'UPDATE_PROFILE', data, req.ip, req.headers['user-agent']);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/users/:id (admin only)
  static async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/users (admin only)
  static async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const query = listUsersQuerySchema.parse(req.query);
      const result = await UserService.listUsers(
        {
          role: query.role,
          status: query.status,
          search: query.search,
        },
        {
          page: query.page,
          limit: query.limit,
          sort: query.sort,
        }
      );
      sendSuccess(res, result, 'Users retrieved successfully');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 500);
    }
  }

  // PUT /api/users/change-password
  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await UserService.changePassword(req.user!.id, currentPassword, newPassword);
      await UserService.logAction(req.user!.id, 'CHANGE_PASSWORD', {}, req.ip, req.headers['user-agent']);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 400);
    }
  }

  // POST /api/users/upload-avatar
  static async uploadAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }
      const filePath = `/uploads/${req.file.filename}`;
      const user = await UserService.uploadAvatar(req.user!.id, filePath);
      await UserService.logAction(req.user!.id, 'UPLOAD_AVATAR', { filePath }, req.ip, req.headers['user-agent']);
      sendSuccess(res, { avatar: filePath }, 'Avatar uploaded successfully');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // POST /api/users/kyc
  static async submitKyc(req: AuthenticatedRequest, res: Response) {
    try {
      const documents = {
        idDocument: req.body.idDocument,
        proofOfAddress: req.body.proofOfAddress,
        selfie: req.body.selfie,
      };
      const user = await UserService.submitKyc(req.user!.id, documents);
      await UserService.logAction(req.user!.id, 'SUBMIT_KYC', documents, req.ip, req.headers['user-agent']);
      sendSuccess(res, { kycStatus: user?.kycStatus }, 'KYC submitted successfully');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/users/kyc/status
  static async getKycStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const status = await UserService.getKycStatus(req.user!.id);
      sendSuccess(res, status, 'KYC status retrieved');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // DELETE /api/users/me
  static async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      await UserService.deleteAccount(req.user!.id);
      await UserService.logAction(req.user!.id, 'DELETE_ACCOUNT', {}, req.ip, req.headers['user-agent']);
      sendSuccess(res, null, 'Account deleted successfully');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }
}