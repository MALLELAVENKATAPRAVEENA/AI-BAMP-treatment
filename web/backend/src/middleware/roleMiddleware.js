const { sendError } = require('../utils/responseHandler');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user', 401);
    }

    const userRole = req.user.role;
    if (userRole === 'Administrator' || allowedRoles.includes(userRole)) {
      return next();
    }

    return sendError(res, `Access denied. Requires role: [${allowedRoles.join(', ')}]`, 403);
  };
};

module.exports = {
  authorizeRoles
};
