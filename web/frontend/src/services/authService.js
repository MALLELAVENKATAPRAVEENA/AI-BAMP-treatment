import api from './api';

export const register = (userData) => api.post('/auth/register', userData);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const resendOTP = (data) => api.post('/auth/resend-otp', data);
export const login = (credentials) => api.post('/auth/login', credentials);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
