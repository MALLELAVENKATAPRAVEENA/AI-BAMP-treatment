import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import { Header } from '../../components/common/Header';

export const AIModelMonitoringPage = () => {
  return (
    <Box>
      <Header
        title="AI Machine Learning Model Health & Monitoring"
        subtitle="Track ensemble latency, model drift, feature weight stability, and landmark detection error metrics."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                Ensemble Predictor Status
              </Typography>
              <Typography variant="body2">Model Type: <strong>Random Forest + XGBoost Engine</strong></Typography>
              <Typography variant="body2">Current Accuracy: <strong>96.2%</strong></Typography>
              <Typography variant="body2">Average Latency: <strong>140ms</strong></Typography>
              <Chip label="ONLINE & HEALTHY" color="success" sx={{ mt: 2, fontWeight: 700 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="secondary" gutterBottom>
                Cephalometric Landmark Network
              </Typography>
              <Typography variant="body2">Model Type: <strong>OpenCV Deep Neural Landmark Detector</strong></Typography>
              <Typography variant="body2">Mean Pixel Error: <strong>0.48 mm</strong></Typography>
              <Typography variant="body2">Average Latency: <strong>185ms</strong></Typography>
              <Chip label="ONLINE & HEALTHY" color="success" sx={{ mt: 2, fontWeight: 700 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
