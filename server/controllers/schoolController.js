// server/controllers/schoolController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import logger from '../utils/logger.js';
import School from '../models/schools.js';
import Requirement from '../models/requirements.js';
import { sendEmail } from '../services/commService.js';
import { sendOTP as sendSMS } from '../services/smsService.js';
import { generateUsername } from '../utils/usernameGenerator.js';
import { auditLogger } from '../utils/auditLogger.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRES_IN || '1d';
const OTP_EXPIRY_MINUTES = 10;

// SCHOOL Registration
export const registerSchool = async (req, res, next) => {
  try {
    const {
      name, affiliationNo, address, location, pincode, contactNo, email,
      website, principalName, directorName, strength, schoolUpto, board, whatsappNumber,
    } = req.body;

    if (await School.exists({ email })) throw createError(409, 'Email already registered');

    // --- FIX: Correctly determine if a fee is required based on the rule ---
    const schoolCount = await School.countDocuments();
    const feeIsRequired = schoolCount >= 200;
    // --------------------------------------------------------------------

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    const school = await School.create({
      name, affiliationNo, address, location, pincode, contactNo, email, website,
      principalName, directorName, strength, schoolUpto, board, whatsappNumber,
      acceptedTerms: true,
      verified: false,
      verifiedByAdmin: false,
      // --- FIX: Set the correct flags based on the rule ---
      feeRequired: feeIsRequired,
      registrationFeePaid: !feeIsRequired, // If fee is not required, mark as paid by default
      // ----------------------------------------------------
      otp,
      otpExpiry,
    });

    try {
      await Promise.all([
        sendEmail('OTP_VERIFICATION', email, { name, otp }),
        sendSMS(contactNo, otp),
      ]);
    } catch (err) {
      logger.warn('OTP dispatch failed:', err.message);
    }

    res.status(201).json({
      success: true,
      message: `Registration initiated. ${!feeIsRequired ? 'No registration fee required as part of our initial launch offer.' : 'Registration fee is required to continue.'} OTP sent via email & SMS.`,
      schoolId: school._id,
    });
  } catch (err) {
    next(err);
  }
};

// SCHOOL OTP Verification
export const verifySchoolOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const school = await School.findOne({ email }).select('+otp +otpExpiry');
    if (!school) throw createError(404, 'School not found');
    if (school.verified) throw createError(400, 'Account already verified');
    if (school.otp !== otp || Date.now() > school.otpExpiry) {
      logger.warn(`OTP mismatch for ${email}: stored=${school.otp} received=${otp}`);
      throw createError(400, 'Invalid or expired OTP');
    }

    const username = generateUsername(school.name);
    const tempPassword = Math.random().toString(36).slice(-10);
    school.username = username;
    school.password = await bcrypt.hash(tempPassword, 12);
    school.verified = true;
    school.credentialsSent = true;
    school.otp = undefined;
    school.otpExpiry = undefined;
    await school.save();

    try {
      await sendEmail('INITIAL_CREDENTIALS', school.email, {
        name: school.name, username, tempPassword,
      });
    } catch (err) {
      logger.warn('Credential email failed:', err.message);
    }

    auditLogger({
      userId: school._id, action: 'verify_school_otp', before: {}, after: { verified: true },
    });

    res.status(200).json({
      success: true,
      message: 'Verification successful. Credentials generated.',
      data: { username, tempPassword },
    });
  } catch (err) {
    next(err);
  }
};

// SCHOOL: Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const school = await School.findOne({ email });
    if (!school) throw createError(404, 'School not found');
    if (school.verified) throw createError(400, 'Already verified');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
    school.otp = otp;
    school.otpExpiry = otpExpiry;
    await school.save();

    try {
      await Promise.all([
        sendEmail('OTP_VERIFICATION', school.email, { name: school.name, otp }),
        sendSMS(school.contactNo, otp),
      ]);
    } catch (err) {
      logger.warn('Resend OTP failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent to email and phone.',
    });
  } catch (err) {
    next(err);
  }
};

// SCHOOL Login (username/email)
export const loginSchool = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    let school = await School.findOne({ username: login }).select('+password');
    if (!school) {
      school = await School.findOne({ email: login.toLowerCase() }).select('+password');
    }
    if (!school || !school.verified)
      throw createError(401, 'Invalid credentials or not verified');
    const match = await bcrypt.compare(password, school.password);
    if (!match) throw createError(401, 'Invalid credentials');
    const token = jwt.sign(
      { id: school._id, role: 'school', email: school.email },
      JWT_SECRET, { expiresIn: JWT_EXPIRY },
    );
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, school: { id: school._id, username: school.username, email: school.email } },
    });
  } catch (err) {
    next(err);
  }
};

