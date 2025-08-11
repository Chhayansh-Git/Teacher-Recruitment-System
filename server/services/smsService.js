// server/services/smsService.js
import dotenv from 'dotenv';
import twilio from 'twilio';
import createError from 'http-errors';
import logger from '../utils/logger.js';

dotenv.config();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  logger.error('✖ Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are missing');
  throw new Error('Twilio configuration missing');
}

const client = twilio(accountSid, authToken);

/**
 * sendOTP
 * @param {string} mobile       – E.164 format (+<country><number>)
 * @param {string|number} otp   – One‑time password
 * @returns {Promise<object>}   – Twilio message response
 */
export async function sendOTP(mobile, otp) {
  const body = `Your verification code is: ${otp}`;
  try {
    const msg = await client.messages.create({
      body,
      from: fromNumber,
      to: mobile
    });
    logger.info(`📲 SMS OTP sent to ${mobile}; SID=${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    logger.error(`❌ Failed to send SMS OTP to ${mobile}: ${err.message}`);
    throw createError(500, 'SMS sending failed');
  }
}
