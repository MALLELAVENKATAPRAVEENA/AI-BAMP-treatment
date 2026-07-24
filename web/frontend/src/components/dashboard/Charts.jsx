import React from 'react';
import { Card, Typography, Box, Grid } from '@mui/material';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

export const DashboardCharts = ({ data }) => {
  const {
    successRateTrend = [],
    ageDistribution = [],
    predictionAccuracy = [],
    landmarkAccuracy = []
  } = data || {};

  return (
    <Grid container spacing={3}>
      {/* 1. Success Rate Trend Chart */}
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Treatment Success Rate Trend (Monthly)
          </Typography>
          <Box height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={successRateTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis domain={[60, 100]} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                <Legend />
                <Line type="monotone" dataKey="successRate" stroke="#0f52ba" strokeWidth={3} dot={{ r: 6 }} name="Success Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>

      {/* 2. Age Distribution */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Age Group Distribution
          </Typography>
          <Box height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="ageGroup" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Patient Count" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>

      {/* 3. ML Model Prediction Accuracy */}
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            AI Model Performance Benchmarks
          </Typography>
          <Box height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictionAccuracy}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="model" />
                <YAxis domain={[80, 100]} unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="precision" fill="#10b981" name="Precision %" />
                <Bar dataKey="f1Score" fill="#0f52ba" name="F1-Score %" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>

      {/* 4. Landmark Detection Precision */}
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Cephalometric Landmark Detection Precision
          </Typography>
          <Box height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={landmarkAccuracy}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="landmark" />
                <YAxis domain={[90, 100]} unit="%" />
                <Tooltip />
                <Bar dataKey="confidence" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Confidence %" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};
