import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { authService } from '../services/auth.service';
import { MongoServerError } from 'mongodb';
import { sendSuccess, sendError } from '../utils/helpers';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await authService.register(validatedData);
      sendSuccess(res, user, 'User registered successfully', 201);
    } catch (error) {
      // Handle duplicate key error (MongoDB code 11000)
      if (error instanceof MongoServerError && error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        sendError(res, `${field} already exists`, 409);
        return;
      }

      // ✅ Handle SA ID validation error (thrown in pre('validate') hook)
      if (error instanceof Error && error.message.includes('Invalid South African ID')) {
        sendError(res, error.message, 400);
        return;
      }

      // Handle Mongoose validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        const firstError = Object.values(error.errors)[0];
        const message = firstError?.message || 'Validation error';
        sendError(res, message, 400);
        return;
      }

      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const tokens = await authService.refreshToken(refreshToken);
      sendSuccess(res, tokens, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (userId) {
        await authService.logout(userId);
      }
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const resetToken = await authService.forgotPassword(email);
      sendSuccess(res, { resetToken }, 'Password reset link sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, password);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AppError('Unauthorized', 401);
      }
      sendSuccess(res, user, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();