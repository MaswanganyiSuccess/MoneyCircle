import { Router } from 'express';
import { authenticateJWT, requireLender } from '../middleware/auth';
import { BalanceService } from '../services/balance.service';
import { sendSuccess, sendError } from '../utils/helpers';

const router = Router();

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

export default router;