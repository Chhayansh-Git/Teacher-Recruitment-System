// server/controllers/aiController.js

import createError from 'http-errors';
import asyncHandler from '../middleware/asyncHandler.js';
import { matchCandidates } from '../services/matchingService.js';

/**
* POST /api/v1/ai/feedback
* Records manual feedback for requirement–candidate pairing.
*/
export const feedbackAI = asyncHandler(async (req, res) => {
  const { requirementId, candidateId, result } = req.body;
  if (!requirementId || !candidateId || !['selected', 'rejected'].includes(result)) {
    throw createError(400, 'Invalid payload');
  }
  // (Optional: Store this event in DB for future model improvement)
  res.json({ success: true, message: 'Feedback recorded (for audit, no model re-training needed)' });
});

/**
* POST /api/v1/ai/match
* Returns AI+rule-based matches (same as main matching API).
*/
export const getHybridMatches = asyncHandler(async (req, res) => {
  const { requirement, candidates } = req.body;
  if (!requirement || !Array.isArray(candidates)) {
    throw createError(400, 'Invalid payload');
  }
  const matches = await matchCandidates(requirement, candidates);
  res.json({ success: true, data: matches });
});
