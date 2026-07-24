import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import CssBaseline from '@mui/material/CssBaseline';
import './styles/global.css';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <CustomThemeProvider>
          <NotificationProvider>
            <CssBaseline />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </NotificationProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
