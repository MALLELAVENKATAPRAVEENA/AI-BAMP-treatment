import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingSpinner = ({ message = 'Processing AI Analysis...' }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
      <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {message}
      </Typography>
    </Box>
  );
};
