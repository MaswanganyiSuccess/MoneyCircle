import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import creditRoutes from './credit.routes';
import loanRoutes from './loan.routes';
import investmentRoutes from './investment.routes';
import { authenticateJWT, requireLender } from '../middleware/auth';
import { BalanceService } from '../services/balance.service';
import { sendSuccess, sendError } from '../utils/helpers';
import { InvestmentController } from '../controllers/investment.controller';

const router = Router();

// ==============================
// Balance Routes
// ==============================
router.get('/balance/test', (req, res) => {
  res.json({ message: 'Balance routes are working!' });
});

router.get('/balance', authenticateJWT, requireLender, async (req: any, res) => {
  try {
    const balance = await BalanceService.getBalance(req.user.id);
    sendSuccess(res, balance, 'Balance retrieved');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
});

router.post('/balance/deposit', authenticateJWT, requireLender, async (req: any, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return sendError(res, 'Amount must be greater than 0', 400);
    }
    const balance = await BalanceService.deposit(req.user.id, amount);
    sendSuccess(res, balance, 'Deposit successful');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
});

// ==============================
// Investment Routes (missing ones)
// ==============================
router.get('/loans/:id/investors', authenticateJWT, requireLender, InvestmentController.getLoanInvestors);
router.get('/lender/investments', authenticateJWT, requireLender, InvestmentController.getLenderInvestments);
router.post('/lender/auto-invest', authenticateJWT, requireLender, InvestmentController.autoInvest);
router.get('/lender/dashboard', authenticateJWT, requireLender, InvestmentController.getLenderDashboard);

// ==============================
// Other Routes
// ==============================
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/credit', creditRoutes);
router.use('/loans', loanRoutes);
router.use('/investments', investmentRoutes);

export default router;