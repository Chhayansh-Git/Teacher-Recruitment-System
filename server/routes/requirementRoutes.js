// server/routes/requirementRoutes.js

import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  postRequirement,
  getSchoolRequirements
} from '../controllers/requirementController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

function validate(checks) {
  return [
    ...checks,
    (req, _res, next) => {
      const errs = validationResult(req);
      if (!errs.isEmpty()) {
        return next(require('http-errors')(400, errs.array().map((e) => e.msg).join(', ')));
      }
      next();
    }
  ];
}

// POST /api/v1/requirements
router.post(
  '/',
  verifyToken,
  authorizeRoles('school'),
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isIn(['teaching', 'nonTeaching']).withMessage('Type must be teaching or nonTeaching'),
    body('post').notEmpty().withMessage('Post is required'),
    body('qualification').notEmpty().withMessage('Qualification is required'),
    body('minExperience').isInt({ min: 0 }).withMessage('minExperience must be a non-negative integer'),
    body('location').notEmpty().withMessage('Location is required')
  ]),
  postRequirement
);

// GET /api/v1/requirements?archived=true
router.get(
  '/',
  verifyToken,
  authorizeRoles('school'),
  getSchoolRequirements
);

export default router;
