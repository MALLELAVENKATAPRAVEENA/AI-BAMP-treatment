import React from 'react';
import { Box, Paper, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0d9488 100%)',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};
