import { CreditReport, ICreditReport } from '../models/CreditReport.model';
import { User, IUser } from '../models/User.model';
import { AuditLog } from '../models/AuditLog.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

// Scoring factors (0–100 scale)
const MAX_SCORE = 100;

// Grade mapping
const GRADE_MAP = [
  { min: 90, max: 100, grade: 'A+' as const, interest: '8%–10%' },
  { min: 80, max: 89, grade: 'A' as const, interest: '10%–12%' },
  { min: 65, max: 79, grade: 'B' as const, interest: '13%–16%' },
  { min: 50, max: 64, grade: 'C' as const, interest: '17%–21%' },
  { min: 35, max: 49, grade: 'D' as const, interest: '22%–28%' },
  { min: 0, max: 34, grade: 'E' as const, interest: 'Secured loans only' },
];

export class CreditService {
  /**
   * Calculates credit score based on the provided factors.
   * Returns score (0-100) and grade.
   */
  static calculateScoreAndGrade(factors: {
    transUnionScore: number; // 0–999
    debtToIncomeRatio: number; // 0–1
    bankStatementUploaded: boolean;
    employmentMonths: number;
    onTimePayments: number;
    earlySettlements: number;
    creditUtilization: number; // 0–1
    recentHardInquiries: number;
    hasDefaultsOrJudgments: boolean;
  }): { score: number; grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' } {
    let score = 0;

    // 1. TransUnion score (mapped 0–50 points)
    // Map 0–999 to 0–50
    const tuScore = Math.min(factors.transUnionScore / 999 * 50, 50);
    score += tuScore;

    // 2. Debt-to-income ratio
    if (factors.debtToIncomeRatio <= 0.3) {
      score += 15;
    } else if (factors.debtToIncomeRatio > 0.4) {
      score -= 10;
    }

    // 3. Bank statement verification
    if (factors.bankStatementUploaded) {
      score += 30;
    }

    // 4. Employment stability
    if (factors.employmentMonths > 12) {
      score += 15;
    }

    // 5. On-time payment history
    score += factors.onTimePayments * 5;

    // 6. Early repayments
    score += factors.earlySettlements * 20;

    // 7. Credit utilisation
    if (factors.creditUtilization <= 0.3) {
      score += 10;
    } else if (factors.creditUtilization > 0.8) {
      score -= 15;
    }

    // 8. Recent hard inquiries
    score -= factors.recentHardInquiries * 5;

    // 9. Defaults/judgments
    if (factors.hasDefaultsOrJudgments) {
      score -= 40;
    }

    // Clamp to 0–100
    score = Math.max(0, Math.min(score, MAX_SCORE));

    // Determine grade
    const gradeEntry = GRADE_MAP.find((g) => score >= g.min && score <= g.max)!;
    return { score, grade: gradeEntry.grade };
  }

