// server/models/otpToken.js
/**
 * Token Schema
 * Stores one‑time tokens for OTP verification and password resets.
 * TTL automatically removes expired tokens via expiresAt index.
 */
import mongoose from 'mongoose';

const { Schema } = mongoose;

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'role'
    },
    role: {
      type: String,
      required: true,
      enum: ['Candidate', 'School', 'Admin']
    },
    type: {
      type: String,
      required: true,
      enum: ['otp', 'reset'],
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }  // TTL index: document removed when expiresAt < now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'tokens',
    strict: true
  }
);

// Automatically remove token once used in your verify handler:
// await Token.deleteOne({ token, type: 'otp', userId, role });

export default mongoose.models.Token || mongoose.model('Token', tokenSchema);
