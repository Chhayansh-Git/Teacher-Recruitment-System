// server/controllers/pushController.js

import mongoose from 'mongoose';
import createError from 'http-errors';
import logger from '../utils/logger.js';
import PushedCandidate from '../models/pushedCandidate.js';
import Requirement from '../models/requirements.js';
import Candidate from '../models/candidate.js';
import { sendEmail } from '../services/commService.js';
import { auditLogger } from '../utils/auditLogger.js';

/** POST /api/v1/push - Push candidates to a requirement (admin only) */
export const pushCandidates = async (req, res, next) => {
  // ... (This function remains unchanged)
  try {
    const { requirementId, candidates } = req.body;

    if (!mongoose.isValidObjectId(requirementId)) throw createError(400, 'Invalid requirementId');
    if (!Array.isArray(candidates) || !candidates.length) throw createError(400, 'Candidates array is required');

    const requirement = await Requirement.findById(requirementId).populate('school', 'name email');
    if (!requirement) throw createError(404, 'Requirement not found');

    const ids = candidates.map((c) => c.id);

    const alreadyPushed = await PushedCandidate.findOne({
      requirement: requirementId,
      'candidates.candidate': { $in: ids }
    });
    if (alreadyPushed) throw createError(409, 'One or more candidates already pushed to this requirement');

    const validCount = await Candidate.countDocuments({ _id: { $in: ids } });
    if (validCount !== ids.length) throw createError(400, 'One or more candidate IDs invalid');

    const pushed = await PushedCandidate.create({
      requirement: requirement._id,
      school: requirement.school._id,
      candidates: candidates.map((c) => ({
        candidate: c.id,
        score: c.score
      }))
    });

    auditLogger({
      userId: req.user.id,
      action: 'push_candidates',
      before: {},
      after: { requirementId, candidateIds: ids },
      description: `${ids.length} candidates pushed to requirement ${requirementId}`
    });
    logger.info(`Pushed ${ids.length} candidates to requirement ${requirementId}`);

    await sendEmail(
      'CANDIDATES_PUSHED',
      requirement.school.email,
      {
        schoolName: requirement.school.name,
        requirementTitle: requirement.title,
        count: ids.length
      }
    );

    res.status(201).json({ success: true, data: pushed });
  } catch (err) {
    logger.error('pushCandidates error:', err);
    next(err);
  }
};

/** GET /api/v1/push - List all pushes (for Admin) or filtered pushes (for School) */
export const getAllPushedCandidates = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { requirementId } = req.query;

    // --- THIS LOGIC IS STILL REQUIRED ---
    // Create a filter object. If the user is a school, it will be pre-filled
    // with their ID to ensure they only see their own data.
    const filter = {};
    if (role === 'school') {
        filter.school = userId;
    }
    
    // If a specific requirementId is passed in the query, add it to the filter.
    if (requirementId) {
        if (!mongoose.isValidObjectId(requirementId)) throw createError(400, 'Invalid requirementId');
        filter.requirement = requirementId;
    }
    // ----------------------------------

    const data = await PushedCandidate.find(filter) // The filter is applied here
      .populate('requirement', 'title')
      .populate('school', 'name')
      .populate('candidates.candidate', 'fullName email contact position experience'); // Added more fields
      
    res.json({ success: true, data });
  } catch (err) {
    logger.error('getAllPushedCandidates error:', err);
    next(err);
  }
};