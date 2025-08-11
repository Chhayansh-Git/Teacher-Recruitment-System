// server/routes/aiRoutes.js
import express from 'express';
import { feedbackAI } from '../controllers/aiController.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/feedback', verifyToken, authorizeRoles('admin', 'super-admin'), feedbackAI);
export default router;