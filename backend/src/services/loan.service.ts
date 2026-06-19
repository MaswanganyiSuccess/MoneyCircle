import { Loan, ILoan } from '../models/Loan.model';
import { Repayment, IRepayment } from '../models/Repayment.model';
import { User, IUser } from '../models/User.model';
import { AuditLog } from '../models/AuditLog.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { AmortizationService } from './amortization.service';
import mongoose from 'mongoose';

export class LoanService {
  /**
   * Calculate monthly payment using standard amortisation formula.
   * (Kept for backward compatibility)
   */
  static calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  /**
   * Generate amortisation schedule (repayment schedule) for a loan.
   * (Kept for backward compatibility)
   */
  static generateRepaymentSchedule(
    loanId: mongoose.Types.ObjectId,
    principal: number,
    annualRate: number,
    termMonths: number,
    startDate: Date
  ): Array<{
    dueDate: Date;
    dueAmount: number;
    interestPortion: number;
    principalPortion: number;
    remainingBalance: number;
  }> {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, termMonths);
    const schedule = [];
    let balance = principal;

    for (let i = 1; i <= termMonths; i++) {
      const interestPortion = balance * monthlyRate;
      const principalPortion = monthlyPayment - interestPortion;
      balance -= principalPortion;
      if (i === termMonths) {
        balance = 0;
      }
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({
        dueDate,
        dueAmount: monthlyPayment,
        interestPortion,
        principalPortion,
        remainingBalance: balance < 0 ? 0 : balance,
      });
    }
    return schedule;
  }

  /**
   * Check if borrower is eligible (DTI ≤ 40%, no active defaults, min income).
   */
  static async checkBorrowerEligibility(borrowerId: string): Promise<{
    eligible: boolean;
    dti: number;
    reason?: string;
  }> {
    const borrower = await User.findById(borrowerId);
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }

    const dti = borrower.debtToIncomeRatio || 0;
    if (dti > 0.4) {
      return { eligible: false, dti, reason: 'Debt-to-income ratio exceeds 40%' };
    }

    const hasDefaulted = await Loan.exists({
      borrowerId,
      status: 'defaulted',
    });
    if (hasDefaulted) {
      return { eligible: false, dti, reason: 'You have an active defaulted loan' };
    }

    const monthlyIncome = (borrower as any).monthlyIncome || 0;
    if (monthlyIncome < 6500) {
      return { eligible: false, dti, reason: 'Minimum monthly income of R6,500 required' };
    }

    return { eligible: true, dti };
  }

  /**
   * Determine interest rate based on credit grade.
   */
  static getInterestRate(grade: string): number {
    const rates: Record<string, number> = {
      'A+': 9,
      'A': 11,
      'B': 14.5,
      'C': 19,
      'D': 25,
      'E': 35,
    };
    return rates[grade] || 20;
  }

  /**
   * Apply for a new loan.
   */
  static async applyLoan(
    borrowerId: string,
    data: {
      amount: number;
      termMonths: number;
      purpose: string;
      loanType: 'personal' | 'secured' | 'business' | 'student';
      collateral?: Array<{ type: string; value: number }>;
    }
  ): Promise<ILoan> {
    const borrower = await User.findById(borrowerId);
    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }

    const activeLoan = await Loan.findOne({ borrowerId, status: 'active' });
    if (activeLoan) {
      throw new AppError('You already have an active loan. Only one active loan is allowed.', 400);
    }

    const eligibility = await this.checkBorrowerEligibility(borrowerId);
    if (!eligibility.eligible) {
      throw new AppError(eligibility.reason || 'Not eligible for a loan at this time.', 400);
    }

    const grade = borrower.creditGrade || 'C';
    const interestRate = this.getInterestRate(grade);

    const loan = new Loan({
      borrowerId,
      amount: data.amount,
      interestRate,
      termMonths: data.termMonths,
      purpose: data.purpose,
      loanType: data.loanType,
      collateral: data.collateral,
      affordabilityCheckPassed: true,
      dtiAtApplication: eligibility.dti,
      creditGradeAtApplication: grade,
    });

    await loan.save();

    await AuditLog.create({
      userId: borrowerId,
      action: 'APPLY_LOAN',
      ipAddress: '',
      userAgent: '',
      metadata: { loanId: loan._id, amount: data.amount },
    });

    logger.info(`Loan application created: ${loan._id} for borrower ${borrowerId}`);
    return loan;
  }

  /**
   * Get loans for a specific borrower (with optional status filter).
   */
  static async getBorrowerLoans(
    borrowerId: string,
    status?: string
  ): Promise<ILoan[]> {
    const query: any = { borrowerId };
    if (status) query.status = status;
    return Loan.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get loans available for funding (lender view) – pending loans.
   */
  static async getAvailableLoans(
    lenderId?: string,
    options?: { page: number; limit: number; sort: string }
  ): Promise<{ loans: ILoan[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const query = { status: 'pending' };
    const [loans, total] = await Promise.all([
      Loan.find(query)
        .sort(options?.sort || '-createdAt')
        .skip(skip)
        .limit(limit),
      Loan.countDocuments(query),
    ]);
    return { loans, total };
  }

  /**
   * Get loan details by ID (with repayment schedule).
   */
  static async getLoanDetails(loanId: string): Promise<ILoan & { repayments: IRepayment[] }> {
    const loan = await Loan.findById(loanId).populate('repayments');
    if (!loan) {
      throw new AppError('Loan not found', 404);   // ✅ Fixed: removed extra quote
    }
    return loan as any;
  }

  /**
   * Update loan status (admin only).
   * Enhanced: uses AmortizationService to generate repayments when becoming active.
   */
  static async updateLoanStatus(
    loanId: string,
    status: 'active' | 'completed' | 'defaulted' | 'rejected',
    reason?: string
  ): Promise<ILoan> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (loan.status === 'completed' || loan.status === 'defaulted') {
      throw new AppError('Cannot change status of a completed or defaulted loan', 400);
    }

    if (status === 'active') {
      loan.approvalDate = new Date();
      if (!loan.firstRepaymentDate) {
        const firstDate = new Date();
        firstDate.setMonth(firstDate.getMonth() + 1);
        loan.firstRepaymentDate = firstDate;
      }
    }

    loan.status = status;
    await loan.save();

    // Generate repayment schedule using AmortizationService (new)
    if (status === 'active') {
      await AmortizationService.createRepaymentSchedule(loanId);
    }

    await AuditLog.create({
      userId: loan.borrowerId,
      action: 'LOAN_STATUS_UPDATE',
      ipAddress: '',
      userAgent: '',
      metadata: { loanId, newStatus: status, reason },
    });

    return loan;
  }

  /**
   * Fund a loan (lender).
   * Enhanced: uses AmortizationService to generate repayments upon funding.
   */
  static async fundLoan(
    loanId: string,
    lenderId: string
  ): Promise<ILoan> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    if (loan.status !== 'pending') {
      throw new AppError('Loan is not available for funding', 400);
    }
    if (loan.borrowerId.toString() === lenderId) {
      throw new AppError('Cannot fund your own loan', 400);
    }

    const lender = await User.findById(lenderId);
    if (!lender) {
      throw new AppError('Lender not found', 404);
    }
    if (lender.role !== 'lender') {
      throw new AppError('Only lenders can fund loans', 403);
    }

    loan.lenderId = lenderId as any;
    loan.status = 'active';
    loan.approvalDate = new Date();
    if (!loan.firstRepaymentDate) {
      const firstDate = new Date();
      firstDate.setMonth(firstDate.getMonth() + 1);
      loan.firstRepaymentDate = firstDate;
    }
    await loan.save();

    // Generate repayment schedule using AmortizationService (new)
    await AmortizationService.createRepaymentSchedule(loanId);

    await AuditLog.create({
      userId: lenderId,
      action: 'FUND_LOAN',
      ipAddress: '',
      userAgent: '',
      metadata: { loanId, amount: loan.amount },
    });

    return loan;
  }

  /**
   * Get repayment schedule for a loan.
   */
  static async getRepaymentSchedule(loanId: string): Promise<IRepayment[]> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    return Repayment.find({ loanId }).sort({ dueDate: 1 });
  }

  /**
   * Make a repayment (borrower).
   * Enhanced: now also calls AmortizationService.markRepaymentPaid to create a transaction.
   */
  static async makeRepayment(
    loanId: string,
    amount: number,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IRepayment> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    if (loan.borrowerId.toString() !== userId) {
      throw new AppError('You are not authorized to repay this loan', 403);
    }
    if (loan.status !== 'active' && loan.status !== 'pending') {
      throw new AppError('Loan is not in a state for repayment', 400);
    }

    const nextRepayment = await Repayment.findOne({
      loanId,
      status: 'pending',
    }).sort({ dueDate: 1 });

    if (!nextRepayment) {
      throw new AppError('No pending repayments found', 400);
    }

    if (amount < nextRepayment.dueAmount) {
      throw new AppError(`Insufficient amount. Please pay the full due amount of R${nextRepayment.dueAmount.toFixed(2)}.`, 400);
    }

    // Use AmortizationService to mark as paid (creates transaction and audit log)
    const paidRepayment = await AmortizationService.markRepaymentPaid(
      loanId,
      nextRepayment._id.toString(),
      userId,
      ipAddress,
      userAgent
    );

    return paidRepayment;
  }

  /**
   * Check if borrower has active default (used by eligibility).
   */
  static async hasActiveDefault(borrowerId: string): Promise<boolean> {
    const loan = await Loan.findOne({ borrowerId, status: 'defaulted' });
    return !!loan;
  }

  // =============== NEW METHODS (Added – Integrate AmortizationService) ===============

  /**
   * Process early settlement for a loan.
   * Returns the settlement amount and optionally settles the loan (if userId provided).
   */
  static async processEarlySettlement(
    loanId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    settlementAmount: number;
    fee: number;
    remainingPrincipal: number;
  }> {
    return await AmortizationService.processEarlySettlement(loanId, userId, ipAddress, userAgent);
  }

  /**
   * Apply late fees to overdue repayments for a specific loan.
   * Uses AmortizationService.
   */
  static async applyLateFee(loanId: string): Promise<void> {
    await AmortizationService.processLateFee(loanId);
  }

  /**
   * Run daily maintenance: check overdue repayments and apply late fees.
   */
  static async runDailyMaintenance(): Promise<void> {
    await AmortizationService.dailyMaintenance();
  }
}