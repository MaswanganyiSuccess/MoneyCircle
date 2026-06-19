import { Loan, ILoan } from '../models/Loan.model';
import { Repayment, IRepayment } from '../models/Repayment.model';
import { Transaction } from '../models/Transaction.model';
import { AuditLog } from '../models/AuditLog.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

export class AmortizationService {
  /**
   * Calculate monthly payment using standard amortisation formula:
   * M = P × (r × (1+r)^n) / ((1+r)^n - 1)
   */
  static calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
    if (principal <= 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) /
           (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  /**
   * Generate full amortisation schedule for a loan.
   * Returns array of repayment records.
   */
  static generateSchedule(loan: ILoan): Array<{
    dueDate: Date;
    dueAmount: number;
    interestPortion: number;
    principalPortion: number;
    remainingBalance: number;
  }> {
    const { amount, interestRate, termMonths, firstRepaymentDate } = loan;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = this.calculateMonthlyPayment(amount, interestRate, termMonths);
    const schedule = [];
    let balance = amount;
    const startDate = firstRepaymentDate || new Date();

    for (let i = 1; i <= termMonths; i++) {
      const interestPortion = balance * monthlyRate;
      let principalPortion = monthlyPayment - interestPortion;
      // Ensure last payment clears the balance
      if (i === termMonths) {
        principalPortion = balance;
      }
      balance -= principalPortion;
      // Round to 2 decimals to avoid floating point issues
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({
        dueDate,
        dueAmount: monthlyPayment,
        interestPortion: Math.round(interestPortion * 100) / 100,
        principalPortion: Math.round(principalPortion * 100) / 100,
        remainingBalance: Math.round(Math.max(0, balance) * 100) / 100,
      });
    }
    return schedule;
  }

  /**
   * Create repayment records for a loan and save to Repayments collection.
   */
  static async createRepaymentSchedule(loanId: string): Promise<IRepayment[]> {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new AppError('Loan not found', 404);

    // Check if repayments already exist
    const existing = await Repayment.find({ loanId });
    if (existing.length > 0) {
      logger.info(`Repayments already exist for loan ${loanId}`);
      return existing;
    }

    const schedule = this.generateSchedule(loan);
    const repayments = schedule.map((item) => ({
      loanId: loan._id,
      dueDate: item.dueDate,
      dueAmount: item.dueAmount,
      interestPortion: item.interestPortion,
      principalPortion: item.principalPortion,
      remainingBalance: item.remainingBalance,
      status: 'pending' as const,
    }));

    const result = await Repayment.insertMany(repayments);
    logger.info(`Created ${result.length} repayments for loan ${loanId}`);
    return result;
  }

  /**
   * Mark a repayment as paid and record a transaction.
   */
  static async markRepaymentPaid(
    loanId: string,
    repaymentId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IRepayment> {
    const repayment = await Repayment.findById(repaymentId);
    if (!repayment) throw new AppError('Repayment not found', 404);
    if (repayment.loanId.toString() !== loanId) {
      throw new AppError('Repayment does not belong to this loan', 400);
    }
    if (repayment.status === 'paid') {
      throw new AppError('Repayment already paid', 400);
    }

    // Create a transaction record
    const transaction = new Transaction({
      userId,
      type: 'repayment',
      amount: repayment.dueAmount,
      currency: 'ZAR',
      status: 'completed',
      reference: `REPAY-${loanId}-${repaymentId}-${Date.now()}`,
      transactionDate: new Date(),
      relatedEntityId: loanId,
      description: `Repayment #${repaymentId} on loan ${loanId}`,
    });
    await transaction.save();

    // Update repayment
    repayment.status = 'paid';
    repayment.paidDate = new Date();
    repayment.transactionId = transaction._id;
    await repayment.save();

    // Check if all repayments are paid → auto-complete loan
    const pending = await Repayment.countDocuments({
      loanId,
      status: 'pending',
    });
    if (pending === 0) {
      await Loan.findByIdAndUpdate(loanId, { status: 'completed' });
      logger.info(`Loan ${loanId} completed (all repayments paid)`);
    }

    // Audit log
    await AuditLog.create({
      userId: userId || (await Loan.findById(loanId))?.borrowerId,
      action: 'REPAYMENT_PAID',
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
      metadata: { loanId, repaymentId, amount: repayment.dueAmount, transactionId: transaction._id },
    });

    return repayment;
  }

  /**
   * Check for overdue loans (run daily via cron job).
   * Marks repayments as overdue if due date passed and not paid.
   */
  static async checkOverdueLoans(): Promise<{ overdueCount: number }> {
    const now = new Date();
    const overdueRepayments = await Repayment.updateMany(
      {
        dueDate: { $lt: now },
        status: { $in: ['pending'] },
      },
      { $set: { status: 'overdue' } }
    );

    const count = overdueRepayments.modifiedCount || 0;
    if (count > 0) {
      logger.info(`${count} repayments marked as overdue`);
    }
    return { overdueCount: count };
  }

  /**
   * Process early settlement – calculate settlement amount with 1% fee.
   * Optionally, creates a transaction and closes the loan.
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
    const loan = await Loan.findById(loanId);
    if (!loan) throw new AppError('Loan not found', 404);
    if (loan.status !== 'active') {
      throw new AppError('Loan is not active; cannot settle early', 400);
    }

    // Find the total remaining principal from pending repayments
    const pendingRepayments = await Repayment.find({
      loanId,
      status: { $in: ['pending', 'overdue'] },
    }).sort({ dueDate: 1 });

    if (pendingRepayments.length === 0) {
      throw new AppError('No pending repayments – loan already completed?', 400);
    }

    // Sum of principal portions of all pending repayments
    const remainingPrincipal = pendingRepayments.reduce(
      (sum, r) => sum + r.principalPortion,
      0
    );

    // 1% early settlement fee
    const fee = remainingPrincipal * 0.01;
    const settlementAmount = remainingPrincipal + fee;
    const rounded = Math.round(settlementAmount * 100) / 100;

    // Create a transaction for the settlement (if userId provided)
    if (userId) {
      const transaction = new Transaction({
        userId,
        type: 'loan_settlement',
        amount: rounded,
        currency: 'ZAR',
        status: 'completed',
        reference: `SETTLE-${loanId}-${Date.now()}`,
        transactionDate: new Date(),
        relatedEntityId: loanId,
        description: `Early settlement of loan ${loanId}`,
      });
      await transaction.save();

      // Mark all pending repayments as paid (or we could just delete them)
      await Repayment.updateMany(
        { loanId, status: { $in: ['pending', 'overdue'] } },
        { $set: { status: 'paid', paidDate: new Date(), transactionId: transaction._id } }
      );

      // Set loan to completed
      loan.status = 'completed';
      await loan.save();

      // Audit log
      await AuditLog.create({
        userId: userId || loan.borrowerId,
        action: 'EARLY_SETTLEMENT',
        ipAddress: ipAddress || '',
        userAgent: userAgent || '',
        metadata: { loanId, settlementAmount: rounded, fee, transactionId: transaction._id },
      });
    }

    return {
      settlementAmount: rounded,
      fee,
      remainingPrincipal,
    };
  }

  /**
   * Apply a late fee (5% of the overdue amount) after 5 days of being overdue.
   * This is meant to be run by a scheduled job.
   */
  static async processLateFee(loanId: string): Promise<void> {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new AppError('Loan not found', 404);

    const overdueRepayments = await Repayment.find({
      loanId,
      status: 'overdue',
      lateFee: { $exists: false }, // Avoid applying fee twice
    });

    if (overdueRepayments.length === 0) return;

    const now = new Date();
    let applied = 0;
    for (const repayment of overdueRepayments) {
      const daysOverdue = Math.floor(
        (now.getTime() - repayment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysOverdue >= 5) {
        // 5% late fee on the due amount
        const fee = repayment.dueAmount * 0.05;
        repayment.lateFee = Math.round(fee * 100) / 100;
        await repayment.save();
        applied++;
      }
    }

    if (applied > 0) {
      logger.info(`Applied late fees to ${applied} repayments for loan ${loanId}`);
    }
  }

  /**
   * Run daily maintenance: check overdue repayments and apply late fees.
   */
  static async dailyMaintenance(): Promise<void> {
    await this.checkOverdueLoans();

    // Find loans with overdue repayments older than 5 days
    const loansWithOverdue = await Repayment.distinct('loanId', {
      status: 'overdue',
      lateFee: { $exists: false },
    });
    for (const loanId of loansWithOverdue) {
      await this.processLateFee(loanId.toString());
    }

    logger.info('Daily maintenance completed');
  }
}