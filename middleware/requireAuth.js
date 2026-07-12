const jwt = require('jsonwebtoken');

const { errorResponse } = require('../utils/apiResponse');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization token required', null, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', null, 401);
  }
}

module.exports = requireAuth;
