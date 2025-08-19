// server/controllers/webhookController.js

import logger from '../utils/logger.js';
import Subscription from '../models/subscription.js';
import { verifyWebhookSignature } from '../services/paymentService.js';

/**
 * @description Handles incoming webhook events from Razorpay to automate subscription status updates.
 */
export const handleRazorpayWebhook = async (req, res) => {
    // Step 1: Verify the signature to ensure the request is from Razorpay
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody; // We'll get this from a special middleware

    const isAuthentic = verifyWebhookSignature(rawBody, signature);

    if (!isAuthentic) {
        logger.warn('⚠️ Received a webhook with an invalid signature. Aborting.');
        return res.status(400).json({ error: 'Invalid signature.' });
    }

    // Step 2: Process the event payload
    const event = req.body.event;
    const payload = req.body.payload;
    logger.info(`🔔 Received Razorpay Webhook Event: ${event}`);

    try {
        switch (event) {
            case 'subscription.charged': {
                const subscriptionData = payload.subscription.entity;
                const paymentData = payload.payment.entity;

                const subscription = await Subscription.findOne({
                    razorpaySubscriptionId: subscriptionData.id
                }).populate('plan');

                if (subscription) {
                    const plan = subscription.plan;
                    const newEndDate = new Date();

                    if (plan.billingCycle === 'monthly') {
                        newEndDate.setMonth(newEndDate.getMonth() + 1);
                    } else if (plan.billingCycle === 'yearly') {
                        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                    }

                    subscription.status = 'active';
                    subscription.endDate = newEndDate;
                    subscription.razorpayPaymentId = paymentData.id;
                    await subscription.save();
                    logger.info(`✅ Subscription ${subscription._id} successfully charged and updated to 'active'.`);
                } else {
                    logger.warn(`Webhook for unknown subscription ID: ${subscriptionData.id}`);
                }
                break;
            }

            case 'subscription.cancelled': {
                const subscriptionData = payload.subscription.entity;
                const subscription = await Subscription.findOne({
                    razorpaySubscriptionId: subscriptionData.id
                });

                if (subscription) {
                    subscription.status = 'canceled';
                    // The 'endDate' remains the same, as the subscription is valid until the period ends.
                    await subscription.save();
                    logger.info(`🚫 Subscription ${subscription._id} was canceled. Status updated.`);
                } else {
                    logger.warn(`Webhook for unknown subscription ID: ${subscriptionData.id}`);
                }
                break;
            }

            // You can add more cases here for other events like 'subscription.halted', 'payment.failed', etc.
            default:
                logger.info(`Webhook event "${event}" received but not handled.`);
        }
    } catch (err) {
        logger.error(`❌ Error processing webhook event ${event}:`, err);
        // Return a 500 but still send 200 to Razorpay to prevent retries for our error.
        // In production, you might want a more robust error handling/retry mechanism.
    }

    // Step 3: Acknowledge receipt to Razorpay
    // It's crucial to send a 200 OK status, otherwise Razorpay will keep retrying the webhook.
    res.status(200).json({ status: 'ok' });
};