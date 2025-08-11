// seeder/seedAdmin.js

import bcrypt from 'bcryptjs';
import Admin from '../models/admin.js';

/**
 * Seeds a super-admin account if not already present.
 * Uses env vars SUPER_ADMIN_EMAIL and SUPER_ADMIN_PW.
 */
export default async function seedSuperAdmin() {
  const { SUPER_ADMIN_EMAIL: email, SUPER_ADMIN_PW: pw } = process.env;
  if (!email || !pw) {
    console.warn('⚠️ SUPER_ADMIN_EMAIL or PW missing; skipping super-admin seed');
    return;
  }
  try {
    const exists = await Admin.exists({ email });
    if (exists) {
      console.log(`✅ Super‑admin already seeded: ${email}`);
      return;
    }
    const hashed = await bcrypt.hash(pw, 12);
    await Admin.create({
      fullName: 'Super Admin',
      email,
      password: hashed,
      role: 'super-admin',
    });
    console.log(`✅ Super‑admin created: ${email}`);
  } catch (err) {
    if (err.code === 11000) {
      console.log(`✅ Super‑admin already present (duplicate race): ${email}`);
    } else {
      console.error('❌ Super‑admin seeding failed:', err);
    }
  }
}
