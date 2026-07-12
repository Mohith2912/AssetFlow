const { errorResponse } = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  return errorResponse(res, err.message || 'Internal Server Error', null, status);
}

module.exports = errorHandler;
