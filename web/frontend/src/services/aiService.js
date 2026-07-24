import api from './api';

export const detectLandmarks = (data) => api.post('/ai/detect-landmarks', data);
export const calculateMeasurements = (data) => api.post('/ai/calculate-measurements', data);
export const predictBampOutcome = (data) => api.post('/ai/predict', data);
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getUsers = () => api.get('/users');
export const getAuditLogs = () => api.get('/audit-logs');
