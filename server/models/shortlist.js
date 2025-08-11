// server/models/shortlist.js

import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true, index: true },
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true, index: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  status: {
    type: String,
    enum: ['shortlisted', 'invited', 'declined', 'accepted', 'withdrawn', 'hired', 'rejected'],
    default: 'shortlisted'
  },
  notes: { type: String, trim: true },
  actedAt: { type: Date, default: Date.now }
}, { timestamps: true });

shortlistSchema.index({ candidate: 1, requirement: 1 }, { unique: true });

export default mongoose.models.Shortlist ||
  mongoose.model('Shortlist', shortlistSchema);


