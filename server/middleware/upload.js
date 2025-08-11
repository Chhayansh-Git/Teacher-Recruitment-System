// server/middleware/upload.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const testimonialsDir = path.resolve('public/uploads/testimonials');

// Ensure the 'testimonials' subdirectory exists on startup
if (!fs.existsSync(testimonialsDir)) {
  fs.mkdirSync(testimonialsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, testimonialsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const fname = `${Date.now()}-${Math.round(Math.random() * 10000)}${ext}`;
    cb(null, fname);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type'), false);
  } else {
    cb(null, true);
  }
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
