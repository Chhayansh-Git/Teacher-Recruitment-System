// server/controllers/reportController.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import createError from "http-errors";
import handlebars from "handlebars";

import School from "../models/schools.js";
import Candidate from "../models/candidate.js";
import Requirement from "../models/requirements.js";
import PushedCandidate from "../models/pushedCandidate.js";
import { generatePdf } from "../utils/pdfGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/** GET /api/v1/reports/overview */
export const getOverview = async (req, res, next) => {
  try {
    const [schools, candidates, requirements, pushes] = await Promise.all([
      School.countDocuments(),
      Candidate.countDocuments(),
      Requirement.countDocuments(),
      PushedCandidate.countDocuments()
    ]);

    const pendingArr = await PushedCandidate.aggregate([
      { $unwind: "$candidates" },
      { $match: { "candidates.status": "pending" } },
      { $count: "total" }
    ]);
    const pendingInterviews = pendingArr[0]?.total || 0;

    res.json({
      success: true,
      data: { schools, candidates, requirements, pushes, pendingInterviews }
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/reports/time-series */
export const getTimeSeries = async (req, res, next) => {
  try {
    const now    = new Date();
    const labels = [...Array(6)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d.toLocaleString("default", { month: "short", year: "numeric" });
    });

    const aggregate = async Model => {
      const raw = await Model.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month:{ $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        }
      ]);
      return labels.map((_, idx) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
        const rec = raw.find(r => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1);
        return rec?.count || 0;
      });
    };

    const [candidateCounts, schoolCounts] = await Promise.all([
      aggregate(Candidate),
      aggregate(School)
    ]);

    res.json({ success: true, data: { labels, candidateCounts, schoolCounts } });
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/reports/metrics */
export const getPlacementMetrics = async (req, res, next) => {
  try {
    const [placedArr, avgArr] = await Promise.all([
      PushedCandidate.aggregate([
        { $unwind: "$candidates" },
        { $match: { "candidates.status": "selected" } },
        { $count: "total" }
      ]),
      PushedCandidate.aggregate([
        { $unwind: "$candidates" },
        { $match: { "candidates.status": "selected" } },
        {
          $project: {
            daysToFill: {
              $divide: [
                { $subtract: ["$candidates.updatedAt", "$pushedAt"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        { $group: { _id: null, avgDays: { $avg: "$daysToFill" } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        placed: placedArr[0]?.total || 0,
        avgDays: avgArr[0]?.avgDays || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/reports/download?type=overview|time-series */
export const downloadReportPdf = async (req, res, next) => {
  try {
    const type = req.query.type === "time-series" ? "time-series" : "overview";
    const templatePath = path.join(__dirname, "../reports/templates", `${type}.hbs`);
    const src = await fs.readFile(templatePath, "utf8").catch(() => {
      throw createError(500, `Template not found: ${type}`);
    });

    const template = handlebars.compile(src);
    const data     = type === "overview"
      ? (await getOverview(req, res, next)).data
      : (await getTimeSeries(req, res, next)).data;

    const html      = template(data);
    const pdfBuffer = await generatePdf(html);

    res
      .status(200)
      .set("Content-Type", "application/pdf")
      .set("Content-Disposition", `attachment; filename="${type}.pdf"`)
      .send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
