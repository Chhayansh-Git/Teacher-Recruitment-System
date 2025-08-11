//server/models/auditLog.js

import mongoose from "mongoose";
const AuditLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action:     { type: String, required: true },
  before:     { type: mongoose.Schema.Types.Mixed },
  after:      { type: mongoose.Schema.Types.Mixed },
  timestamp:  { type: Date, default: Date.now }
});
export default mongoose.model("AuditLog", AuditLogSchema);
