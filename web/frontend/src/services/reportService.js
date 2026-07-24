import api from './api';

export const generateReport = (data) => api.post('/report/generate', data);
