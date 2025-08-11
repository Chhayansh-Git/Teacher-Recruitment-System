// server/services/tokenService.js
import crypto from "crypto";
import mongoose from "mongoose";
import createError from "http-errors";

// ─── Token Schema ───────────────────────────────────────────────
const tokenSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  token:     { type: String, required: true, index: true },
  type:      { type: String, enum: ["otp", "reset"], required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
}, { timestamps: true });

const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);

// ─── Helpers ────────────────────────────────────────────────────
function generateRandomHex(len = 40) {
  return crypto.randomBytes(len / 2).toString("hex");
}

// ─── OTP: 6‑digit numeric ────────────────────────────────────────
export async function generateOtpToken(userId) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await Token.create({ userId, token: code, type: "otp", expiresAt });
  return code;
}

export async function verifyOtpToken(userId, code) {
  const rec = await Token.findOneAndDelete({ userId, token: code, type: "otp" });
  if (!rec) {
    throw createError(400, "Invalid or expired OTP");
  }
  return true;
}

// ─── Password‑reset: long hex ───────────────────────────────────
export async function generateResetToken(userId) {
  const token = generateRandomHex(40);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hr
  await Token.create({ userId, token, type: "reset", expiresAt });
  return token;
}

export async function verifyResetToken(userId, token) {
  const rec = await Token.findOneAndDelete({ userId, token, type: "reset" });
  if (!rec) {
    throw createError(400, "Invalid or expired reset token");
  }
  return true;
}
