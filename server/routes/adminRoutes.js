// server/routes/adminRoutes.js

import express from 'express';
import { body, param, validationResult } from 'express-validator';
import createError from 'http-errors';

import {
  inviteAdmin,
  loginAdmin,
  getDashboard,
  getAllRequirements,
  changeRequirementStatus,
  getAllSchools,
  manuallyVerifySchool,
  pushCandidatesToRequirement,
  getAllCandidates,
  getRequirementByIdForAdmin,
  getCandidateDetails,      // --- NEW IMPORT ---
  updateCandidateDetails    // --- NEW IMPORT ---
} from '../controllers/adminController.js';

import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

// Validation helper
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

// Public admin endpoints
router.post(
  '/invite',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('role').optional().isString()
  ]),
  inviteAdmin
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password required')
  ]),
  loginAdmin
);

// Protected admin: allow both 'admin' and 'super-admin'
router.use(verifyToken, authorizeRoles('admin', 'super-admin'));

router.get('/dashboard', getDashboard);

router.get('/requirements', getAllRequirements);

router.get(
  '/requirements/:id',
  validate([param('id').isMongoId().withMessage('Valid requirement ID required')]),
  getRequirementByIdForAdmin
);

router.put(
  '/requirements/:id/status',
  validate([
    param('id').isMongoId().withMessage('Valid requirement ID required'),
    body('status').isString().withMessage('Status required')
  ]),
  changeRequirementStatus
);

router.put(
  '/verify-school/:id',
  validate([param('id').isMongoId().withMessage('Valid school ID required')]),
  manuallyVerifySchool
);

router.get('/schools', getAllSchools);

router.get('/candidates', getAllCandidates);

// --- NEW ROUTES FOR CANDIDATE MANAGEMENT ---
router.get(
    '/candidates/:id',
    validate([param('id').isMongoId().withMessage('Valid candidate ID is required')]),
    getCandidateDetails
);

router.put(
    '/candidates/:id',
    validate([
        param('id').isMongoId().withMessage('Valid candidate ID is required'),
        body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
        body('isSuspended').optional().isBoolean().withMessage('isSuspended must be a boolean'),
        body('status').optional().isString().withMessage('Status must be a string'),
        body('adminNotes').optional().isString().withMessage('Admin notes must be a string')
    ]),
    updateCandidateDetails
);
// --------------------------------------------

router.post(
  '/requirements/:id/push-candidates',
  validate([
    param('id').isMongoId().withMessage('Valid requirement ID required'),
    body('candidateIds').isArray({ min: 1 }).withMessage('candidateIds must be a non-empty array'),
    body('candidateIds.*').isMongoId().withMessage('Each candidateId must be a valid Mongo ID')
  ]),
  pushCandidatesToRequirement
);

export default router;