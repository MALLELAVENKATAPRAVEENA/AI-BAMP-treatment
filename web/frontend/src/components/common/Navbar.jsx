import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Chip } from '@mui/material';
import { Brightness4, Brightness7, LocalHospital, AccountCircle, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, isAuthenticated, logoutUser, role } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: mode === 'dark' ? '#111827' : '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.08)', color: 'text.primary' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <LocalHospital sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ background: 'linear-gradient(135deg, #0f52ba, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI BAMP PREDICTOR
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Class III Malocclusion Outcome System
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7 sx={{ color: '#fbbf24' }} /> : <Brightness4 />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <Chip label={role} color={role === 'Administrator' ? 'secondary' : 'primary'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              <Button startIcon={<AccountCircle />} onClick={() => navigate('/settings/profile')} color="inherit">
                {user?.fullName || 'Doctor Profile'}
              </Button>
              <IconButton color="error" title="Sign Out" onClick={() => { logoutUser(); navigate('/login'); }}>
                <ExitToApp />
              </IconButton>
            </>
          ) : (
            <Button variant="contained" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