// SCHOOL Profile Get
export const getSchoolProfile = async (req, res, next) => {
  try {
    const school = await School.findById(req.user.id).select('-password');
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json({ success: true, data: school });
  } catch (err) {
    next(err);
  }
};

// SCHOOL Profile Update (ownership check + email check)
export const updateSchoolProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'address', 'location', 'pincode', 'contactNo', 'website',
      'principalName', 'directorName', 'strength', 'schoolUpto', 'board',
      'affiliationNo', 'whatsappNumber',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields found in request' });
    }
    const school = await School.findById(req.user.id);
    if (!school) return res.status(404).json({ error: 'School not found' });
    const before = { ...school.toObject() };
    Object.assign(school, updates);
    await school.save();

    auditLogger({
      userId: req.user.id,
      action: 'update_school_profile',
      before,
      after: updates,
      description: `Profile fields updated: ${Object.keys(updates).join(', ')}`
    });

    if (school.email) {
      await sendEmail('PROFILE_UPDATED', school.email, {
        schoolName: school.name,
        updatedFields: Object.keys(updates).join(', '),
      });
    } else {
      logger.warn('Profile update email skipped: school.email missing.');
    }
    res.json({ success: true, data: school });
  } catch (err) {
    next(err);
  }
};

// POST Requirement (Only allow posting if registrationFeePaid: true)
export const postRequirement = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const school = await School.findById(schoolId);

    // --- FIX: This check is now more intelligent. ---
    // It only blocks if a fee is required AND it has not been paid.
    if (school.feeRequired && !school.registrationFeePaid) {
      return res.status(402).json({
        success: false, 
        error: 'Registration fee required before posting requirements.',
      });
    }
    // ----------------------------------------------

    const requirement = await Requirement.create({ ...req.body, school: schoolId });
    auditLogger({
      userId: schoolId,
      action: 'post_requirement',
      before: {},
      after: { requirement: requirement._id },
      description: `School ${schoolId} posted requirement ${requirement._id}`
    });

    if (school.email) {
      await sendEmail('REQUIREMENT_POSTED', school.email, {
        schoolName: school.name,
        requirementTitle: requirement.title,
      });
    } else {
      logger.warn('Requirement posted email skipped: school.email missing.');
    }
    res.status(201).json({ success: true, message: 'Requirement posted', data: requirement });
  } catch (err) {
    next(err);
  }
};

// GET all requirements for school
export const getSchoolRequirements = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const { archived } = req.query;
    const filter = { school: schoolId };
    if (archived === 'true' || archived === true) filter.archived = true;
    const reqs = await Requirement.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reqs });
  } catch (err) {
    next(err);
  }
};

// GET a single requirement by ID (ownership enforced)
export const getRequirementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reqDoc = await Requirement.findOne({ _id: id, school: req.user.id });
    if (!reqDoc) return res.status(404).json({ error: 'Requirement not found or unauthorized' });
    res.json({ success: true, data: reqDoc });
  } catch (err) {
    next(err);
  }
};

// UPDATE requirement (ownership, audit, email, email check added)
export const updateRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reqDoc = await Requirement.findOne({ _id: id, school: req.user.id });
    if (!reqDoc) throw createError(404, 'Requirement not found or unauthorized');
    const before = { ...reqDoc.toObject() };
    Object.assign(reqDoc, req.body);
    await reqDoc.save();
    auditLogger({
      userId: req.user.id,
      action: 'update_requirement',
      before,
      after: reqDoc.toObject(),
      description: `Requirement ${id} updated`,
    });
    const school = await School.findById(reqDoc.school);
    if (school?.email) {
      await sendEmail('REQUIREMENT_UPDATED', school.email, {
        schoolName: school.name,
        requirementTitle: reqDoc.title,
        updatedFields: Object.keys(req.body).join(', '),
      });
    } else {
      logger.warn('Requirement updated email skipped: school.email missing.');
    }
    res.status(200).json({ success: true, message: 'Requirement updated', data: reqDoc });
  } catch (err) {
    next(err);
  }
};

// DELETE requirement (ownership, audit, email, email check added)
export const deleteRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Requirement.findOneAndDelete({ _id: id, school: req.user.id });
    if (!deleted) throw createError(404, 'Requirement not found or unauthorized');
    auditLogger({
      userId: req.user.id,
      action: 'delete_requirement',
      before: { deleted },
      after: {},
      description: `School deleted requirement ${id}`,
    });
    const school = await School.findById(deleted.school);
    if (school?.email) {
      await sendEmail('REQUIREMENT_DELETED', school.email, {
        schoolName: school.name,
        requirementTitle: deleted.title,
      });
    } else {
      logger.warn('Requirement deleted email skipped: school.email missing.');
    }
    res.status(200).json({ success: true, message: 'Requirement deleted' });
  } catch (err) {
    next(err);
  }
};