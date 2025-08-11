/**
 * qualificationTiers.js
 *
 * Central authority for academic-qualification levels.
 *  - Defines discrete tiers (1-6) and the strings that map to each.
 *  - Provides fast, O(1) utilities for comparison and validation.
 *  - Supports dynamic addition of new qualifications at runtime.
 *
 * ESM-only – no CommonJS dependencies.
 */

export const QUALIFICATION_TIERS = [
  {
    name: 'High School / Secondary',
    level: 1,
    qualifications: [
      '10th',
      '12th',
      'High School Diploma',
      'Secondary School Certificate'
    ]
  },
  {
    name: 'Diploma / Certificate',
    level: 2,
    qualifications: [
      'Diploma',
      'Certificate',
      'ITI',
      'Diploma in Early Childhood',
      'Diploma in Lab Tech'
    ]
  },
  {
    name: "Bachelor’s Degree",
    level: 3,
    qualifications: [
      'B.A.',
      'B.Sc.',
      'B.Com',
      'B.Ed',
      'B.Lib',
      'BCA',
      'BFA',
      'B.P.Ed',
      'B.Tech',
      'B.E.'
    ]
  },
  {
    name: "Master’s Degree",
    level: 4,
    qualifications: [
      'M.A.',
      'M.Sc.',
      'M.Com',
      'M.Ed',
      'M.Lib',
      'MCA',
      'MFA',
      'M.P.Ed',
      'M.Tech',
      'M.E.'
    ]
  },
  {
    name: 'Postgraduate Diploma / Advanced Certificate',
    level: 5,
    qualifications: [
      'PG Diploma',
      'PG Certificate',
      'Postgraduate Diploma in Business',
      'PG Diploma in Education'
    ]
  },
  {
    name: 'Doctorate / PhD',
    level: 6,
    qualifications: [
      'Ph.D.',
      'Doctor of Philosophy',
      'D.Phil',
      'Doctorate'
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Internal lookup map – built once, read many.                       */
/* ------------------------------------------------------------------ */
const qualificationToLevelMap = Object.freeze(
  QUALIFICATION_TIERS.reduce((acc, { level, qualifications }) => {
    qualifications.forEach(q => {
      acc[q.trim().toUpperCase()] = level;
    });
    return acc;
  }, {})
);

/* ================================================================== */
/* Helper API                                                          */
/* ================================================================== */

/**
 * Return numeric tier for a qualification string.
 * @param  {string} qualification
 * @return {number} 1-6 if recognised, else 0
 */
export function getQualificationLevel(qualification) {
  if (typeof qualification !== 'string') return 0;
  return qualificationToLevelMap[qualification.trim().toUpperCase()] ?? 0;
}

/**
 * Compare candidate vs required qualification.
 * @param  {string} candidateQual
 * @param  {string} requiredQual
 * @return {number} positive → over-qualified, 0 → exact, negative → under-qualified
 */
export function compareQualification(candidateQual, requiredQual) {
  return getQualificationLevel(candidateQual) - getQualificationLevel(requiredQual);
}

/**
 * Boolean check for qualification compliance.
 * @param  {string} candidateQual
 * @param  {string} requiredQual
 * @param  {Object} [options]
 * @param  {boolean} [options.allowOverqualified=true]
 * @return {boolean}
 */
export function isQualified(candidateQual, requiredQual, options = {}) {
  const diff = compareQualification(candidateQual, requiredQual);
  if (diff < 0) return false;
  if (!options.allowOverqualified && diff > 0) return false;
  return true;
}

/**
 * Return an alphabetically-sorted array of every recognised string.
 * Useful for dropdown population and debugging.
 * @return {string[]}
 */
export function listAllQualifications() {
  return Object.keys(qualificationToLevelMap).sort();
}

/**
 * Dynamically register a new qualification under an existing tier.
 * Throws if tierLevel is invalid.
 * @param {string} qualification
 * @param {number} tierLevel
 */
export function addQualification(qualification, tierLevel) {
  if (
    !Number.isInteger(tierLevel) ||
    tierLevel < 1 ||
    tierLevel > QUALIFICATION_TIERS.length
  ) {
    throw new Error(`Invalid tier level: ${tierLevel}`);
  }

  const key = qualification.trim().toUpperCase();
  qualificationToLevelMap[key] = tierLevel;

  const tier = QUALIFICATION_TIERS.find(t => t.level === tierLevel);
  if (tier && !tier.qualifications.includes(qualification)) {
    tier.qualifications.push(qualification);
  }
}

/**
 * Deep-clone the tier definitions to prevent accidental mutation.
 * @return {Array<{name:string,level:number,qualifications:string[]}>}
 */
export function getQualificationTiers() {
  return QUALIFICATION_TIERS.map(({ name, level, qualifications }) => ({
    name,
    level,
    qualifications: [...qualifications]
  }));
}

