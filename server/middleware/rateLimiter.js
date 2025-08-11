/**
 * rateLimiter.js
 *
 * Centralized rate-limiting strategy:
 *  – otpLimiter: 5 OTP requests / 15 min / IP or email
 *  – apiLimiter: 100 requests / 1 min / IP
 *
 * Uses express-rate-limit v7.x
 */

import rateLimit from 'express-rate-limit';

/* ------------------------------------------------------------------ */
/*  OTP verification endpoint                                           */
/* ------------------------------------------------------------------ */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 requests
  standardHeaders: true,    // Draft-6 RateLimit headers
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many OTP requests. Please try again later.'
  },
  keyGenerator: (req) => {
    // Rate-limit by email when provided; fallback to IP
    return req.body?.email?.toLowerCase() ?? req.ip;
  }
});

/* ------------------------------------------------------------------ */
/*  Global API protection                                               */
/* ------------------------------------------------------------------ */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests. Please slow down.'
  }
});