const jwt = require('../config/jwt');
const { sendError } = require('../utils/responseHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Authentication token required', 401);
  }

  const decoded = jwt.verifyToken(token);
  if (!decoded) {
    return sendError(res, 'Invalid or expired session token', 403);
  }

  req.user = decoded;
  next();
};

module.exports = {
  authenticateToken
};
