import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller';
import { authenticateJWT, requireLender } from '../middleware/auth';

const router = Router();

// Available loans (lender view)
router.get('/loans/available', authenticateJWT, requireLender, InvestmentController.getAvailableLoans);

// Fund a loan
router.post('/loans/:id/fund', authenticateJWT, requireLender, InvestmentController.fundLoan);

// Investors for a loan
router.get('/loans/:id/investors', authenticateJWT, requireLender, InvestmentController.getLoanInvestors);

// Lender's investments
router.get('/lender/investments', authenticateJWT, requireLender, InvestmentController.getLenderInvestments);

// Auto-invest
router.post('/lender/auto-invest', authenticateJWT, requireLender, InvestmentController.autoInvest);

// Lender dashboard
router.get('/lender/dashboard', authenticateJWT, requireLender, InvestmentController.getLenderDashboard);

export default router;