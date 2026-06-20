import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { InvestmentService } from '../services/investment.service';
import { sendSuccess, sendError } from '../utils/helpers';
import { z } from 'zod';

const fundLoanSchema = z.object({
  amount: z.number().min(1000, 'Minimum investment is R1,000'),
});

const autoInvestSchema = z.object({
  maxAmount: z.number().optional(),
  minTerm: z.number().optional(),
  maxTerm: z.number().optional(),
  maxInterestRate: z.number().optional(),
  creditGrade: z.enum(['A+', 'A', 'B', 'C', 'D', 'E']).optional(),
  maxInvestmentPerLoan: z.number().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().default('-createdAt'),
  status: z.enum(['pending', 'active', 'completed', 'defaulted']).optional(),
});

export class InvestmentController {
  // GET /api/loans/available
  static async getAvailableLoans(req: AuthenticatedRequest, res: Response) {
    try {
      const query = listQuerySchema.parse(req.query);
      const filters = {
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        minTerm: req.query.minTerm ? Number(req.query.minTerm) : undefined,
        maxTerm: req.query.maxTerm ? Number(req.query.maxTerm) : undefined,
        maxInterestRate: req.query.maxInterestRate ? Number(req.query.maxInterestRate) : undefined,
        creditGrade: req.query.creditGrade as string,
      };
      const result = await InvestmentService.getAvailableLoans(filters, {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      });
      sendSuccess(res, result, 'Available loans retrieved');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 500);
    }
  }

  // POST /api/loans/:id/fund
  static async fundLoan(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount } = fundLoanSchema.parse(req.body);
      const result = await InvestmentService.fundLoan(req.params.id, req.user!.id, amount);
      sendSuccess(res, result, 'Loan funded successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 400);
    }
  }

  // GET /api/lender/investments
  static async getLenderInvestments(req: AuthenticatedRequest, res: Response) {
    try {
      const query = listQuerySchema.parse(req.query);
      const result = await InvestmentService.getLenderInvestments(req.user!.id, {
        page: query.page,
        limit: query.limit,
        status: query.status,
      });
      sendSuccess(res, result, 'Investments retrieved');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/loans/:id/investors
  static async getLoanInvestors(req: AuthenticatedRequest, res: Response) {
    try {
      const query = listQuerySchema.parse(req.query);
      const result = await InvestmentService.getLoanInvestors(req.params.id, {
        page: query.page,
        limit: query.limit,
      });
      sendSuccess(res, result, 'Investors retrieved');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 404);
    }
  }

  // POST /api/lender/auto-invest
  static async autoInvest(req: AuthenticatedRequest, res: Response) {
    try {
      const criteria = autoInvestSchema.parse(req.body);
      const result = await InvestmentService.autoInvest(req.user!.id, criteria);
      sendSuccess(res, result, 'Auto-invest completed');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 400);
    }
  }

  // GET /api/lender/dashboard
  static async getLenderDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await InvestmentService.getLenderDashboard(req.user!.id);
      sendSuccess(res, result, 'Dashboard retrieved');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }
}