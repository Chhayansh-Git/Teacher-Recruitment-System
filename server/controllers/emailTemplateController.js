// server/controllers/emailTemplateController.js

import createError from "http-errors";
import { EmailTemplate, defaultTemplates, ensureDefaultTemplates } from "../models/emailTemplate.js";

/**
 * GET /api/v1/email-templates
 */
export async function listTemplates(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const search = req.query.search?.trim() || "";
    const filter = search
      ? { $or: [
          { key: new RegExp(search, "i") },
          { description: new RegExp(search, "i") }
        ]}
      : {};
    const [total, templates] = await Promise.all([
      EmailTemplate.countDocuments(filter),
      EmailTemplate.find(filter).sort({ key: 1 }).skip((page - 1) * limit).limit(limit)
    ]);
    res.json({
      success: true,
      data: templates,
      meta: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
}

/**
 * GET /api/v1/email-templates/:key
 */
export async function getTemplateByKey(req, res, next) {
  try {
    const key = req.params.key.trim().toUpperCase();
    const tpl = await EmailTemplate.findOne({ key });
    if (!tpl) throw createError(404, `Template '${key}' not found`);
    res.json({ success: true, data: tpl });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/email-templates
 */
export async function createTemplate(req, res, next) {
  try {
    const { key, subject, body, description = "" } = req.body;
    const uKey = key.trim().toUpperCase();
    if (defaultTemplates.some(t => t.key === uKey)) {
      throw createError(409, `Cannot override reserved template '${uKey}'`);
    }
    if (await EmailTemplate.exists({ key: uKey })) {
      throw createError(409, `Template '${uKey}' already exists`);
    }
    const newTpl = await EmailTemplate.create({
      key: uKey,
      subject: subject.trim(),
      body: body.trim(),
      description: description.trim(),
      reserved: false
    });
    res.status(201).json({ success: true, data: newTpl });
  } catch (err) { next(err); }
}

/**
 * PUT /api/v1/email-templates/:key
 */
export async function updateTemplate(req, res, next) {
  try {
    const key = req.params.key.trim().toUpperCase();
    const updates = {};
    for (const field of ["subject", "body", "description"]) {
      if (req.body[field]?.trim()) {
        updates[field] = req.body[field].trim();
      }
    }
    if (!Object.keys(updates).length) {
      throw createError(400, "At least one of subject/body/description is required");
    }
    // Optionally allow editing reserved templates, but not delete
    const updated = await EmailTemplate.findOneAndUpdate(
      { key },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updated) throw createError(404, `Template '${key}' not found`);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

/**
 * DELETE /api/v1/email-templates/:key
 */
export async function deleteTemplate(req, res, next) {
  try {
    const key = req.params.key.trim().toUpperCase();
    if (defaultTemplates.some(t => t.key === key)) {
      throw createError(403, `Cannot delete reserved template '${key}'`);
    }
    const deleted = await EmailTemplate.findOneAndDelete({ key });
    if (!deleted) throw createError(404, `Template '${key}' not found`);
    res.status(204).send();
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/email-templates/seed-defaults
 * Restore (or upsert) reserved templates. Admin-only.
 */
export async function seedDefaultTemplates(req, res, next) {
  try {
    await ensureDefaultTemplates();
    const all = await EmailTemplate.find({ key: { $in: defaultTemplates.map(t => t.key) } });
    res.json({ success: true, data: all });
  } catch (err) { next(err); }
}
