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
    if (!requirement) throw createError(404, 'Requirement not found');

    const candidates = await Candidate.find({ status: 'active' }).lean();
    const matched = await matchCandidates(requirement, candidates, { limit: 50 });

    // Lightweight DTO for API
    const result = matched.map(({ candidate, score, aiScore, ruleScore }) => ({
      candidateId: candidate._id,
      fullName: candidate.fullName,
      email: candidate.email,
      type: candidate.type,
      position: candidate.position,
      score,
      aiScore,
      ruleScore,
      totalExperience: candidate.experience.reduce((sum, exp) => {
        if (!exp.fromPeriod) return sum;
        const from = new Date(exp.fromPeriod);
        const to = exp.toPeriod ? new Date(exp.toPeriod) : new Date();
        return sum + (to - from) / (1000 * 60 * 60 * 24 * 365.25);
      }, 0),
      qualificationLevel: Math.max(
        ...(candidate.education || []).map(e =>
          require('../config/qualificationTiers.js').getQualificationLevel(e.degree)
        ),
        0
      ),
      preferredLocations: candidate.preferredLocations
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
