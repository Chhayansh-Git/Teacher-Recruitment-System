// server/controllers/interviewController.js

import createError from 'http-errors';
import Interview from '../models/interview.js';
import Candidate from '../models/candidate.js';
import School from '../models/schools.js';
import Requirement from '../models/requirements.js';
import Shortlist from '../models/shortlist.js';
import { sendEmail } from '../services/commService.js';

/** Schedule (or re-schedule) an interview */
export async function upsertInterview(req, res, next) {
  try {
    const { candidate, requirement, school, scheduledAt, mode, panel } = req.body;
    if (!candidate || !requirement || !school || !scheduledAt || !mode)
      throw createError(400, 'Missing required interview fields');

    // Must be shortlisted/invited/hired to be interviewable
    const sl = await Shortlist.findOne({
      candidate, requirement,
      status: { $in: ['shortlisted', 'invited', 'hired'] }
    });
    if (!sl)
      throw createError(400, 'Cannot schedule interview: candidate not shortlisted for this requirement');

    const isUpdate = Boolean(await Interview.findOne({ candidate, requirement }));

    const result = await Interview.findOneAndUpdate(
      { candidate, requirement },
      { $set: { school, scheduledAt, mode, panel: panel || [], status: 'scheduled' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Fetch docs for email
    const [candidateDoc, schoolDoc, reqDoc] = await Promise.all([
      Candidate.findById(candidate),
      School.findById(school),
      Requirement.findById(requirement)
    ]);

    if (candidateDoc && schoolDoc) {
      await sendEmail(
        isUpdate ? 'INTERVIEW_RESCHEDULED' : 'INTERVIEW_SCHEDULED',
        candidateDoc.email,
        {
          candidateName: candidateDoc.fullName,
          schoolName: schoolDoc.name,
          requirementTitle: reqDoc ? reqDoc.title : '',
          scheduledAt,
          mode,
          panel: (panel || []).join(', ')
        }
      );
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

/** Mark interview as completed, add feedback/score */
export async function completeInterview(req, res, next) {
  try {
    const { id } = req.params;
    const { feedback, score, status } = req.body;
    const interview = await Interview.findById(id);
    if (!interview) throw createError(404, 'Interview not found');
    interview.status = status || 'completed';
    if (feedback !== undefined) interview.feedback = feedback;
    if (score !== undefined) interview.score = score;
    await interview.save();

    // Fetch docs for email
    const [candidateDoc, schoolDoc, reqDoc] = await Promise.all([
      Candidate.findById(interview.candidate),
      School.findById(interview.school),
      Requirement.findById(interview.requirement)
    ]);
    if (candidateDoc && schoolDoc) {
      await sendEmail('INTERVIEW_RESULT', candidateDoc.email, {
        candidateName: candidateDoc.fullName,
        schoolName: schoolDoc.name,
        requirementTitle: reqDoc ? reqDoc.title : '',
        status: interview.status,
        feedback,
        score
      });
    }

    res.status(200).json({ success: true, data: interview });
  } catch (err) { next(err); }
}

/** Get all interviews for a requirement or candidate */
export async function getInterviews(req, res, next) {
  try {
    const { requirement, candidate } = req.query;
    const filter = {};
    if (requirement) filter.requirement = requirement;
    if (candidate) filter.candidate = candidate;
    const results = await Interview.find(filter)
      .populate('candidate', 'fullName email')
      .populate('requirement', 'title')
      .populate('school', 'name')
      .sort({ scheduledAt: -1 });
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
}
