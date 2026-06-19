import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400,
  errors?: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};

export const getPagination = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  keysToRemove: (keyof T)[]
): Partial<T> => {
  const sanitized = { ...obj };
  keysToRemove.forEach((key) => delete sanitized[key]);
  return sanitized;
};