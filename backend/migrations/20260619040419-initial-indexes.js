module.exports = {
  async up(db) {
    console.log('🔄 Creating indexes via migration...');

    // Users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ idNumber: 1 }, { unique: true });
    await db.collection('users').createIndex({ creditGrade: 1 });
    await db.collection('users').createIndex({ role: 1 });

    // Loans
    await db.collection('loans').createIndex({ borrowerId: 1 });
    await db.collection('loans').createIndex({ status: 1, createdAt: -1 });
    await db.collection('loans').createIndex({ interestRate: 1 });
    await db.collection('loans').createIndex({ amount: 1, term: 1 });

    // Repayments
    await db.collection('repayments').createIndex({ loanId: 1, dueDate: 1 });
    await db.collection('repayments').createIndex({ status: 1, dueDate: 1 });

    // Transactions
    await db.collection('transactions').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('transactions').createIndex({ type: 1, status: 1 });
    await db.collection('transactions').createIndex({ reference: 1 }, { unique: true });

    // Notifications
    await db.collection('notifications').createIndex({ userId: 1, isRead: 1 });

    // CreditReports
    await db.collection('creditreports').createIndex({ userId: 1, pulledDate: -1 });

    // LenderDeposits
    await db.collection('lenderdeposits').createIndex({ userId: 1, status: 1 });

    // Withdrawals
    await db.collection('withdrawals').createIndex({ userId: 1, status: 1 });

    // Disputes
    await db.collection('disputes').createIndex({ loanId: 1, status: 1 });

    // AuditLogs
    await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 });

    console.log('✅ All indexes created.');
  },

  async down(db) {
    console.log('⚠️ This migration cannot be safely reverted automatically.');
    console.log('⚠️ To rollback, you must drop the indexes manually.');
    // For safety, we don't drop indexes in `down` to prevent data loss.
  }
};