/**
 * requirements.js
 * Full requirement schema per SRS
 *  – gender, teaching flag, posts list, archived flag
 */
import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

    /* Core details */
    title: { type: String, required: true, trim: true },
    noOfCandidates: { type: Number, min: 1, required: true },

    /* Post & subject info */
    posts: [{ type: String, trim: true }],
    subjects: [{ type: String, trim: true }],

    /* Filters */
    gender: { type: String, enum: ['Male', 'Female', 'Any'], required: true },
    teachingOrNonTeaching: {
      type: String,
      enum: ['Teaching', 'Non-Teaching'],
      required: true
    },
    minQualification: { type: String, required: true },
    minExperience: { type: Number, min: 0, required: true },
    maxSalary: { type: Number, min: 0 },            // optional

    /* Lifecycle */
    status: { type: String, enum: ['open', 'closed', 'filled'], default: 'open' },
    archived: { type: Boolean, default: false },    // “view old posts”
    postedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Requirement || mongoose.model('Requirement', requirementSchema);