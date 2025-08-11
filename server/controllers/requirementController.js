// server/controllers/requirementController.js

import createError from 'http-errors';
import { validationResult } from 'express-validator';
import Requirement from '../models/requirements.js';

/**
 * POST /api/v1/requirements (school only)
 */
export const postRequirement = async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return next(createError(400, errs.array().map(e => e.msg).join(', ')));
    }
    // Only school with registrationFeePaid allowed (see schoolController)
    // requirement.school will always be req.user.id (set at route/controller)
    const requirement = await Requirement.create({ ...req.body, school: req.user.id });
    res.status(201).json({ success: true, data: requirement });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/requirements (by school, optional archived flag)
 */
export const getSchoolRequirements = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const { archived } = req.query;
    const filter = { school: schoolId };
    if (archived === 'true') filter.archived = true;
    const reqs = await Requirement.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: reqs });
  } catch (err) {
    next(err);
  }
};
