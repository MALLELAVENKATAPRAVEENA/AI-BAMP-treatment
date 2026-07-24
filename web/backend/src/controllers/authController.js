const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 'Registration Successful', result, 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and Password are required', 400);
    }
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 'Login Successful', result);
  } catch (error) {
    if (error.message.includes('Password')) {
      return sendError(res, 'Invalid Password', 400);
    }
    if (error.message.includes('Not Found')) {
      return sendError(res, 'User Not Found', 404);
    }
    return sendError(res, error.message, 400);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);
    const result = await authService.forgotPassword(email);
    return sendSuccess(res, 'Password reset link sent to your email', result);
  } catch (error) {
    if (error.message.includes('Not Found')) {
      return sendError(res, 'User Not Found', 404);
    }
    return sendError(res, error.message, 400);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !newPassword) {
      return sendError(res, 'Email and New Password are required', 400);
    }
    const result = await authService.resetPassword(email, token, newPassword);
    return sendSuccess(res, 'Password Reset Successful', result);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
