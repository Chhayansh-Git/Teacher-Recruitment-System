// server/models/pushedCandidate.js

import mongoose from 'mongoose';

const pushedCandidateSchema = new mongoose.Schema({
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true, index: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  candidates: [{
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    score: { type: Number, default: 0 }
  }],
  pushedAt: { type: Date, default: Date.now }
}, { timestamps: true });

pushedCandidateSchema.index({ requirement: 1, "candidates.candidate": 1 }, { unique: true, partialFilterExpression: { "candidates.candidate": { $exists: true } } });

export default mongoose.models.PushedCandidate ||
  mongoose.model('PushedCandidate', pushedCandidateSchema);

