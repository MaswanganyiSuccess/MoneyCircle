import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Loan } from '../models/Loan.model';
import { LoanService } from '../services/loan.service';
import { AmortizationService } from '../services/amortization.service';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess, sendError } from '../utils/helpers';
import {
  applyLoanSchema,
  fundLoanSchema,
  updateLoanStatusSchema,
  repaymentSchema,
  listLoansQuerySchema,
} from '../validators/loan.validator';
import { ZodError } from 'zod';

export class LoanController {
  // POST /api/loans
  static async applyLoan(req: AuthenticatedRequest, res: Response) {
    try {
      const data = applyLoanSchema.parse(req.body);
      // ✅ Explicitly pass required fields – Zod ensures they exist, so `!` is safe.
      const loan = await LoanService.applyLoan(req.user!.id, {
        amount: data.amount!,
        termMonths: data.termMonths!,
        purpose: data.purpose!,
        loanType: data.loanType!,
        collateral: data.collateral,
      });
      sendSuccess(res, loan, 'Loan application submitted successfully', 201);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 400);
    }
  }

  // GET /api/loans/my
  static async getMyLoans(req: AuthenticatedRequest, res: Response) {
    try {
      const { status } = req.query;
      const loans = await LoanService.getBorrowerLoans(req.user!.id, status as string);
      sendSuccess(res, loans, 'Loans retrieved');
    } catch (error) {
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/loans/available
  static async getAvailableLoans(req: AuthenticatedRequest, res: Response) {
    try {
      const query = listLoansQuerySchema.parse(req.query);
      const result = await LoanService.getAvailableLoans(req.user!.id, {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      });
      sendSuccess(res, result, 'Available loans retrieved');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/loans/:id
  static async getLoanDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const loan = await LoanService.getLoanDetails(req.params.id);
      sendSuccess(res, loan, 'Loan details retrieved');
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  // PUT /api/loans/:id/status (admin only)
  static async updateLoanStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, reason } = updateLoanStatusSchema.parse(req.body);
      const loan = await LoanService.updateLoanStatus(req.params.id, status, reason);
      sendSuccess(res, loan, 'Loan status updated');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 400);
    }
  }

  // POST /api/loans/:id/fund
  static async fundLoan(req: AuthenticatedRequest, res: Response) {
    try {
      const loan = await LoanService.fundLoan(req.params.id, req.user!.id);
      sendSuccess(res, loan, 'Loan funded successfully');
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  // GET /api/loans/:id/repayments
  static async getRepaymentSchedule(req: AuthenticatedRequest, res: Response) {
    try {
      const repayments = await LoanService.getRepaymentSchedule(req.params.id);
      sendSuccess(res, repayments, 'Repayment schedule retrieved');
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  // POST /api/loans/:id/repay
  static async makeRepayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount } = repaymentSchema.parse(req.body);
      const repayment = await LoanService.makeRepayment(req.params.id, amount, req.user!.id);
      sendSuccess(res, repayment, 'Repayment successful');
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'Validation error', 400, error.errors);
      }
      sendError(res, (error as Error).message, 400);
    }
  }

  // POST /api/loans/:id/repayments/:repaymentId/pay
  static async payRepayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id, repaymentId } = req.params;
      const loan = await Loan.findById(id);
      if (!loan) {
        throw new AppError('Loan not found', 404);
      }
      if (loan.borrowerId.toString() !== req.user!.id) {
        throw new AppError('Unauthorized', 403);
      }
      const repayment = await AmortizationService.markRepaymentPaid(id, repaymentId);
      sendSuccess(res, repayment, 'Repayment paid successfully');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, (error as Error).message, 400);
      }
    }
  }

  // GET /api/loans/:id/settlement
  static async getSettlementAmount(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const loan = await Loan.findById(id);
      if (!loan) {
        throw new AppError('Loan not found', 404);
      }
      if (loan.borrowerId.toString() !== req.user!.id && req.user!.role !== 'admin') {
        throw new AppError('Unauthorized', 403);
      }
      const settlement = await AmortizationService.processEarlySettlement(id);
      sendSuccess(res, settlement, 'Early settlement amount calculated');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, (error as Error).message, 400);
      }
    }
  }
}