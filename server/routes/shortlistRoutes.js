// server/routes/shortlistRoutes.js

import express from 'express';
import { upsertShortlist, getShortlists } from '../controllers/shortlistController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'school', 'super-admin'),
  upsertShortlist
);

router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'school', 'super-admin'),
  getShortlists
);

export default router;
