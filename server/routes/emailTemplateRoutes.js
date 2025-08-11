// server/routes/emailTemplateRoutes.js

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import createError from 'http-errors';
import {
  listTemplates,
  getTemplateByKey,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  seedDefaultTemplates
} from '../controllers/emailTemplateController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

// Admin-only
router.use(verifyToken, authorizeRoles('admin', 'super-admin'));

// Validation helper
const handleValidation = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, errors.array().map(e => e.msg).join(', ')));
  }
  next();
};

// List & search
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim(),
    handleValidation
  ],
  listTemplates
);

// Fetch by key
router.get(
  '/:key',
  [
    param('key').trim().notEmpty().withMessage('Key required').isAlphanumeric().withMessage('Key must be alphanumeric'),
    handleValidation
  ],
  getTemplateByKey
);

// Create new
router.post(
  '/',
  [
    body('key').exists().withMessage('Key is required').trim().notEmpty().withMessage('Key cannot be empty').isAlphanumeric().withMessage('Key must be alphanumeric'),
    body('subject').exists().withMessage('Subject is required').trim(),
    body('body').exists().withMessage('Body is required').trim(),
    body('description').optional().trim(),
    handleValidation
  ],
  createTemplate
);

// Update existing
router.put(
  '/:key',
  [
    param('key').trim().notEmpty().withMessage('Key required').isAlphanumeric().withMessage('Key must be alphanumeric'),
    body('subject').optional().trim().notEmpty(),
    body('body').optional().trim().notEmpty(),
    body('description').optional().trim(),
    handleValidation
  ],
  updateTemplate
);

// Delete
router.delete(
  '/:key',
  [
    param('key').trim().notEmpty().withMessage('Key required').isAlphanumeric().withMessage('Key must be alphanumeric'),
    handleValidation
  ],
  deleteTemplate
);

// Seed/restore defaults
router.post('/seed-defaults', seedDefaultTemplates);

export default router;
