import { createTheme } from '@mui/material/styles';

export const getCustomTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#0f52ba', // Deep Sapphire Blue
      light: '#3b82f6',
      dark: '#1e3a8a',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0d9488', // Cyan Teal Accent
      light: '#14b8a6',
      dark: '#0f766e',
      contrastText: '#ffffff'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626'
    },
    background: {
      default: mode === 'dark' ? '#0b0f19' : '#f8fafc',
      paper: mode === 'dark' ? '#111827' : '#ffffff'
    },
    text: {
      primary: mode === 'dark' ? '#f3f4f6' : '#0f172a',
      secondary: mode === 'dark' ? '#9ca3af' : '#475569'
    }
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(15, 82, 186, 0.25)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(15, 23, 42, 0.06)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)'
        }
      }
    }
  }
});
