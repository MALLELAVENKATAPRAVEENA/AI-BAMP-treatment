import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

export const StatCard = ({ title, value, icon, subtitle, color = '#0f52ba' }) => {
  return (
    <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: color }} />
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ my: 0.5, color: 'text.primary' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};
