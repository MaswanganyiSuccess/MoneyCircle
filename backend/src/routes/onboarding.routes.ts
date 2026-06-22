import express from 'express';
import multer from 'multer';
import { submitOnboarding } from '../controllers/onboarding.controller';
import { validateOnboardingFieldController } from '../controllers/onboarding.validation.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/borrower-onboarding',
  upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
  ]),
  submitOnboarding
);

router.post('/validate-field', validateOnboardingFieldController);

export default router;