import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User.model';
import { sendError } from '../utils/helpers';
import { AuthenticatedRequest } from '../types';

export const authenticate = async (
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

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      sendError(res, 'User not found', 401);
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