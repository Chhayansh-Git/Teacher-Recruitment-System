/**
 * formSchemas.js
 *
 * Single source of truth for candidate-registration fields.
 * This is shared between the frontend and backend.
 */

const formSchemas = {
  teaching: {
    'KG Teacher': [],
    'Primary Teacher': [],
    'TGT (Trained Graduate Teacher)': [],
    'PGT (Post Graduate Teacher)': [],
    'Special Educator': [],
    'Physical Education Teacher': [],
    'Art & Craft Teacher': [],
    'Music Teacher': []
  },
  nonTeaching: {
    'Librarian': [],
    'Lab Technician': [],
    'Clerk / Office Assistant': [],
    'Receptionist': [],
    'IT Support Staff': [],
    'Accountant': [],
    'Security Staff': [],
    'Housekeeping Staff': []
  }
};

// --- FIX: Add and export the candidate statuses array ---
const candidateStatuses = ['active', 'inactive', 'suspended', 'hired', 'rejected', 'deleted'];

export default formSchemas;

export { candidateStatuses };