import AuditLog from "../models/auditLog.js";

/** Write audit log to DB (and optionally to file/console) */
export async function auditLogger({ userId, action, before, after, description = '' }) {
  await AuditLog.create({ userId, action, before, after, description, timestamp: new Date() });
}
