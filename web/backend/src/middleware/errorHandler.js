const { sendError } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'Invalid or expired credentials', 401);
  }

  if (err.message && err.message.includes('Invalid file format')) {
    return sendError(res, err.message, 400);
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  return sendError(res, err.message || 'Internal Server Error', statusCode);
};

module.exports = errorHandler;
