const { errorResponse } = require('../utils/apiResponse');

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    if (req.user.role !== requiredRole) {
      return errorResponse(res, 'Insufficient privileges', null, 403);
    }

    next();
  };
}

module.exports = requireRole;
