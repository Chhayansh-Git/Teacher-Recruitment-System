import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Invalid email address"]
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'super-admin'], default: 'admin' }
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
