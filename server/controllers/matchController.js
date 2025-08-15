// server/controllers/matchController.js

import createError from 'http-errors';
import Requirement from '../models/requirements.js';
import Candidate from '../models/candidate.js';
import { matchCandidates } from '../services/matchingService.js';

/**
* GET /api/v1/admin/match/:requirementId
* Returns top 50 scored candidates for the given requirement.
*/
export const matchCandidatesToRequirement = async (req, res, next) => {
  try {
    const { requirementId } = req.params;
    const requirement = await Requirement.findById(requirementId)
      .populate('school', 'city state location');
      
    if (!requirement) {
        throw createError(404, 'Requirement not found');
    }

    // --- FIX: Fetch full Mongoose documents without .lean() ---
    // This ensures all sub-documents like 'education' and 'experience' are fully loaded.
    const candidates = await Candidate.find({ status: 'active' });
    
    const matched = await matchCandidates(requirement, candidates, { limit: 50 });

    // The service now returns the data in the perfect format for the frontend.
    res.json({ success: true, data: matched });
    
  } catch (err) {
    next(err);
  }
};