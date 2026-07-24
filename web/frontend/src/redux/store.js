import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import patientReducer from './patientSlice';
import aiReducer from './aiSlice';
import reportReducer from './reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    ai: aiReducer,
    report: reportReducer,
  },
});
