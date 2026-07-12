const { errorResponse } = require('../utils/apiResponse');

function requireRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient privileges', null, 403);
    }

    next();
  };
}

module.exports = requireRoles;
