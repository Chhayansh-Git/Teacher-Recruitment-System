/**
 * morganLogger.js
 *
 * Centralised HTTP request logger using Morgan.
 * Streams into Winston for consistent log rotation.
 */

import morgan from 'morgan';
import logger from '../utils/logger.js';

/**
 * Combined Apache log format + Winston transport
 */
export default morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
});