// server/routes/matchRoutes.js
import express from 'express';
import { matchCandidatesToRequirement } from '../controllers/matchController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get(
  '/:requirementId',
  verifyToken,
  authorizeRoles('admin', 'super-admin'),
  matchCandidatesToRequirement
);

export default router;
