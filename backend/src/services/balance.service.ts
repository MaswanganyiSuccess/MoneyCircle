import { LenderBalance } from '../models/LenderBalance.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { AuditLog } from '../models/AuditLog.model';

export class BalanceService {
  static async getOrCreateBalance(lenderId: string): Promise<any> {
    let balance = await LenderBalance.findOne({ lenderId });
    if (!balance) {
      const lender = await User.findById(lenderId);
      if (!lender || lender.role !== 'lender') {
        throw new AppError('Only lenders can have a balance', 403);
      }
      balance = new LenderBalance({ lenderId });
      await balance.save();
    }
    return balance;
  }

  static async deposit(lenderId: string, amount: number): Promise<any> {
    const balance = await this.getOrCreateBalance(lenderId);
    balance.availableBalance += amount;
    balance.lastUpdated = new Date();
    await balance.save();

    await AuditLog.create({
      userId: lenderId,
      action: 'DEPOSIT',
      ipAddress: '',
      userAgent: '',
      metadata: { amount, newBalance: balance.availableBalance },
    });

    return balance;
  }

  static async getBalance(lenderId: string): Promise<any> {
    return await this.getOrCreateBalance(lenderId);
  }
}