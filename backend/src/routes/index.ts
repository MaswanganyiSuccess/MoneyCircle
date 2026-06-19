import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
// Import other routes as you add them
// import userRoutes from './user.routes';
// import loanRoutes from './loan.routes';

const router = Router();

// Health check routes – available at /api/health
router.use('/health', healthRoutes);

// Authentication routes – available at /api/auth
router.use('/auth', authRoutes);

// Other routes
// router.use('/users', userRoutes);
// router.use('/loans', loanRoutes);

export default router;