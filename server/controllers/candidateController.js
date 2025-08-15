// server/controllers/candidateController.js

import createError from 'http-errors';
import logger from '../utils/logger.js';
import Candidate from '../models/candidate.js';
// This model is no longer needed directly in the controller for the dashboard
// import PushedCandidate from '../models/pushedCandidate.js';
import { upsertDraft, findDraftByUser } from '../models/draftModel.js';
import formSchemas from '../config/formSchemas.js';
import asyncHandler from '../middleware/asyncHandler.js';
import * as candidateService from '../services/candidateService.js';

// Helper to strip password
function sanitize(candidate) {
  const obj = candidate.toObject();
  delete obj.password;
  return obj;
}

export async function getAllCandidates(req, res, next) {
  try {
    const list = await Candidate.find();
    res.json({ success: true, data: list.map(sanitize) });
  } catch (err) {
    logger.error('getAllCandidates error:', err);
    next(err);
  }
}

// 🚩 NEW: Candidate profile fetch for 'my profile' route
export async function getCandidateProfile(req, res, next) {
  try {
    const candidate = await Candidate.findById(req.user.id).select('-password');
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ success: true, data: candidate });
  } catch (err) {
    logger.error('getCandidateProfile error:', err);
    next(err);
  }
}

// --- THIS IS THE FIX ---
// The controller function is now simplified to call the powerful service function.
export async function getCandidateDashboard(req, res, next) {
  try {
    const dashboardData = await candidateService.getCandidateDashboard(req.user.id);
    res.json({ success: true, data: dashboardData });
  } catch (err) {
    logger.error('getCandidateDashboard error:', err);
    next(err);
  }
}
// --------------------

export async function updateCandidateProfile(req, res, next) {
  try {
    const id = req.user.id;
    const body = req.body || {};

    const updatableFields = [
      'type', 'position', 'languages', 'skills', 'preferredLocations',
      'extraResponsibilities', 'address', 'experience', 'education'
    ];

    // Validate type/position if present
    const type = body.type;
    const position = body.position;
    if (type || position) {
      const existing = await Candidate.findById(id);
      const t = type || existing.type;
      const p = position || existing.position;
      if (!formSchemas[t]?.[p]) {
        throw createError(400, 'Invalid type/position');
      }
    }

    const updates = {};
    for (const key of updatableFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) {
      throw createError(400, 'No updatable profile fields found in request');
    }

    const updated = await Candidate.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select('-password');
    if (!updated) throw createError(404, 'Candidate not found');
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('updateCandidateProfile error:', err);
    next(err);
  }
}

export async function uploadTestimonial(req, res, next) {
  try {
    const id = req.user.id;
    const { type, index } = req.body;
    if (!req.file) throw createError(400, 'No file uploaded');
    const fileUrl = `/uploads/testimonials/${req.file.filename}`;
    const cand = await Candidate.findById(id);
    if (!cand) throw createError(404, 'Candidate not found');
    if (type === 'education') {
      if (typeof index === 'undefined' || !cand.education[index]) throw createError(400, 'Invalid education index');
      cand.education[index].document = fileUrl;
    } else if (type === 'experience') {
      if (typeof index === 'undefined' || !cand.experience[index]) throw createError(400, 'Invalid experience index');
      cand.experience[index].document = fileUrl;
    } else if (type === 'salary') {
      cand.previousSalaryProof = fileUrl;
    } else {
      throw createError(400, 'Invalid upload type');
    }
    await cand.save();
    res.json({ success: true, message: 'Upload successful', fileUrl });
  } catch (err) {
    logger.error('uploadTestimonial error:', err);
    next(err);
  }
}

export async function getCandidateDraft(req, res, next) {
  try {
    const id = req.user.id;
    const draft = await findDraftByUser(id);
    if (!draft) {
      return res.json({
        success: true,
        data: {},
        meta: { version: 0, step: null, updatedAt: null }
      });
    }
    res.json({
      success: true,
      data: draft.data,
      meta: { version: draft.version, step: draft.step, updatedAt: draft.updatedAt }
    });
  } catch (err) {
    logger.error('getCandidateDraft error:', err);
    next(err);
  }
}

export async function saveCandidateDraft(req, res, next) {
  try {
    const id = req.user.id;
    const { data, step } = req.body;
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw createError(400, 'Draft data must be an object');
    }
    const draft = await upsertDraft(id, data, step);
    res.json({
      success: true,
      data: draft.data,
      meta: { version: draft.version, step: draft.step, updatedAt: draft.updatedAt }
    });
  } catch (err) {
    logger.error('saveCandidateDraft error:', err);
    next(err);
  }
}

export const getCandidateStatus = asyncHandler(async (req, res) => {
  const data = await candidateService.getCandidateStatus(req.user.id);
  res.json({ success: true, data });
});