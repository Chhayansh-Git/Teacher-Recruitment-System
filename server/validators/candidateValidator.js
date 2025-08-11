// server/validators/candidateValidator.js

import { body } from 'express-validator';
import {
  educationLevels,
  candidateTypes,
  employmentTypes,
  genderOptions,
  maritalStatuses
} from '../models/candidate.js';

export const getStatusValidation = [];

export const profileUpdateValidation = [
  body('type').optional().isIn(candidateTypes).withMessage('Invalid candidate type.'),
  body('position').optional().isString().notEmpty().withMessage('Position is required.'),
  body('languages').optional().isArray().withMessage('Languages must be an array.'),
  body('skills').optional().isArray().withMessage('Skills must be an array.'),
  body('preferredLocations').optional().isArray(),
  body('extraResponsibilities').optional().isArray(),
  body('address').optional().isString(),

  // Education fields
  body('education').optional().isArray(),
  body('education.*.level').optional().isIn(educationLevels).withMessage('Invalid education level.'),
  body('education.*.degree').optional().isString().notEmpty(),
  body('education.*.boardOrUniversity').optional().isString().notEmpty(),
  body('education.*.passingYear').optional().isInt({ min: 1900, max: new Date().getFullYear() }),

  // Experience fields
  body('experience').optional().isArray(),
  body('experience.*.role').optional().isString().notEmpty(),
  body('experience.*.from').optional().isISO8601().toDate(),
  body('experience.*.employmentType').optional().isIn(employmentTypes).withMessage('Invalid employment type.'),
  // Additional checks as needed…
];
