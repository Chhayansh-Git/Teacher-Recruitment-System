// server/models/requirements.js

import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    noOfCandidates: { type: Number, min: 1, required: true },
    posts: [{ type: String, trim: true }],
    subjects: [{ type: String, trim: true }],
    gender: { type: String, enum: ['Male', 'Female', 'Any'], required: true },
    teachingOrNonTeaching: { type: String, enum: ['Teaching', 'Non-Teaching'], required: true },
    minQualification: { type: String, required: true },
    minExperience: { type: Number, min: 0, required: true },
    maxSalary: { type: Number, min: 0 },
    status: { type: String, enum: ['open', 'closed', 'filled'], default: 'open' },
    archived: { type: Boolean, default: false },
    postedAt: { type: Date, default: Date.now }
  },
  { 
    timestamps: true,
    collection: 'requirements' 
  }
);

export default mongoose.models.Requirement || mongoose.model('Requirement', requirementSchema);