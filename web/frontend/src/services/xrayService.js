import api from './api';

export const uploadXray = (formData) => {
  return api.post('/xray/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getXrayById = (id) => api.get(`/xray/${id}`);
