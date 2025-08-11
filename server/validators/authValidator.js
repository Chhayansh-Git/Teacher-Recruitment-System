// server/validators/authValidator.js

import Joi from 'joi';
import formSchemas from '../config/formSchemas.js';

// Base fields for any register call
const base = {
  role: Joi.string().valid('candidate', 'school').required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
};

// Candidate-specific profile fields
const candidateProfile = {
  fullName: Joi.string().min(2).max(50).required(),
  contact: Joi.string().pattern(/^\+?[0-9]{7,15}$/).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  dob: Joi.date().max('now').optional(),
  maritalStatus: Joi.string().valid('Single', 'Married', 'Other').optional(),
  address: Joi.string().allow('', null).optional(),
  city: Joi.string().allow('', null).optional(),
  state: Joi.string().allow('', null).optional(),
  pinCode: Joi.string().pattern(/^\d{6}$/).optional(),
  type: Joi.string().valid('teaching', 'nonTeaching').required(),
  position: Joi.string().required().custom((val, helpers) => {
    const type = helpers.state.ancestors[0].type;
    if (!formSchemas[type]?.[val]) {
      return helpers.error('any.invalid', { label: 'position' });
    }
    return val;
  }, 'Position validation'),
  preferredLocations: Joi.array().items(Joi.string()).optional(),
  previousSalary: Joi.number().min(0).optional(),
  expectedSalary: Joi.number().min(0).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  communicationSkills: Joi.string().allow('', null).optional(),
  achievements: Joi.string().allow('', null).optional(),
  extraResponsibilities: Joi.array().items(Joi.string()).optional()
};

// 1. Registration schema (role-conditional)
export const registerSchema = Joi.object(base)
  .when(Joi.object({ role: 'candidate' }).unknown(), {
    then: Joi.object(base).concat(Joi.object(candidateProfile)),
    otherwise: Joi.object(base)
  });

// 2. Login
export const loginSchema = Joi.object({
  role: Joi.string().valid('candidate', 'school', 'admin').required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// 3. Verify OTP
export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required()
});

// 4. Forgot Password
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// 5. Reset Password (via token)
export const resetPasswordSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  token: Joi.string().required(),
  password: Joi.string().min(8).required()
});

// 6. Change Password (authenticated)
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmNew: Joi.string().required().valid(Joi.ref('newPassword'))
});
