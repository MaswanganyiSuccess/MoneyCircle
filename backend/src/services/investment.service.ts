import { Investment, IInvestment } from '../models/Investment.model';
import { Loan, ILoan } from '../models/Loan.model';
import { LenderBalance } from '../models/LenderBalance.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import mongoose from 'mongoose';
import { AmortizationService } from './amortization.service';

export class InvestmentService {
  /**
   * Get available loans for lenders (with filters)
   */
  static async getAvailableLoans(
    filters: {
      minAmount?: number;
      maxAmount?: number;
      minTerm?: number;
      maxTerm?: number;
      maxInterestRate?: number;
      creditGrade?: string;
    },
    options: {
      page: number;
      limit: number;
      sort: string;
    }
  ): Promise<{ loans: ILoan[]; total: number }> {
    const { page, limit, sort } = options;
    const skip = (page - 1) * limit;

    const query: any = {
      status: 'pending',
      isFullyFunded: false,
      expiryDate: { $gt: new Date() },
    };

    if (filters.minAmount) query.amount = { $gte: filters.minAmount };
    if (filters.maxAmount) query.amount = { ...query.amount, $lte: filters.maxAmount };
    if (filters.minTerm) query.termMonths = { $gte: filters.minTerm };
    if (filters.maxTerm) query.termMonths = { ...query.termMonths, $lte: filters.maxTerm };
    if (filters.maxInterestRate) query.interestRate = { $lte: filters.maxInterestRate };
    if (filters.creditGrade) query.creditGradeAtApplication = filters.creditGrade;

    const [loans, total] = await Promise.all([
      Loan.find(query)
        .populate('borrowerId', 'firstName lastName email creditGrade')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Loan.countDocuments(query),
    ]);

    return { loans, total };
  }

  /**
   * Fund a loan (partial or full)
   */
  static async fundLoan(
    loanId: string,
    lenderId: string,
    amount: number
  ): Promise<{ investment: IInvestment; loan: ILoan; remainingAmount: number }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get the loan
      const loan = await Loan.findById(loanId).session(session);
      if (!loan) throw new AppError('Loan not found', 404);
      if (loan.status !== 'pending') throw new AppError('Loan is not available for funding', 400);
      if (loan.isFullyFunded) throw new AppError('Loan is already fully funded', 400);
      if (loan.expiryDate < new Date()) throw new AppError('Loan listing has expired', 400);
      if (loan.borrowerId.toString() === lenderId) throw new AppError('Cannot fund your own loan', 400);

      // 2. Check minimum investment
      if (amount < 1000) throw new AppError('Minimum investment amount is R1,000', 400);

      // 3. Check if amount exceeds remaining
      const remaining = loan.amount - loan.fundedAmount;
      if (amount > remaining) throw new AppError(`Amount exceeds remaining R${remaining}`, 400);

      // 4. Get lender balance
      const balance = await LenderBalance.findOne({ lenderId }).session(session);
      if (!balance) throw new AppError('Lender balance not found. Please deposit funds.', 404);
      if (balance.availableBalance < amount) throw new AppError('Insufficient available balance', 400);

      // 5. Apply 75% cash limit rule (optional – can be configurable)
      const maxAvailable = balance.availableBalance * 0.75;
      if (amount > maxAvailable) {
        throw new AppError(`You can only invest up to 75% of your available balance (R${maxAvailable.toFixed(2)})`, 400);
      }

      // 6. Create investment record
      const investment = new Investment({
        loanId,
        lenderId,
        amount,
        interestRate: loan.interestRate,
        status: 'pending',
      });
      await investment.save({ session });

      // 7. Update loan funded amount
      loan.fundedAmount += amount;
      loan.remainingAmount = loan.amount - loan.fundedAmount;
      if (loan.fundedAmount >= loan.amount) {
        loan.isFullyFunded = true;
        loan.status = 'active';
        loan.approvalDate = new Date();
        if (!loan.firstRepaymentDate) {
          const firstDate = new Date();
          firstDate.setMonth(firstDate.getMonth() + 1);
          loan.firstRepaymentDate = firstDate;
        }
      }
      await loan.save({ session });

      // 8. Update lender balance
      balance.availableBalance -= amount;
      balance.investedAmount += amount;
      balance.lastUpdated = new Date();
      await balance.save({ session });

      // 9. If loan is fully funded, generate repayments
      if (loan.isFullyFunded) {
        await AmortizationService.createRepaymentSchedule(loanId);
        // Update all investments to 'active'
        await Investment.updateMany(
          { loanId },
          { $set: { status: 'active' } },
          { session }
        );
      }

      await session.commitTransaction();

