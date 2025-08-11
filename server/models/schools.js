// server/models/schools.js

import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    // Core identity
    name: { type: String, required: true, trim: true },

    // Username: assigned on OTP verification, unique
    username: { type: String, unique: true, sparse: true, trim: true },

    // Administrative
    affiliationNo: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, match: /^\d{6}$/, trim: true },

    // Contacts
    contactNo: { type: String, required: true, match: /^\+?[0-9]{7,15}$/, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true, // index handled by field, do NOT duplicate below!
      match: [/\S+@\S+\.\S+/, 'Invalid email']
    },
    whatsappNumber: { type: String, match: /^\+?[0-9]{7,15}$/, trim: true },

    // Web & Leadership
    website: { type: String, trim: true },
    principalName: { type: String, trim: true },
    directorName: { type: String, trim: true },

    // Academic profile
    strength: { type: Number, min: 1, required: true },
    schoolUpto: { type: String, enum: ['V', 'X', 'XII'], required: true },
    board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE'], required: true },

    // Authentication & onboarding
    password: { type: String, select: false }, // bcrypt hash
    firstLogin: { type: Boolean, default: true },

    // Verification
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedByAdmin: { type: Boolean, default: false },

    acceptedTerms: { type: Boolean, default: false },

    // OTP for verification
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },

    // Fee tracking
    feeRequired: { type: Boolean, default: false },
    registrationFeePaid: { type: Boolean, default: false },
    candidatesPostedCount: { type: Number, default: 0 },

    // Subscription window
    subscription: {
      plan: { type: String, enum: ['monthly', 'yearly'] },
      start: Date,
      end: Date
    },

    // Metadata & T&C
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

schoolSchema.index({ feeRequired: 1 });

export default mongoose.models.School || mongoose.model('School', schoolSchema);
