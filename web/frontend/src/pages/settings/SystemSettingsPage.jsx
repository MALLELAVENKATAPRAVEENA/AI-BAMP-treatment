import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import { Header } from '../../components/common/Header';

export const SystemSettingsPage = () => {
  return (
    <Box>
      <Header
        title="System Environment Configuration"
        subtitle="Manage Firebase connection strings, AI microservice routes, and PDF templates."
      />

      <Card sx={{ p: 3, maxWidth: 650, borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Backend & Microservice URLs
          </Typography>
          <TextField fullWidth label="Backend API URL" defaultValue="http://localhost:5000/api" margin="normal" disabled />
          <TextField fullWidth label="AI Python Service URL" defaultValue="http://localhost:8000" margin="normal" disabled />
          <TextField fullWidth label="Firebase Project ID" defaultValue="bamp-ai-predictor" margin="normal" disabled />
        </CardContent>
      </Card>
    </Box>
  );
};
