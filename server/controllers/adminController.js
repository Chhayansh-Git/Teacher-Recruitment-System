// server/controllers/adminController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Admin from '../models/admin.js';
import School from '../models/schools.js';
import Requirement from '../models/requirements.js';
import PushedCandidate from '../models/pushedCandidate.js';
import {auditLogger} from '../utils/auditLogger.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export async function inviteAdmin(req, res, next) {
  try {
    const { email, role = 'admin' } = req.body;
    if (await Admin.exists({ email })) {
      throw createError(409, 'Admin already exists');
    }
    const tempPw = Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(tempPw, 12);
    const admin = await Admin.create({ email, password: hash, role });
    auditLogger({
      userId: req.user.id,
      action: 'invite_admin',
      before: {},
      after: { adminId: admin._id, email },
      description: `Invited admin ${email}`
    });
    res.status(201).json({
      success: true,
      message: 'Sub-admin invited',
      data: { id: admin._id, email, tempPassword: tempPw }
    });
  } catch (err) {
    next(err);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;
    // Ensure 'role' is selected!
    const admin = await Admin.findOne({ email }).select('+password role');
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw createError(401, 'Invalid credentials');
    }
    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({
      success: true,
      data: { token, admin: { id: admin._id, email: admin.email, role: admin.role } }
    });
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const { id, email, role } = req.user;
    res.json({ success: true, data: { id, email, role, message: 'Admin dashboard access granted' } });
  } catch (err) {
    next(err);
  }
}

export async function getAllRequirements(req, res, next) {
  try {
    const reqs = await Requirement.find()
      .populate('school', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reqs });
  } catch (err) {
    next(err);
  }
}

export async function changeRequirementStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doc = await Requirement.findById(id);
    if (!doc) throw createError(404, 'Requirement not found');
    auditLogger({
      userId: req.user.id,
      action: 'change_requirement_status',
      before: { status: doc.status },
      after: { status },
      description: `Requirement ${id} status change`
    });
    doc.status = status;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function getAllSchools(req, res, next) {
  try {
    const schools = await School.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: schools });
  } catch (err) {
    next(err);
  }
}

export async function manuallyVerifySchool(req, res, next) {
  try {
    const { id } = req.params;
    const school = await School.findById(id);
    if (!school) throw createError(404, 'School not found');
    school.verified = true;
    await school.save();
    auditLogger({
      userId: req.user.id,
      action: 'verify_school',
      before: { verified: false },
      after: { verified: true },
      description: `Verified school ${id}`
    });
    res.json({ success: true, data: school });
  } catch (err) {
    next(err);
  }
}

export async function pushCandidatesToRequirement(req, res, next) {
  try {
    const { id } = req.params;
    const { candidateIds } = req.body;
    if (!Array.isArray(candidateIds) || !candidateIds.length) {
      throw createError(400, 'candidateIds must be a non-empty array');
    }
    const reqDoc = await Requirement.findById(id);
    if (!reqDoc) throw createError(404, 'Requirement not found');
    const before = { pushedCandidates: reqDoc.pushedCandidates || [] };
    reqDoc.pushedCandidates = [
      ...new Set([...(reqDoc.pushedCandidates || []), ...candidateIds])
    ];
    await reqDoc.save();
    auditLogger({
      userId: req.user.id,
      action: 'push_candidates_to_requirement',
      before,
      after: { pushedCandidates: reqDoc.pushedCandidates },
      description: `Pushed candidates ${candidateIds.join(', ')} to requirement ${id}`
    });
    res.json({ success: true, data: reqDoc });
  } catch (err) {
    next(err);
  }
}
