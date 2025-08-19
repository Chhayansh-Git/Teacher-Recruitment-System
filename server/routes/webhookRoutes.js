// server/routes/webhookRoutes.js

import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

/**
 * @description This middleware is crucial for webhook security.
 * Razorpay's signature verification requires the raw, unparsed request body.
 * The standard express.json() middleware would parse the body, making verification impossible.
 * This ensures that for this specific route, we get the body as a raw buffer.
 */
const rawBodyMiddleware = express.raw({ type: 'application/json' });

/**
 * @route POST /api/webhooks/razorpay
 * @description The dedicated endpoint for receiving and processing webhooks from Razorpay.
 * @access Public (must be accessible by Razorpay's servers)
 */
router.post('/razorpay', rawBodyMiddleware, (req, res, next) => {
    // Attach the raw body to the request object for the controller to use
    req.rawBody = req.body.toString();
    next();
}, handleRazorpayWebhook);


export default router;