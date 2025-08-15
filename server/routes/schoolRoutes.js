// server/routes/schoolRoutes.js

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import createError from 'http-errors';
import {
  registerSchool,
  verifySchoolOTP,
  resendOTP,
  loginSchool,
  postRequirement,
  getSchoolRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  getSchoolProfile,
  updateSchoolProfile
} from '../controllers/schoolController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

// Helper to handle validation errors
function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, errors.array().map(e => e.msg).join(', ')));
  }
  next();
}

/* ------------------- Public Routes ------------------- */

// SCHOOL REGISTER
router.post(
  '/register',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('termsAccepted')
    .isBoolean().withMessage('Terms acceptance flag must be boolean')
    .custom(value => value === true).withMessage('Terms must be accepted'),
  body('contactNo').matches(/^\+?[0-9]{7,15}$/).withMessage('Valid contact number is required'),
  body('affiliationNo').notEmpty().withMessage('Affiliation number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('pincode').isPostalCode('IN').withMessage('Valid Indian pincode is required'),
  body('board').isIn(['CBSE', 'ICSE', 'State', 'IB', 'IGCSE']).withMessage('Invalid board'),
  body('schoolUpto').isIn(['V', 'X', 'XII']).withMessage('Invalid schoolUpto'),
  body('strength').isInt({ min: 1 }).withMessage('Strength must be at least 1'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('principalName').optional().notEmpty(),
  body('directorName').optional().notEmpty(),
  body('whatsappNumber').optional().matches(/^\+?[0-9]{7,15}$/),
  validate,
  registerSchool
);

// SCHOOL: Verify OTP
router.post(
  '/verify-otp',
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validate,
  verifySchoolOTP
);

// SCHOOL: Resend OTP
router.post(
  '/resend-otp',
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
  resendOTP
);

// SCHOOL LOGIN (username or email accepted)
router.post(
  '/login',
  body('login').trim().notEmpty().withMessage('Username or email is required'),
  body('password')
    .exists().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  loginSchool
);


/* ------------------- FIX: Shared Routes (School & Admin) ------------------- */

// This specific route is now accessible by schools and admins.
router.get(
  '/requirements/:id',
  verifyToken,
  authorizeRoles('school', 'admin', 'super-admin'), // <-- Allows admin access
  param('id').isMongoId().withMessage('Invalid requirement ID'),
  validate,
  getRequirementById
);

/* ------------------------------------------------------------------------- */


/* ------------------- Protected Routes (School only) ------------------- */

// This middleware now applies only to the routes defined below it.
router.use(verifyToken, authorizeRoles('school'));

// SCHOOL PROFILE
router.get('/profile', getSchoolProfile);

router.put(
  '/profile',
  body('name').optional().isString(),
  body('address').optional().isString(),
  body('location').optional().isString(),
  body('pincode').optional().matches(/^\d{6}$/),
  body('contactNo').optional().matches(/^\+?[0-9]{7,15}$/),
  body('website').optional().isURL(),
  body('principalName').optional().isString(),
  body('directorName').optional().isString(),
  body('strength').optional().isInt({ min: 1 }),
  validate,
  updateSchoolProfile
);

// REQUIREMENT CRUD
router.post(
  '/requirements',
  body('title').notEmpty().withMessage('Title is required'),
  body('teachingOrNonTeaching').isIn(['Teaching', 'Non-Teaching']).withMessage('Invalid type'),
  body('qualification').notEmpty().withMessage('Qualification is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be non-negative'),
  body('minExperience').isInt({ min: 0 }).withMessage('minExperience must be non-negative'),
  body('minQualification').notEmpty().withMessage('minQualification is required'),
  body('gender').isIn(['Male','Female','Any']).withMessage('Invalid gender'),
  body('noOfCandidates').isInt({ min: 1 }).withMessage('noOfCandidates must be at least 1'),
  validate,
  postRequirement
);

router.get(
  '/requirements',
  query('archived').optional().isBoolean().withMessage('archived must be boolean'),
  validate,
  getSchoolRequirements
);

router.put(
  '/requirements/:id',
  param('id').isMongoId().withMessage('Invalid requirement ID'),
  validate,
  updateRequirement
);

router.delete(
  '/requirements/:id',
  param('id').isMongoId().withMessage('Invalid requirement ID'),
  validate,
  deleteRequirement
);

export default router;