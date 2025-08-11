// server/config/db.js

import mongoose from "mongoose";
import logger from "../utils/logger.js";
import seedSuperAdmin from "../seeder/seedAdmin.js";

/**
 * connectDB
 * Establishes MongoDB connection and auto‑seeds the super‑admin account.
 *
 * @param {string} uri – MongoDB connection string
 * @returns {Promise<mongoose.Connection>}
 */
export default function connectDB(uri) {
  return mongoose
    .connect(uri)
    .then(conn => {
      logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

      // ─────────────────────────────────────────────────
      // Auto‑seed super‑admin account from environment
      // ─────────────────────────────────────────────────
      mongoose.connection.once('open', async () => {
        try {
          await seedSuperAdmin();
        } catch (err) {
          logger.error("❌ Super‑admin seeding failed:", err);
        }
      });

      return conn;
    })
    .catch(err => {
      logger.error("❌ DB connection error:", err);
      process.exit(1);
    });
}
