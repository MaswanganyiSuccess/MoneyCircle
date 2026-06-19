import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { CreditService } from '../services/credit.service';
import { sendSuccess, sendError } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class CreditController {
  // POST /api/credit/check – Pull credit report (soft pull)
  static async pullCredit(req: AuthenticatedRequest, res: Response) {
    try {
      const report = await CreditService.pullCreditReport(req.user!.id);
      sendSuccess(res, report, 'Credit report pulled successfully');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/credit/score – Get current credit grade
  static async getCreditScore(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await CreditService.getCreditScore(req.user!.id);
      sendSuccess(res, result, 'Credit score retrieved');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/credit/improvement – Get suggestions to improve score
  static async getImprovementSuggestions(req: AuthenticatedRequest, res: Response) {
    try {
      const suggestions = await CreditService.getImprovementSuggestions(req.user!.id);
      sendSuccess(res, suggestions, 'Improvement suggestions retrieved');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // POST /api/credit/refresh – Refresh credit score (monthly limit)
  static async refreshCredit(req: AuthenticatedRequest, res: Response) {
    try {
      const report = await CreditService.refreshCreditScore(req.user!.id);
      sendSuccess(res, report, 'Credit score refreshed successfully');
    } catch (error) {
      if ((error as any).statusCode === 429) {
        return sendError(res, (error as Error).message, 429);
      }
      sendError(res, (error as Error).message, 500);
    }
  }
}