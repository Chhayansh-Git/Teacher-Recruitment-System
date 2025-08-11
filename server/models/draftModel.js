// server/models/draftModel.js

import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Draft Schema: in-progress candidate registration data
 */
const draftSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Candidate",
      index: true
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {}
    },
    step: {
      type: String,
      default: null,
      trim: true
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    collection: "drafts",
    strict: false,
    minimize: false
  }
);

// Auto-update timestamp and increment version
draftSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (!this.isNew) this.version += 1;
  next();
});

// Static: retrieve draft
draftSchema.statics.findDraftByUser = function (userId) {
  return this.findOne({ userId });
};

// Static: upsert draft
draftSchema.statics.upsertDraft = function (userId, data, step = null) {
  return this.findOneAndUpdate(
    { userId },
    { data, step, updatedAt: Date.now() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const Draft = mongoose.model("Draft", draftSchema);

// Export model and statics
export default Draft;
export const findDraftByUser = Draft.findDraftByUser.bind(Draft);
export const upsertDraft = Draft.upsertDraft.bind(Draft);
