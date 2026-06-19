import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User.model';
import { sendError } from '../utils/helpers';
import { AuthenticatedRequest, TokenPayload } from '../types';
import { authService } from '../services/auth.service';

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const decoded = await authService.verifyAccessToken(token);
    if (!decoded) {
      sendError(res, 'Invalid or expired token', 401);
      return;
    }

    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    if (user.isLocked()) {
      sendError(res, 'Account is locked', 401);
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || !roles.includes(user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }
    next();
  };
};

export const adminOnly = requireRole('admin');
export const requireBorrower = requireRole('borrower');
export const requireLender = requireRole('lender');