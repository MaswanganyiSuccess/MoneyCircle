import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import creditRoutes from './credit.routes';
import loanRoutes from './loan.routes';
import investmentRoutes from './investment.routes';

const router = Router();

// Health check – will be available at /api/health
router.use('/health', healthRoutes);

// Auth, users, credit, loans – all under /api
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/credit', creditRoutes);
router.use('/loans', loanRoutes);

// Investment routes – mounted at /investments (so full path = /api/investments)
router.use('/investments', investmentRoutes);

export default router;