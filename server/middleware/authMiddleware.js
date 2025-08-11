// server/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import createError from 'http-errors';

/**
* extractToken
* @param {string} header
* @returns {string|null}
*/
function extractToken(header) {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
}

/**
* verifyToken
* Middleware: ensures a valid JWT and populates req.user
*/
export const verifyToken = async (req, _res, next) => {
  const token = extractToken(req.headers.authorization);
  if (!token) return next(createError(401, 'Authentication token missing'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email
    };
    next();
  } catch (err) {
    return next(createError(401, 'Invalid or expired token'));
  }
};
