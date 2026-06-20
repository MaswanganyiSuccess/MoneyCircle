import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import creditRoutes from './credit.routes';
import loanRoutes from './loan.routes';   
import investmentRoutes from './investment.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/credit', creditRoutes);
router.use('/loans', loanRoutes);   
router.use('/api', investmentRoutes);      

export default router;