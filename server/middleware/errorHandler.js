/**
 * errorHandler.js
 *
 * Centralised Express error handler.
 * Registered **after** all routes: `app.use(errorHandler)`
 */

import logger from '../utils/logger.js';

/**
 * Global error handler
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal Server Error';

  logger.error(`${req.method} ${req.originalUrl} → ${status}: ${err.message}`);
  if (err.stack) logger.error(err.stack);

  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    }
  });
}

/**
 * 404 Not Found handler
 */
export function notFound(req, res, next) {
  res.status(404).json({
    error: { message: 'Not Found' }
  });
}

export default errorHandler;