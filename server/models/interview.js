// server/models/interview.js

import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true, index: true },
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true, index: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  scheduledAt: { type: Date, required: true },
  mode: { type: String, enum: ['Online', 'Offline'], required: true },
  panel: [{ type: String, trim: true }],
  status: { type: String, enum: ['scheduled', 'completed', 'no_show', 'canceled'], default: 'scheduled' },
  feedback: { type: String, trim: true },
  score: { type: Number, min: 0, max: 10 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

interviewSchema.index({ candidate: 1, requirement: 1 }, { unique: true });

interviewSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Interview ||
  mongoose.model('Interview', interviewSchema);
