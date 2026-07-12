function successResponse(res, message, data = null, status = 200) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(status).json(body);
}

function errorResponse(res, message, details = null, status = 400) {
  const body = { success: false, message };
  if (details !== null) body.details = details;
  return res.status(status).json(body);
}

module.exports = {
  successResponse,
  errorResponse,
};
