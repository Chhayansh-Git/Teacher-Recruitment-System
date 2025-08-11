// seeder/index.js

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import seedSuperAdmin from './seedAdmin.js';
import School from '../models/schools.js';
import Candidate from '../models/candidate.js';
import Requirement from '../models/requirements.js';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

// ---- FIXED: Add all required fields for School ----
const sampleSchools = [
  {
    name: 'Greenfield High School',
    email: 'contact@greenfield.edu',
    password: 'School@123',
    verified: true,
    board: 'CBSE',
    schoolUpto: 'XII',
    contactNo: '+919988776655',
    address: '221B Baker Street, Delhi, India',
    strength: 1200,
    pincode: '110001',
    location: 'Delhi',
    affiliationNo: 'CBSE100001'
  },
  {
    name: 'Riverdale Academy',
    email: 'info@riverdale.edu',
    password: 'River@123',
    verified: true,
    board: 'ICSE',
    schoolUpto: 'X',
    contactNo: '+918877665544',
    address: '10 MG Road, Pune, India',
    strength: 900,
    pincode: '411001',
    location: 'Pune',
    affiliationNo: 'ICSE200002'
  }
];

// ---- Sample candidates (add more required fields as needed) ----
const sampleCandidates = [
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    type: 'teaching',
    position: 'Primary Teacher',
    password: 'John@123',
    contact: '+919912345678',
    address: 'Flat 5, Sunrise Apartments, Mumbai, Maharashtra'
  },
  {
    fullName: 'Emma Williams',
    email: 'emma@example.com',
    type: 'nonTeaching',
    position: 'Lab Technician',
    password: 'Emma@123',
    contact: '+919887766554',
    address: '21B College Street, Kolkata, West Bengal'
  }
];

// ---- Sample requirements ----
const sampleRequirements = [
  {
    title: 'Primary Teacher',
    teachingOrNonTeaching: 'Teaching',
    qualification: 'B.Ed',
    experience: 1,
    minExperience: 1,
    minQualification: 'B.Ed',
    gender: 'Any',
    noOfCandidates: 5
  },
  {
    title: 'Lab Technician',
    teachingOrNonTeaching: 'Non-Teaching',
    qualification: 'B.Sc',
    experience: 1,
    minExperience: 1,
    minQualification: 'B.Sc',
    gender: 'Any',
    noOfCandidates: 3
  }
];

const hash = (p) => bcrypt.hash(p, 12);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected.');

  await seedSuperAdmin();

  // ----- Seed Schools -----
  const schools = [];
  for (const s of sampleSchools) {
    let doc = await School.findOne({ email: s.email });
    if (!doc) {
      doc = await School.create({
        ...s,
        password: await hash(s.password)
      });
      console.log(' • School:', s.email);
    }
    schools.push(doc);
  }

  // ----- Seed Candidates -----
  for (const c of sampleCandidates) {
    if (!(await Candidate.exists({ email: c.email }))) {
      await Candidate.create({
        ...c,
        password: await hash(c.password)
      });
      console.log(' • Candidate:', c.email);
    }
  }

  // ----- Seed Requirements -----
  for (let i = 0; i < sampleRequirements.length; i++) {
    const req = sampleRequirements[i];
    const school = schools[i];
    if (!school) continue;
    const exists = await Requirement.findOne({
      school: school._id,
      title: req.title
    });
    if (!exists) {
      await Requirement.create({
        ...req,
        school: school._id
      });
      console.log(' • Requirement:', req.title);
    }
  }

  console.log('✅ Seeding complete.');
  process.exit(0);
}

// Only run when this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  seed().catch((err) => {
    console.error('Seeder error:', err);
    process.exit(1);
  });
}

export default seed;
