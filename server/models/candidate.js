// server/models/candidate.js

import mongoose from 'mongoose';
import formSchemas from '../config/formSchemas.js';

const { Schema } = mongoose;

const candidateTypes = ['teaching', 'nonTeaching'];
// FIX: Using standard hyphens to prevent validation errors from the frontend.
const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
const educationLevels = ['High School', 'Diploma', 'Bachelors', 'Masters', 'Doctorate', 'Other'];
const genderOptions = ['Male', 'Female', 'Other'];
const maritalStatuses = ['Single', 'Married', 'Other'];
const candidateStatuses = ['active', 'inactive', 'suspended', 'hired', 'rejected', 'deleted'];

const educationSchema = new Schema({
  level: { type: String, required: true, trim: true, enum: educationLevels },
  degree: { type: String, required: true, trim: true },
  specialization: { type: String, trim: true },
  university: { type: String, trim: true },
  passingYear: { type: Number, min: [1900, "Year too early"], max: [new Date().getFullYear(), "Year cannot be in future"] },
  grade: { type: String, trim: true },
  document: { type: String, trim: true }
}, { _id: false });

const experienceSchema = new Schema({
  role: { type: String, required: true, trim: true },
  subject: { type: String, trim: true },
  schoolName: { type: String, trim: true },
  location: { type: String, trim: true },
  from: { type: Date, required: true },
  to: { type: Date },
  salary: { type: Number, min: [0, "Salary must be ≥ 0"] },
  reasonForLeaving:{ type: String, trim: true },
  employmentType: { type: String, enum: { values: employmentTypes, message: "Invalid employment type" } },
  document: { type: String, trim: true }
}, { _id: false });

const candidateSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  gender: { type: String, enum: genderOptions, trim: true },
  dob: { type: Date, max: Date.now },
  maritalStatus:{ type: String, enum: maritalStatuses, trim:true },
  contact: { type: String, required: true, match: [/^\+?[0-9]{7,15}$/,'Invalid phone number'] },
  email: { type: String, required: true, lowercase:true, trim:true, match:[/\S+@\S+\.\S+/,'Invalid email'] },
  password: { type: String, required: true, select: false },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pinCode: { type: String, trim: true },
  type: { type: String, enum: candidateTypes, required: true },
  position: { type: String, required: true, trim: true },
  preferredLocations:{ type:[String], default: [] },
  education: { type:[educationSchema], default: [] },
  experience: { type:[experienceSchema], default: [] },
  previousSalary: { type:Number, min:0 },
  previousSalaryProof: { type:String, trim:true },
  expectedSalary: { type:Number, min:0 },
  languages: { type:[String], default: [] },
  communicationSkills: { type:String, trim:true },
  achievements: { type:String, trim:true },
  extraResponsibilities:{ type:[String], default: [] },
  status: { type: String, enum: candidateStatuses, default:'active' },
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  deactivatedUntil: { type: Date },
  deletedAt: { type: Date },
  isSuspended: { type: Boolean, default: false },
  adminNotes: { type: String, trim: true, default: '' },
}, { timestamps: true });

candidateSchema.pre('validate', function(next) {
  const { type, position } = this;
  if (type && position && !formSchemas[type]?.[position]) {
    return next(new Error(`Invalid position '${position}' for type '${type}'`));
  }
  next();
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

export default Candidate;
export { educationLevels, candidateTypes, employmentTypes, genderOptions, maritalStatuses, candidateStatuses };