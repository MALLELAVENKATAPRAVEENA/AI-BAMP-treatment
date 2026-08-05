import React, { useState, useEffect, useCallback } from 'react';
import { Box, Fab, Tooltip, Alert, Button } from '@mui/material';
import { SmartToy, WifiOff, Refresh } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';
import api from '../services/api';

export const MainLayout = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkServerConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      await api.get('/health', { timeout: 3000 });
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkServerConnection();
    const interval = setInterval(checkServerConnection, 10000);
    return () => clearInterval(interval);
  }, [checkServerConnection]);


  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" position="relative">
      <Navbar isConnected={isConnected} onReconnect={checkServerConnection} />
      
      {!isConnected && (
        <Alert
          severity="warning"
          icon={<WifiOff />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={checkServerConnection}
              disabled={isChecking}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {isChecking ? 'Reconnecting...' : 'Reconnect Now'}
            </Button>
          }
          sx={{ borderRadius: 0, fontWeight: 600, bgcolor: '#fff7ed', color: '#c2410c', borderBottom: '1px solid #ffedd5' }}
        >
          Backend connection lost. Please ensure local backend server is running on http://localhost:5000.
        </Alert>
      )}

      <Box display="flex" flex={1}>
        <Sidebar />
        <Box component="main" flex={1} p={3} sx={{ overflowY: 'auto', bgcolor: 'background.default' }}>
          <Outlet />
          <Footer />
        </Box>
      </Box>

      {/* Floating AI Assistant Chat Button */}
      <Tooltip title="Open Unlimited AI Clinical Assistant Chat" placement="left">
        <Fab
          color="secondary"
          aria-label="ai-chat"
          onClick={() => navigate('/ai/chat')}
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            width: 60,
            height: 60,
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.45)',
            zIndex: 1200
          }}
        >
          <SmartToy sx={{ fontSize: 32, color: '#ffffff' }} />
        </Fab>
      </Tooltip>
    </Box>
  );
};

