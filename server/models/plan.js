// server/models/plan.js

import mongoose from 'mongoose';

/**
 * @description Represents a subscription plan that a school can subscribe to.
 * This schema is designed to be managed from the admin panel.
 */
const planSchema = new mongoose.Schema({
    // Core Plan Details
    name: {
        type: String,
        required: [true, 'Plan name is required.'],
        trim: true,
        unique: true,
        description: 'The display name of the plan (e.g., "Basic", "Premium").'
    },
    description: {
        type: String,
        trim: true,
        description: 'A short tagline or description for the plan, shown on the pricing page.'
    },

    // Pricing Information
    price: {
        type: Number,
        required: [true, 'Price is required.'],
        min: [0, 'Price cannot be negative.'],
        description: 'Price in the smallest currency unit (e.g., paise for INR, cents for USD) to avoid floating-point issues.'
    },
    currency: {
        type: String,
        required: [true, 'Currency is required.'],
        default: 'inr',
        lowercase: true,
        trim: true,
        description: 'The ISO currency code (e.g., "inr", "usd").'
    },
    billingCycle: {
        type: String,
        required: [true, 'Billing cycle is required.'],
        enum: ['monthly', 'yearly'],
        description: 'Specifies if the plan price is per month or per year.'
    },

    // Feature Gating & Limits
    features: {
        type: [String],
        default: [],
        description: 'A list of feature descriptions for display on the pricing page.'
    },
    jobPostLimit: {
        type: Number,
        required: [true, 'Job post limit is required.'],
        default: 0,
        description: 'The maximum number of job requirements a school can post. Use -1 for unlimited.'
    },
    candidatePushLimit: {
        type: Number,
        required: [true, 'Candidate push limit is required.'],
        default: 0,
        description: 'The maximum number of candidates an admin can push to the school. Use -1 for unlimited.'
    },

    // Admin & System Control
    isActive: {
        type: Boolean,
        default: true,
        description: 'Controls if the plan is active and available for new subscriptions. Can be toggled from the admin panel.'
    },
    isPopular: {
        type: Boolean,
        default: false,
        description: 'Flags the plan as "Most Popular" on the pricing page. Can be set from the admin panel.'
    },

    // Payment Gateway Integration
    razorpayPlanId: {
        type: String,
        trim: true,
        description: 'The corresponding Plan ID from the Razorpay payment gateway. Crucial for linking subscriptions.'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const Plan = mongoose.model('Plan', planSchema);

export default Plan;