// server/routes/interviewRoutes.js

import express from 'express';
import { upsertInterview, completeInterview, getInterviews } from '../controllers/interviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

// Schedule/Reschedule Interview
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'school', 'super-admin'),
  upsertInterview
);

// Complete Interview
router.put(
  '/:id/complete',
  verifyToken,
  authorizeRoles('admin', 'school', 'super-admin'),
  completeInterview
);

// Get Interviews
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'school', 'super-admin'),
  getInterviews
);

export default router;
