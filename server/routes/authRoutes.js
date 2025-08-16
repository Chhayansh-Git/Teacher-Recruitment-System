// server/routes/authRoutes.js

import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { otpLimiter } from '../middleware/rateLimiter.js';

import {
  register,
  verifyOtp,
  resendOtp, // --- NEW IMPORT ---
  login,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/authController.js';

const router = express.Router();

// Public endpoints
router.post('/register', asyncHandler(register));
router.post('/verify-otp', otpLimiter, asyncHandler(verifyOtp));
router.post('/resend-otp', otpLimiter, asyncHandler(resendOtp)); // --- NEW ROUTE ---
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

// Protected endpoint
router.post('/change-password', verifyToken, asyncHandler(changePassword));

export default router;