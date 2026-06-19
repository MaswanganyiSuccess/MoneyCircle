import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Authenticated user routes
router.get('/me', authenticateJWT, UserController.getProfile);
router.put('/me', authenticateJWT, UserController.updateProfile);
router.put('/change-password', authenticateJWT, UserController.changePassword);
router.post('/upload-avatar', authenticateJWT, upload.single('avatar'), UserController.uploadAvatar);
router.post('/kyc', authenticateJWT, UserController.submitKyc);
router.get('/kyc/status', authenticateJWT, UserController.getKycStatus);
router.delete('/me', authenticateJWT, UserController.deleteAccount);

// Admin routes
router.get('/', authenticateJWT, adminOnly, UserController.listUsers);
router.get('/:id', authenticateJWT, adminOnly, UserController.getUserById);

export default router;