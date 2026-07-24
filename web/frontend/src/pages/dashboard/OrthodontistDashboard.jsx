import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import {
  People, PersonAdd, Insights, CheckCircle, Warning, ErrorOutline,
  CloudUpload, Description
} from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { DashboardCharts } from '../../components/dashboard/Charts';
import { getDashboardStats } from '../../services/aiService';
import { useNavigate } from 'react-router-dom';

export const OrthodontistDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  const widgets = stats?.widgets || {
    totalPatients: 148,
    newPatientsThisMonth: 24,
    predictionCount: 312,
    successfulCases: 218,
    moderateRiskCases: 64,
    highRiskCases: 30,
    uploadedXrays: 289,
    reportsGenerated: 196
  };

  return (
    <Box>
      <Header
        title="Orthodontist Clinical Dashboard"
        subtitle="Real-time BAMP Treatment Outcome Monitoring & Predictive Analytics"
        action={
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => navigate('/patients/add')}>
            New Patient
          </Button>
        }
      />

      {/* 8 Required Dashboard Widgets */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Patients" value={widgets.totalPatients} icon={<People />} color="#0f52ba" subtitle="Registered cases" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="New Patients" value={widgets.newPatientsThisMonth} icon={<PersonAdd />} color="#0d9488" subtitle="This month" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Prediction Count" value={widgets.predictionCount} icon={<Insights />} color="#8b5cf6" subtitle="AI Inference runs" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Successful Cases" value={widgets.successfulCases} icon={<CheckCircle />} color="#10b981" subtitle=">85% Outcome" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Moderate Risk Cases" value={widgets.moderateRiskCases} icon={<Warning />} color="#f59e0b" subtitle="70-85% Outcome" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="High Risk Cases" value={widgets.highRiskCases} icon={<ErrorOutline />} color="#ef4444" subtitle="<70% Outcome" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Uploaded X-Rays" value={widgets.uploadedXrays} icon={<CloudUpload />} color="#0284c7" subtitle="DICOM & Ceph images" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Reports Generated" value={widgets.reportsGenerated} icon={<Description />} color="#6366f1" subtitle="Clinical PDFs" />
        </Grid>
      </Grid>

      {/* 6 Required Interactive Charts */}
      <DashboardCharts data={stats?.charts} />
    </Box>
  );
};
