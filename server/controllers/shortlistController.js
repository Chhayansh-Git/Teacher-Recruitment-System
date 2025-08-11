// server/controllers/shortlistController.js

import createError from 'http-errors';
import Shortlist from '../models/shortlist.js';
import Candidate from '../models/candidate.js';
import School from '../models/schools.js';
import Requirement from '../models/requirements.js';
import Interview from '../models/interview.js';
import { sendEmail } from '../services/commService.js';

/** Add or update a shortlist/invite */
export async function upsertShortlist(req, res, next) {
  try {
    const { candidate, requirement, school, status, notes } = req.body;
    if (!candidate || !requirement || !school)
      throw createError(400, 'Missing required shortlist fields');

    // Block "leapfrog" to hired unless interview is completed
    if (status && status.toLowerCase() === 'hired') {
      const interview = await Interview.findOne({
        candidate, requirement, status: 'completed'
      });
      if (!interview)
        throw createError(400, 'Cannot hire candidate without completed interview');
    }

    const found = await Shortlist.findOneAndUpdate(
      { candidate, requirement },
      { $set: { school, status: status || 'shortlisted', notes } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Fetch candidate, school, and requirement for email context
    const [candidateDoc, schoolDoc, reqDoc] = await Promise.all([
      Candidate.findById(candidate),
      School.findById(school),
      Requirement.findById(requirement)
    ]);

    if (candidateDoc && schoolDoc) {
      let statusText = status || 'shortlisted';
      let emailData = {
        candidateName: candidateDoc.fullName,
        schoolName: schoolDoc.name,
        requirementTitle: reqDoc ? reqDoc.title : 'the position',
        status: statusText,
        notes
      };

      // Notify candidate on every shortlist status
      await sendEmail('SHORTLIST_STATUS_UPDATE', candidateDoc.email, emailData);

      // Notify school if candidate accepts, declines, withdraws, or is hired
      if (['accepted', 'declined', 'withdrawn', 'hired'].includes(statusText)) {
        await sendEmail('CANDIDATE_PIPELINE_STATUS', schoolDoc.email, emailData);
      }
    }

    res.status(200).json({ success: true, data: found });
  } catch (err) {
    next(err);
  }
}

/** Get all shortlists by requirement, candidate, or school */
export async function getShortlists(req, res, next) {
  try {
    const { requirement, candidate, school } = req.query;
    const filter = {};
    if (requirement) filter.requirement = requirement;
    if (candidate) filter.candidate = candidate;
    if (school) filter.school = school;
    const results = await Shortlist.find(filter)
      .populate('candidate', 'fullName email')
      .populate('requirement', 'title')
      .populate('school', 'name');
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
}
