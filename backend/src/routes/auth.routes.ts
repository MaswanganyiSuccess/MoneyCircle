import express from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

const isTest = process.env.NODE_ENV === 'test';

// Registration rate limiter – higher limit in test environment
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 10 : 3,
  message: 'Too many registration attempts, please try again later',
});

// Public routes
router.post('/register', registerLimiter, authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.getMe);

export default router;