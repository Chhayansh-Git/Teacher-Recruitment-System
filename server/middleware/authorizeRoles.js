/**
* authorizeRoles.js
* Role-based access guard.
*/

import createError from 'http-errors';

/**
* Factory returning Express middleware
* @param {...string} allowedRoles
*/
export default function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(createError(401, 'Not authenticated'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(createError(403, 'Forbidden'));
    }
    next();
  };
}
