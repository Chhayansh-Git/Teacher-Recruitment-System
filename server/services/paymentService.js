// server/services/paymentService.js

import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import createError from 'http-errors';
import crypto from 'crypto';
import logger from '../utils/logger.js';

dotenv.config();

const { RAZORPAY_KEY_ID: key_id, RAZORPAY_KEY_SECRET: key_secret } = process.env;
if (!key_id || !key_secret) {
  logger.error('✖ Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing');
  throw new Error('Razorpay configuration missing');
}

const razor = new Razorpay({ key_id, key_secret });

/**
 * createOrder
 * Creates a one‑time payment order for school registration or subscription.
 *
 * @param {object} params
 * @param {number} params.amount        – Amount in smallest currency unit (e.g. paise for INR)
 * @param {string} params.currency      – E.g. 'INR'
 * @param {string} params.receipt       – Unique receipt identifier
 * @returns {Promise<Razorpay.Order>}   – Razorpay order object
 */
export async function createOrder({ amount, currency = 'INR', receipt }) {
  try {
    const order = await razor.orders.create({ amount, currency, receipt });
    logger.info(`💳 Razorpay order created: ${order.id} for receipt ${receipt}`);
    return order;
  } catch (err) {
    logger.error('❌ Razorpay order creation failed:', err);
    throw createError(500, 'Payment order creation failed');
  }
}

/**
 * verifySignature
 * Verifies payment signature in webhook or client callback to ensure authenticity.
 *
 * @param {object} params
 * @param {string} params.order_id
 * @param {string} params.payment_id
 * @param {string} params.signature
 * @returns {boolean}
 */
export function verifySignature({ order_id, payment_id, signature }) {
  const body     = `${order_id}|${payment_id}`;
  const expected = crypto.createHmac('sha256', key_secret).update(body).digest('hex');
  const valid    = expected === signature;
  if (!valid) logger.warn(`⚠️ Razorpay signature mismatch for order ${order_id}`);
  return valid;
}
