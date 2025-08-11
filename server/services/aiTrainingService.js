// server/services/aiTrainingService.js
import PushedCandidate from '../models/pushedCandidate.js';
import Requirement from '../models/requirements.js';
import Candidate from '../models/candidate.js';

export async function trainModel() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const tuples = await PushedCandidate.aggregate([
    { $match: { pushedAt: { $gte: thirtyDaysAgo } } },
    { $unwind: '$candidates' },
    { $match: { 'candidates.status': { $in: ['selected', 'rejected'] } } },
    {
      $lookup: {
        from: 'requirements',
        localField: 'requirement',
        foreignField: '_id',
        as: 'req'
      }
    },
    {
      $lookup: {
        from: 'candidates',
        localField: 'candidates.candidate',
        foreignField: '_id',
        as: 'cand'
      }
    },
    {
      $project: {
        requirement: { $arrayElemAt: ['$req', 0] },
        candidate: { $arrayElemAt: ['$cand', 0] },
        result: '$candidates.status'
      }
    }
  ]);

  console.log(`[AITraining] Training on ${tuples.length} tuples`);
  // TODO: plug real ML endpoint
  return { success: true, count: tuples.length };
}