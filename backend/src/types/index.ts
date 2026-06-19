import { Request } from 'express';
import { IUser } from '../models/User.model';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}