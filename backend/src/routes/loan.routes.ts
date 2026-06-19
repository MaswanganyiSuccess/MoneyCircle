import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { authenticateJWT, adminOnly } from '../middleware/auth';

const router = Router();

// Borrower routes
router.post('/', authenticateJWT, LoanController.applyLoan);
router.get('/my', authenticateJWT, LoanController.getMyLoans);
router.get('/:id/repayments', authenticateJWT, LoanController.getRepaymentSchedule);
router.post('/:id/repay', authenticateJWT, LoanController.makeRepayment);
router.post('/:id/repayments/:repaymentId/pay', authenticateJWT, LoanController.payRepayment);

// Lender routes
router.get('/available', authenticateJWT, LoanController.getAvailableLoans);
router.post('/:id/fund', authenticateJWT, LoanController.fundLoan);

// Both borrower & lender (with authorization checks inside)
router.get('/:id', authenticateJWT, LoanController.getLoanDetails);
router.get('/:id/settlement', authenticateJWT, LoanController.getSettlementAmount);

// Admin routes
router.put('/:id/status', authenticateJWT, adminOnly, LoanController.updateLoanStatus);

export default router;