import express from 'express';
import { processAccountDeletion } from '../controllers/accountDeletion.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.delete('/process-deletion', authMiddleware, processAccountDeletion);

export default router;