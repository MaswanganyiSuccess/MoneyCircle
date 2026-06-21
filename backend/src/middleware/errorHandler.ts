import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { sendError } from '../utils/helpers';

export class AppError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode = 400, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  const isZodError =
    err instanceof ZodError ||
    (err && typeof err === 'object' && Array.isArray((err as any).errors));

  if (isZodError) {
    const zodError = err as ZodError;
    const errorMessages = (zodError.errors || []).map((e: any) => ({
      path: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
      message: e.message,
    }));
    sendError(res, 'Validation error', 400, errorMessages);
    return;
  }

  sendError(res, 'Internal Server Error', 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};