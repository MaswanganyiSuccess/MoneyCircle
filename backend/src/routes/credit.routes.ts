import { Router } from 'express';
import { CreditController } from '../controllers/credit.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/check', authenticateJWT, CreditController.pullCredit);
router.get('/score', authenticateJWT, CreditController.getCreditScore);
router.get('/improvement', authenticateJWT, CreditController.getImprovementSuggestions);
router.post('/refresh', authenticateJWT, CreditController.refreshCredit);

export default router;