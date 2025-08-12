// server/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import asyncHandler from '../middleware/asyncHandler.js';
import logger from '../utils/logger.js';

import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../validators/authValidator.js';

import {
  generateOtpToken,
  verifyOtpToken,
  generateResetToken,
  verifyResetToken
} from '../services/tokenService.js';

import Candidate from '../models/candidate.js';
import School from '../models/schools.js';
import Admin from '../models/admin.js';
import { sendEmail, sendOTP } from '../services/commService.js';

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const IS_TEST        = process.env.NODE_ENV === 'test';

const signToken = payload =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const getModelByRole = role => {
  switch (role) {
    case 'school': return School;
    case 'admin':  return Admin;
    default:       return Candidate;
  }
};

export const register = asyncHandler(async (req, res) => {
  const { role, email, password, ...details } =
    await registerSchema.validateAsync(req.body);

  if (role === 'admin') {
    throw createError(403, 'Admin accounts cannot self-register');
  }

  const Model = getModelByRole(role);
  if (await Model.exists({ email })) {
    throw createError(409, 'Email already registered');
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await Model.create({
    email,
    password: hashed,
    verified: false,
    ...details
  });
  logger.info(`New ${role} registered: ${user._id}`);

  const otp = await generateOtpToken(user._id);
  if (!IS_TEST) {
    // This correctly uses the sendOTP helper to send a single email.
    await sendOTP(email, otp, details.fullName || details.name || '');
  }

  res.status(201).json({ success: true, message: "Registration successful. Please check your email for the OTP.", userId: user._id });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = await verifyOtpSchema.validateAsync(req.body);

  const user =
    (await School.findOne({ email })) ||
    (await Admin.findOne({ email }))   ||
    (await Candidate.findOne({ email }));
  if (!user) throw createError(404, 'User not found');

  await verifyOtpToken(user._id, otp);
  user.verified = true;
  await user.save();

  const role  = user.constructor.modelName.toLowerCase();
  const token = signToken({ id: user._id, role });
  
  const userObject = user.toObject();
  delete userObject.password;

  res.json({ success: true, token, user: userObject });
});

export const login = asyncHandler(async (req, res) => {
  const { role, email, password } = await loginSchema.validateAsync(req.body);

  const Model = getModelByRole(role);
  const user = await Model.findOne({ email }).select('+password +verified');
  if (!user) throw createError(401, 'Invalid credentials');
  
  if (role !== 'admin' && !user.verified) {
    throw createError(403, 'Please verify your email before logging in');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw createError(401, 'Invalid credentials');

  const token = signToken({ id: user._id, role });
  
  const userObject = user.toObject();
  delete userObject.password;

  res.json({
    success: true,
    token,
    user: userObject
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = await forgotPasswordSchema.validateAsync(req.body);

  const user =
    (await School.findOne({ email }))    ||
    (await Candidate.findOne({ email })) ||
    (await Admin.findOne({ email }));
  if (!user) throw createError(404, 'Email not found');

  const resetToken = await generateResetToken(user._id);
  if (!IS_TEST) {
    // THE FIX: The redundant sendEmail call has been removed.
    // We now only call sendOTP for password resets as well.
    await sendOTP(email, resetToken);
  }

  res.json({ success: true, message: 'Password reset token sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { userId, token, password } =
    await resetPasswordSchema.validateAsync(req.body);

  await verifyResetToken(userId, token);

  const user =
    (await School.findById(userId))    ||
    (await Admin.findById(userId))     ||
    (await Candidate.findById(userId));
  if (!user) throw createError(404, 'User not found');

  user.password = await bcrypt.hash(password, 12);
  await user.save();

  res.json({ success: true, message: 'Password reset successfully' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmNew } =
    await changePasswordSchema.validateAsync(req.body);

  if (newPassword !== confirmNew) {
    throw createError(400, 'New passwords do not match');
  }

  const role  = req.user.role;
  const Model = getModelByRole(role);

  const user = await Model.findById(req.user.id).select('+password');
  if (!user) throw createError(404, 'User not found');

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw createError(400, 'Old password is incorrect');

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});