  /**
   * Fetches or creates a credit report for a user.
   * Uses a mock TransUnion response (cached for 30 days).
   */
  static async pullCreditReport(userId: string): Promise<ICreditReport> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if we have a recent report (within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const existing = await CreditReport.findOne({
      userId,
      pulledDate: { $gte: thirtyDaysAgo },
    });

    if (existing) {
      logger.info(`Using cached credit report for user ${userId}`);
      return existing;
    }

    // Mock TransUnion response (in production, call external API)
    const mockTransUnionData = {
      score: Math.floor(Math.random() * 500) + 300, // 300–800
      numberOfAccounts: Math.floor(Math.random() * 10) + 1,
      outstandingDebt: Math.floor(Math.random() * 200000) + 5000,
      paymentHistoryPercent: Math.floor(Math.random() * 30) + 70, // 70–100
      // Additional fields from user profile
      bankStatementUploaded: user.kycStatus === 'verified', // simplified
      employmentMonths: Math.floor(Math.random() * 24) + 6, // 6–30
      onTimePayments: Math.floor(Math.random() * 20) + 0,
      earlySettlements: Math.floor(Math.random() * 5) + 0,
      creditUtilization: Math.random(), // 0–1
      recentHardInquiries: Math.floor(Math.random() * 3),
      hasDefaultsOrJudgments: Math.random() < 0.1, // 10% chance
    };

    // Calculate score and grade
    const { score, grade } = CreditService.calculateScoreAndGrade({
      transUnionScore: mockTransUnionData.score,
      debtToIncomeRatio: user.debtToIncomeRatio || 0.3,
      bankStatementUploaded: mockTransUnionData.bankStatementUploaded,
      employmentMonths: mockTransUnionData.employmentMonths,
      onTimePayments: mockTransUnionData.onTimePayments,
      earlySettlements: mockTransUnionData.earlySettlements,
      creditUtilization: mockTransUnionData.creditUtilization,
      recentHardInquiries: mockTransUnionData.recentHardInquiries,
      hasDefaultsOrJudgments: mockTransUnionData.hasDefaultsOrJudgments,
    });

    // Save report
    const report = new CreditReport({
      userId,
      pulledDate: new Date(),
      transUnionScore: mockTransUnionData.score,
      numberOfAccounts: mockTransUnionData.numberOfAccounts,
      outstandingDebt: mockTransUnionData.outstandingDebt,
      paymentHistoryPercent: mockTransUnionData.paymentHistoryPercent,
      creditGrade: grade,
      rawData: mockTransUnionData,
      bankStatementUploaded: mockTransUnionData.bankStatementUploaded,
      employmentMonths: mockTransUnionData.employmentMonths,
      onTimePayments: mockTransUnionData.onTimePayments,
      earlySettlements: mockTransUnionData.earlySettlements,
      creditUtilization: mockTransUnionData.creditUtilization,
      recentHardInquiries: mockTransUnionData.recentHardInquiries,
      hasDefaultsOrJudgments: mockTransUnionData.hasDefaultsOrJudgments,
    });

    await report.save();

    // Update user's credit grade and score
    user.creditGrade = grade;
    user.creditScore = score;
    await user.save();

    // Log the pull
    await AuditLog.create({
      userId,
      action: 'CREDIT_PULL',
      ipAddress: '', // can be filled later
      userAgent: '',
      metadata: { score, grade },
    });

    logger.info(`Credit report pulled for user ${userId}, grade: ${grade}`);

    return report;
  }

  /**
   * Gets the current credit grade and score for a user.
   */
  static async getCreditScore(userId: string): Promise<{ score: number; grade: string }> {
    const user = await User.findById(userId).select('creditScore creditGrade');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return {
      score: user.creditScore ?? 0,
      grade: user.creditGrade ?? 'E',
    };
  }

  /**
   * Returns a list of actionable suggestions to improve credit score.
   */
  static async getImprovementSuggestions(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const latestReport = await CreditReport.findOne({ userId }).sort({ pulledDate: -1 });
    if (!latestReport) {
      return ['Complete your profile and submit KYC to get a credit score.'];
    }

    const suggestions: string[] = [];

    // Use user.debtToIncomeRatio (not from report)
    const dti = user.debtToIncomeRatio ?? 0;
    if (dti > 0.3) {
      suggestions.push('Reduce your debt-to-income ratio by paying down existing debt.');
    }

    if (!latestReport.bankStatementUploaded) {
      suggestions.push('Upload your bank statements to improve your score.');
    }

    if (latestReport.employmentMonths <= 12) {
      suggestions.push('Maintain stable employment for at least 12 months to boost your score.');
    }

    if (latestReport.onTimePayments < 5) {
      suggestions.push('Make more on-time payments to build a positive repayment history.');
    }

    if (latestReport.creditUtilization > 0.3) {
      suggestions.push('Reduce your credit utilisation to below 30% of your available credit.');
    }

    if (latestReport.recentHardInquiries > 0) {
      suggestions.push('Avoid multiple hard credit inquiries within a short period.');
    }

    if (latestReport.hasDefaultsOrJudgments) {
      suggestions.push('Resolve any defaults or judgments on your credit report.');
    }

    if (suggestions.length === 0) {
      suggestions.push('You have a strong credit profile. Keep up the good work!');
    }

    return suggestions;
  }

  /**
   * Refreshes the credit score (monthly limit).
   */
  static async refreshCreditScore(userId: string): Promise<ICreditReport> {
    // Check if the user has already refreshed within the last 30 days
    const lastRefresh = await CreditReport.findOne({ userId }).sort({ pulledDate: -1 });
    if (lastRefresh) {
      const daysSinceLast = (Date.now() - lastRefresh.pulledDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLast < 30) {
        throw new AppError('Credit score can only be refreshed once per month.', 429);
      }
    }

    // Pull a new report (this will bypass the cache)
    // We'll force a new pull by not using the cached logic.
    const newReport = await CreditService.pullCreditReport(userId);
    await AuditLog.create({
      userId,
      action: 'REFRESH_CREDIT',
      ipAddress: '',
      userAgent: '',
      metadata: { newGrade: newReport.creditGrade },
    });
    return newReport;
  }
}