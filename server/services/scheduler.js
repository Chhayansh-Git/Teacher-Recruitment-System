// server/services/scheduler.js

import cron from 'node-cron';
import Candidate from '../models/candidate.js';
import logger from '../utils/logger.js';

export function startScheduler() {
  // 1. Suspend inactive candidates after 1 year
  cron.schedule('0 0 * * *', async () => {
    try {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      const res = await Candidate.updateMany(
        { status: 'inactive', updatedAt: { $lt: cutoff } },
        { status: 'suspended' }
      );
      logger.info(`Scheduler: suspended ${res.modifiedCount} candidates`);
    } catch (err) {
      logger.error('Scheduler suspend error:', err);
    }
  });

  // 2. Re-activate candidates after 1-year deactivation
  cron.schedule('0 1 * * *', async () => {
    try {
      const res = await Candidate.updateMany(
        { deactivatedUntil: { $lte: new Date() } },
        { $unset: { deactivatedUntil: 1 }, $set: { status: 'active' } }
      );
      logger.info(`Scheduler: reactivated ${res.modifiedCount} candidates`);
    } catch (err) {
      logger.error('Scheduler reactivate error:', err);
    }
  });

  // (Remove notification cleanup - not needed!)
  // Add: file cleanup or other housekeep jobs here
}
