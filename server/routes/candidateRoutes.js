// server/routes/candidateRoutes.js

import express from 'express';
import { body, validationResult } from 'express-validator';
import createError from 'http-errors';

import {
  getAllCandidates,
  getCandidateDashboard,
  updateCandidateProfile,
  uploadTestimonial,
  getCandidateDraft,
  saveCandidateDraft,
  getCandidateStatus,
  getCandidateProfile // <-- NEW
} from '../controllers/candidateController.js';

import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';
import upload from '../middleware/upload.js';
import { getStatusValidation, profileUpdateValidation } from '../validators/candidateValidator.js';

const router = express.Router();

const validate = (checks) => [
  ...checks,
  (req, _res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, errors.array().map(e => e.msg).join(', ')));
    }
    next();
  }
];

// ----------- Admin-only -----------
router.get('/', verifyToken, authorizeRoles('admin', 'super-admin'), getAllCandidates);

// ----------- Candidate-only (protect all below) -----------
router.use(verifyToken, authorizeRoles('candidate'));

// Full candidate profile (GET /profile)
router.get('/profile', getCandidateProfile);

// Get candidate status
router.get('/status', ...getStatusValidation, getCandidateStatus);

// Candidate dashboard (profile overview, for pushes/matches)
router.get('/dashboard', getCandidateDashboard);

// Update candidate profile (PUT!)
router.put(
  '/profile',
  validate(profileUpdateValidation),
  updateCandidateProfile
);

// Upload document/testimonial/certificate
router.post(
  '/upload',
  upload.single('file'),
  validate([
    body('type').isIn(['education','experience','salary']).withMessage('type is required and must be correct'),
    body('index').optional().isInt({ min: 0 }).withMessage('index must be a number if supplied')
  ]),
  uploadTestimonial
);

// Get draft in-progress application/profile
router.get('/draft', getCandidateDraft);

// Save draft
router.post(
  '/draft',
  validate([
    body('data').exists().custom(v => typeof v === 'object' && !Array.isArray(v)).withMessage('data must be an object'),
    body('step').optional().isString()
  ]),
  saveCandidateDraft
);

export default router;
