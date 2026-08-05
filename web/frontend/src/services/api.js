import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bamp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An error occurred while connecting to the service.';
    if (error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      message = 'Cloud Sync Mode Active (Backend API Offline)';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Connection Timed Out. Retrying...';
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);


export default api;
