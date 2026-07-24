import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const GENDER_COLORS = ['#0d9488', '#0f52ba'];
const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const DashboardCharts = ({ data }) => {
  const {
    successRateTrend = [],
    ageDistribution = [],
    genderDistribution = [],
    growthStageAnalysis = [],
    predictionAccuracy = [],
    landmarkAccuracy = []
  } = data || {};

  return (
    <Grid container spacing={3}>
      {/* 1. Success Rate Trend Chart */}
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Treatment Success Rate Trend (Monthly)
          </Typography>
          <Box height={300}>
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

      {/* 2. Gender Distribution Pie Chart */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Gender Demographics
          </Typography>
          <Box height={260} display="flex" justifyContent="center" alignItems="center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderDistribution}
                  dataKey="count"
                  nameKey="gender"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ gender, percentage }) => `${gender}: ${percentage}%`}
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>

      {/* 3. Growth Stage Analysis Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Growth Stage vs BAMP Success Rate
          </Typography>
          <Box height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthStageAnalysis}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="stage" />
                <YAxis unit="%" />
                <Tooltip formatter={(val) => [`${val}%`, 'Avg Success']} />
                <Bar dataKey="avgSuccess" fill="#0d9488" radius={[8, 8, 0, 0]} name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>

      {/* 4. Age Distribution */}
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
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

      {/* 5. ML Model Prediction Accuracy */}
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

      {/* 6. Landmark Detection Precision */}
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
