// server/services/candidateService.js

import mongoose from 'mongoose';
import PushedCandidate from '../models/pushedCandidate.js';
import Shortlist from '../models/shortlist.js';
import Interview from '../models/interview.js';
import Requirement from '../models/requirements.js';
import School from '../models/schools.js';

/**
 * Returns an all-up candidate dashboard snapshot:
 * - Number of pushes (distinct requirements)
 * - Shortlist breakdown (by status)
 * - Interview breakdown (by status)
 * - Recent events for dashboard display
 */
export async function getCandidateDashboard(candidateId) {
  const cid = new mongoose.Types.ObjectId(candidateId);

  // Pushes
  const pushes = await PushedCandidate.find({ 'candidates.candidate': cid })
    .populate('requirement', 'title school')
    .lean();

  // Shortlists
  const shortlistDocs = await Shortlist.find({ candidate: cid })
    .populate('requirement', 'title school')
    .lean();

  // Interviews
  const interviews = await Interview.find({ candidate: cid })
    .populate('requirement', 'title school')
    .lean();

  // Shortlist status breakdown
  const shortlistStatusCounts = {};
  for (const s of shortlistDocs) {
    const status = (s.status || 'shortlisted').toLowerCase();
    shortlistStatusCounts[status] = (shortlistStatusCounts[status] || 0) + 1;
  }

  // Interview status breakdown
  const interviewStatusCounts = {};
  let mostRecentInterview = null;
  for (const i of interviews) {
    const status = (i.status || 'scheduled').toLowerCase();
    interviewStatusCounts[status] = (interviewStatusCounts[status] || 0) + 1;
    if (!mostRecentInterview || (i.scheduledAt && i.scheduledAt > mostRecentInterview.scheduledAt)) {
      mostRecentInterview = i;
    }
  }

  // Offer counts
  const hired = shortlistDocs.filter(s => s.status === 'hired').length;
  const rejected = shortlistDocs.filter(s => s.status === 'rejected').length;

  // Last 5 recent events
  const events = [
    ...shortlistDocs.map(s => ({
      type: 'shortlist',
      status: s.status,
      requirementTitle: s.requirement?.title || '',
      schoolId: s.requirement?.school,
      updatedAt: s.updatedAt
    })),
    ...interviews.map(i => ({
      type: 'interview',
      status: i.status,
      requirementTitle: i.requirement?.title || '',
      schoolId: i.requirement?.school,
      updatedAt: i.updatedAt
    }))
  ].filter(ev => ev.requirementTitle)
   .sort((a, b) => b.updatedAt - a.updatedAt)
   .slice(0, 5);

  // Map school IDs to names
  const schoolIds = [
    ...new Set(events.filter(ev => ev.schoolId).map(ev => ev.schoolId?.toString()))
  ].filter(Boolean);
  let schoolNameMap = {};
  if (schoolIds.length) {
    const schools = await School.find({ _id: { $in: schoolIds } }, { name: 1 });
    schoolNameMap = Object.fromEntries(schools.map(s => [s._id.toString(), s.name]));
  }

  return {
    pushes: pushes.length,
    totalRequirements: pushes.length,
    shortlist: {
      total: shortlistDocs.length,
      byStatus: shortlistStatusCounts
    },
    interviews: {
      total: interviews.length,
      byStatus: interviewStatusCounts,
      recent: mostRecentInterview ? {
        requirementTitle: mostRecentInterview.requirement?.title || '',
        status: mostRecentInterview.status,
        scheduledAt: mostRecentInterview.scheduledAt
      } : null
    },
    offers: {
      hired,
      rejected
    },
    recentEvents: events.map(ev => ({
      type: ev.type,
      status: ev.status,
      requirementTitle: ev.requirementTitle,
      school: ev.schoolId ? (schoolNameMap[ev.schoolId?.toString()] || null) : null,
      updatedAt: ev.updatedAt
    }))
  };
}
