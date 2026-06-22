import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { faker } from '@faker-js/faker';
import { User, IUser } from '../models/User.model';
import { Loan, ILoan } from '../models/Loan.model';
import { Repayment } from '../models/Repayment.model';
import { Transaction } from '../models/Transaction.model';
import { Notification } from '../models/Notification.model';
import { CreditReport } from '../models/CreditReport.model';
import { LenderDeposit } from '../models/LenderDeposit.model';
import { Withdrawal } from '../models/Withdrawal.model';
import { Dispute } from '../models/Dispute.model';
import { AuditLog } from '../models/AuditLog.model';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create Users (Borrowers & Lenders)
    console.log('👤 Creating users...');

    const creditGrades = ['A+', 'A', 'B', 'C', 'D', 'E'];
    const borrowers: IUser[] = [];   // ✅ explicit type
    for (let i = 0; i < 5; i++) {
      const grade = creditGrades[i % creditGrades.length];
      const user = new User({
        email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }),
        passwordHash: '$2a$10$HASHEDPASSWORD',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number({ style: 'international' }),
        idNumber: faker.string.numeric(13),
        role: 'borrower',
        kycStatus: 'verified',
        creditGrade: grade,
        creditScore: faker.number.int({ min: 300, max: 850 }),
        debtToIncomeRatio: faker.number.float({ min: 0.1, max: 0.6 }),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          province: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: 'South Africa',
        },
      });
      await user.save();
      borrowers.push(user);
    }

    const lenders: IUser[] = [];   // ✅ explicit type
    for (let i = 0; i < 3; i++) {
      const user = new User({
        email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }),
        passwordHash: '$2a$10$HASHEDPASSWORD',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number({ style: 'international' }),
        idNumber: faker.string.numeric(13),
        role: 'lender',
        kycStatus: 'verified',
      });
      await user.save();
      lenders.push(user);
    }

    // 2. Create Loans
    console.log('💰 Creating loans...');
    const loanStatuses = ['pending', 'active', 'completed', 'defaulted'];
    const loans: ILoan[] = [];   // ✅ explicit type
    for (let i = 0; i < 10; i++) {
      const borrower = faker.helpers.arrayElement(borrowers);
      const lender = i < 5 ? faker.helpers.arrayElement(lenders) : null;
      const status = loanStatuses[i % loanStatuses.length];
      const amount = faker.number.int({ min: 1000, max: 50000 });
      const interestRate = faker.number.float({ min: 5, max: 30 });
      const termMonths = faker.number.int({ min: 3, max: 36 });
      const loan = new Loan({
        borrowerId: borrower._id,
        lenderId: lender?._id,
        amount,
        interestRate,
        termMonths,
        status,
        applicationDate: faker.date.past({ years: 1 }),
        approvalDate: status !== 'pending' ? faker.date.recent() : undefined,
        firstRepaymentDate: faker.date.future(),
        servicingFee: amount * 0.005,
        purpose: faker.lorem.sentence({ min: 3, max: 10 }),
        collateral: [
          { type: faker.word.noun(), value: faker.number.int({ min: 1000, max: 20000 }) },
        ],
      });
      await loan.save();
      loans.push(loan);
    }

    // 3. Create Repayments
    console.log('💸 Creating repayments...');
    const repaymentStatuses = ['pending', 'paid', 'overdue'];
    for (const loan of loans) {
      const numRepayments = faker.number.int({ min: 2, max: 5 });
      for (let i = 0; i < numRepayments; i++) {
        const status = repaymentStatuses[i % repaymentStatuses.length];
        const dueAmount = loan.amount / loan.termMonths;
        const repayment = new Repayment({
          loanId: loan._id,
          dueAmount: dueAmount,
          dueDate: faker.date.future(),
          paidDate: status === 'paid' ? faker.date.recent() : undefined,
          status: status,
          lateFee: status === 'overdue' ? faker.number.int({ min: 50, max: 500 }) : undefined,
        });
        await repayment.save();
      }
    }

    // 4. Create Transactions
    console.log('💳 Creating transactions...');
    const transactionTypes = ['deposit', 'withdrawal', 'loan_disbursement', 'repayment', 'servicing_fee', 'dispute_hold'];
    const transactionStatuses = ['pending', 'completed', 'failed', 'reversed'];
    for (let i = 0; i < 20; i++) {
      const user = faker.helpers.arrayElement([...borrowers, ...lenders]);
      const type = faker.helpers.arrayElement(transactionTypes);
      const transaction = new Transaction({
        userId: user._id,
        type,
        amount: faker.number.int({ min: 100, max: 5000 }),
        currency: 'ZAR',
        status: faker.helpers.arrayElement(transactionStatuses),
        reference: faker.string.alphanumeric(10),
        transactionDate: faker.date.recent(),
        description: faker.lorem.sentence({ min: 3, max: 8 }),
      });
      await transaction.save();
    }

    // 5. Create Notifications
    console.log('🔔 Creating notifications...');
    const notificationTypes = ['email', 'sms', 'push'];
    for (const user of [...borrowers, ...lenders]) {
      for (let i = 0; i < 2; i++) {
        const notification = new Notification({
          userId: user._id,
          type: faker.helpers.arrayElement(notificationTypes),
          title: faker.lorem.words(3),
          message: faker.lorem.sentence({ min: 5, max: 15 }),
          isRead: faker.datatype.boolean(),
          sentAt: faker.date.recent(),
          readAt: faker.date.recent(),
        });
        await notification.save();
      }
    }

    // 6. Create Credit Reports
    console.log('📊 Creating credit reports...');
    for (const borrower of borrowers) {
      const creditReport = new CreditReport({
        userId: borrower._id,
        pulledDate: faker.date.recent(),
        transUnionScore: faker.number.int({ min: 300, max: 850 }),
        numberOfAccounts: faker.number.int({ min: 1, max: 10 }),
        outstandingDebt: faker.number.int({ min: 5000, max: 100000 }),
        paymentHistoryPercent: faker.number.float({ min: 80, max: 100 }),
        creditGrade: borrower.creditGrade,
        rawData: { dummy: true },
      });
      await creditReport.save();
    }

    // 7. Create Lender Deposits
    console.log('🏦 Creating lender deposits...');
    for (const lender of lenders) {
      const deposit = new LenderDeposit({
        userId: lender._id,
        amount: faker.number.int({ min: 1000, max: 50000 }),
        status: 'confirmed',
        depositDate: faker.date.recent(),
        paymentMethod: 'EFT',
        reference: faker.string.alphanumeric(10),
      });
      await deposit.save();
    }

    // 8. Create Withdrawals
    console.log('💵 Creating withdrawals...');
    const withdrawalTypes = ['standard', 'instant', 'idle'];
    for (const lender of lenders) {
      const withdrawal = new Withdrawal({
        userId: lender._id,
        type: faker.helpers.arrayElement(withdrawalTypes),
        amount: faker.number.int({ min: 1000, max: 20000 }),
        fee: faker.number.int({ min: 10, max: 100 }),
        netAmount: 0, // computed
        status: 'completed',
        requestedAt: faker.date.recent(),
        completedAt: faker.date.recent(),
        bankAccount: faker.finance.accountNumber(),
      });
      withdrawal.netAmount = withdrawal.amount - withdrawal.fee;
      await withdrawal.save();
    }

    // 9. Create Disputes
    console.log('⚖️ Creating disputes...');
    const disputeStatuses = ['open', 'under_review', 'resolved', 'closed'];
    for (let i = 0; i < 3; i++) {
      const loan = faker.helpers.arrayElement(loans);
      const dispute = new Dispute({
        userId: loan.borrowerId,
        loanId: loan._id,
        reason: faker.lorem.words(3),
        description: faker.lorem.sentence({ min: 5, max: 15 }),
        status: faker.helpers.arrayElement(disputeStatuses),
        filedAt: faker.date.recent(),
        resolvedAt: faker.date.recent(),
        resolution: faker.lorem.sentence(),
        evidenceUrls: [faker.internet.url()],
      });
      await dispute.save();
    }

    // 10. Create Audit Logs
    console.log('📋 Creating audit logs...');
    const actions = ['login', 'loan_approval', 'repayment_made', 'user_updated'];
    for (const user of [...borrowers, ...lenders]) {
      for (let i = 0; i < 3; i++) {
        const auditLog = new AuditLog({
          userId: user._id,
          action: faker.helpers.arrayElement(actions),
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          timestamp: faker.date.recent(),
          metadata: { extra: 'info' },
        });
        await auditLog.save();
      }
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();