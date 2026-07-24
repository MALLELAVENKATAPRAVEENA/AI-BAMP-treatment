const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }
  next();
};

module.exports = {
  handleValidationErrors
};
