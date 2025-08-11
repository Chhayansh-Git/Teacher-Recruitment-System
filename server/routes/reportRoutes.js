/**
 * reportRoutes.js
 *
 * Admin-only analytics & PDF export endpoints.
 *  – Overview counts
 *  – Time-series (6 months)
 *  – Placement metrics
 *  – PDF generation
 *
 * Protected by: verifyToken + authorizeRoles('admin')
 */

import express from 'express';
import { query } from 'express-validator';
import createError from 'http-errors';

import {
  getOverview,
  getTimeSeries,
  downloadReportPdf,
  getPlacementMetrics
} from '../controllers/reportController.js'; // <-- include new controller

import { verifyToken } from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/authorizeRoles.js';

const router = express.Router();

/* ------------------------------------------------------------------ */
/*  Global guard                                                        */
/* ------------------------------------------------------------------ */
router.use(verifyToken, authorizeRoles('admin', 'super-admin'));

/* ================================================================== */
/*  Routes                                                              */
/* ================================================================== */

/**
 * GET /api/v1/reports/overview
 */
router.get('/overview', getOverview);

/**
 * GET /api/v1/reports/time-series
 */
router.get('/time-series', getTimeSeries);

/**
 * GET /api/v1/reports/placement-metrics   (NEW)
 */
router.get('/placement-metrics', getPlacementMetrics);

/**
 * GET /api/v1/reports/pdf?type=overview|time-series
 */
router.get(
  '/pdf',
  [
    query('type')
      .optional()
      .isIn(['overview', 'time-series'])
      .withMessage('type must be overview or time-series'),
    (req, res, next) => {
      const errs = require('express-validator').validationResult(req);
      if (!errs.isEmpty()) {
        return next(
          createError(400, errs.array().map((e) => e.msg).join(', '))
        );
      }
      next();
    }
  ],
  downloadReportPdf
);

export default router;