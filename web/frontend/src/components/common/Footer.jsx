import React from 'react';
import { Box, Typography } from '@mui/material';

export const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 2, px: 3, mt: 'auto', borderTop: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        AI-Based Predictor for BAMP in Class III Skeletal Malocclusion &copy; 2026. Confidential Healthcare AI Platform.
      </Typography>
    </Box>
  );
};
