import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Chip, Avatar, Tooltip } from '@mui/material';
import { Brightness4, Brightness7, LocalHospital, ExitToApp, Wifi, WifiOff } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ isConnected = true, onReconnect }) => {
  const { user, isAuthenticated, logoutUser, role } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: mode === 'dark' ? '#111827' : '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.08)', color: 'text.primary' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
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
          <Tooltip title={isConnected ? "Backend Server Online" : "Backend Offline - Click to Reconnect"}>
            <Chip
              icon={isConnected ? <Wifi sx={{ fontSize: '16px !important' }} /> : <WifiOff sx={{ fontSize: '16px !important' }} />}
              label={isConnected ? "Server Online" : "Offline / Reconnect"}
              color={isConnected ? "success" : "warning"}
              size="small"
              onClick={onReconnect}
              sx={{ fontWeight: 700, cursor: 'pointer' }}
            />
          </Tooltip>

          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7 sx={{ color: '#fbbf24' }} /> : <Brightness4 />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <Chip label={role} color={role === 'Administrator' ? 'secondary' : 'primary'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              <Button
                onClick={() => navigate('/settings/profile')}
                color="inherit"
                startIcon={
                  <Avatar src={user?.avatarUrl} sx={{ width: 28, height: 28, fontSize: 13, bgcolor: 'primary.main' }}>
                    {!user?.avatarUrl && (user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'D')}
                  </Avatar>
                }
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {user?.fullName || 'Practitioner Profile'}
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
