// server/utils/usernameGenerator.js
import slugify from 'slugify';

export function generateUsername(schoolName) {
  const base = slugify(schoolName, { lower: true, strict: true });
  const suffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${base}-${suffix}`;
}