// server/routes/pushRoutes.js

import express from 'express';
import { body, validationResult } from 'express-validator';
import createError from 'http-errors';
import { pushCandidates, getAllPushedCandidates } from '../controllers/pushController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

function validate(checks) {
  return [
    ...checks,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(createError(400, errors.array().map(e => e.msg).join(', ')));
      }
      next();
    }
  ];
}

// POST /api/v1/admin/push
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'super-admin'), // <-- Now allows both 'admin' and 'super-admin'
  validate([
    body('requirementId').isMongoId().withMessage('Valid requirementId required'),
    body('candidates').isArray({ min: 1 }).withMessage('Candidates array required'),
    body('candidates.*.id').isMongoId().withMessage('Each candidate.id must be valid'),
    body('candidates.*.score').isNumeric().withMessage('Each candidate.score must be numeric')
  ]),
  pushCandidates
);

// GET /api/v1/admin/push
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'super-admin'), // <-- Now allows both
  getAllPushedCandidates
);

export default router;