      // Return the result
      return {
        investment,
        loan,
        remainingAmount: loan.remainingAmount,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get lender's investments
   */
  static async getLenderInvestments(
    lenderId: string,
    options?: { page: number; limit: number; status?: string }
  ): Promise<{ investments: IInvestment[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = { lenderId };
    if (options?.status) query.status = options.status;

    const [investments, total] = await Promise.all([
      Investment.find(query)
        .populate('loanId', 'amount interestRate termMonths status purpose')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Investment.countDocuments(query),
    ]);

    return { investments, total };
  }

  /**
   * Get investors for a specific loan
   */
  static async getLoanInvestors(
    loanId: string,
    options?: { page: number; limit: number }
  ): Promise<{ investors: IInvestment[]; total: number; fundedAmount: number; remainingAmount: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const loan = await Loan.findById(loanId);
    if (!loan) throw new AppError('Loan not found', 404);

    const [investors, total] = await Promise.all([
      Investment.find({ loanId })
        .populate('lenderId', 'firstName lastName email')
        .sort({ fundedAt: 1 })
        .skip(skip)
        .limit(limit),
      Investment.countDocuments({ loanId }),
    ]);

    return {
      investors,
      total,
      fundedAmount: loan.fundedAmount,
      remainingAmount: loan.remainingAmount,
    };
  }

  /**
   * Auto-invest: automatically invest in loans matching criteria
   */
  static async autoInvest(
    lenderId: string,
    criteria: {
      maxAmount?: number;
      minTerm?: number;
      maxTerm?: number;
      maxInterestRate?: number;
      creditGrade?: string;
      maxInvestmentPerLoan?: number;
    }
  ): Promise<{ invested: number; loansFunded: string[] }> {
    const balance = await LenderBalance.findOne({ lenderId });
    if (!balance) throw new AppError('Lender balance not found', 404);

    const maxAvailable = balance.availableBalance * 0.75;
    if (maxAvailable < 1000) {
      throw new AppError('Insufficient balance for auto-invest (minimum R1,000 required)', 400);
    }

    // Find loans matching criteria
    const query: any = {
      status: 'pending',
      isFullyFunded: false,
      expiryDate: { $gt: new Date() },
      remainingAmount: { $gte: 1000 },
    };

    if (criteria.maxAmount) query.amount = { $lte: criteria.maxAmount };
    if (criteria.minTerm) query.termMonths = { $gte: criteria.minTerm };
    if (criteria.maxTerm) query.termMonths = { ...query.termMonths, $lte: criteria.maxTerm };
    if (criteria.maxInterestRate) query.interestRate = { $lte: criteria.maxInterestRate };
    if (criteria.creditGrade) query.creditGradeAtApplication = criteria.creditGrade;

    const loans = await Loan.find(query).sort({ createdAt: 1 }).limit(10);
    if (loans.length === 0) {
      return { invested: 0, loansFunded: [] };
    }

    let totalInvested = 0;
    const fundedLoans: string[] = [];

    for (const loan of loans) {
      // Calculate investment amount (max 25% of remaining or user's limit)
      const maxPerLoan = criteria.maxInvestmentPerLoan || 10000;
      const investmentAmount = Math.min(
        loan.remainingAmount,
        maxPerLoan,
        maxAvailable - totalInvested
      );

      if (investmentAmount < 1000) continue;

      try {
        await this.fundLoan(loan._id.toString(), lenderId, investmentAmount);
        totalInvested += investmentAmount;
        fundedLoans.push(loan._id.toString());
      } catch (error) {
        logger.warn(`Auto-invest failed for loan ${loan._id}:`, error);
        continue;
      }

      if (totalInvested >= maxAvailable) break;
    }

    return { invested: totalInvested, loansFunded: fundedLoans };
  }

  /**
   * Get lender dashboard summary
   */
  static async getLenderDashboard(lenderId: string): Promise<{
    balance: any;
    investments: {
      total: number;
      active: number;
      completed: number;
      defaulted: number;
    };
    recentInvestments: any[];
  }> {
    const [balance, stats, recent] = await Promise.all([
      LenderBalance.findOne({ lenderId }),
      Investment.aggregate([
        { $match: { lenderId: new mongoose.Types.ObjectId(lenderId) } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 },
        }},
      ]),
      Investment.find({ lenderId })
        .populate('loanId', 'amount interestRate status purpose')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const statusMap = { pending: 0, active: 0, completed: 0, defaulted: 0 };
    stats.forEach((s: any) => {
      statusMap[s._id as keyof typeof statusMap] = s.count;
    });

    return {
      balance: balance || { availableBalance: 0, investedAmount: 0, totalReturns: 0 },
      investments: {
        total: stats.reduce((sum: any, s: any) => sum + s.count, 0),
        active: statusMap.active,
        completed: statusMap.completed,
        defaulted: statusMap.defaulted,
      },
      recentInvestments: recent,
    };
  }
}