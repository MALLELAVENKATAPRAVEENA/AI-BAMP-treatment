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
      return sendError(res, 'User Account Not Found', 404);
    }
    return sendError(res, error.message, 400);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);
    const result = await authService.requestPasswordReset(email);
    return sendSuccess(res, result.message, result);
  } catch (error) {
    if (error.message.includes('Not Found')) {
      return sendError(res, 'User Account Not Found', 404);
    }
    return sendError(res, error.message, 400);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, otpCode } = req.body;
    const code = otp || otpCode;
    if (!email || !code) {
      return sendError(res, 'Email and 6-digit OTP code are required', 400);
    }
    const result = await authService.verifyPasswordResetOtp(email, code);
    return sendSuccess(res, 'OTP verified successfully.', result);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, otpCode, token, newPassword } = req.body;
    const code = otp || otpCode || token || 'email-otp-verified';
    if (!email || !newPassword) {
      return sendError(res, 'Email and New Password are required', 400);
    }
    const result = await authService.confirmPasswordReset(email, code, newPassword);
    return sendSuccess(res, 'Password Reset Successful', result);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword
};
