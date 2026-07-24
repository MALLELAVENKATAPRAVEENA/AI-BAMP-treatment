import React from 'react';
import { Box, Fab, Tooltip } from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';

export const MainLayout = () => {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" position="relative">
      <Navbar />
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
