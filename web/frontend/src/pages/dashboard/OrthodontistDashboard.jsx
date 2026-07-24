import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, IconButton } from '@mui/material';
import {
  People, PersonAdd, Insights, CheckCircle, Warning, ErrorOutline,
  CloudUpload, Description, Refresh
} from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { DashboardCharts } from '../../components/dashboard/Charts';
import { getDashboardStats } from '../../services/aiService';
import { useNavigate } from 'react-router-dom';

export const OrthodontistDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const widgets = stats?.widgets || {
    totalPatients: 1,
    newPatientsThisMonth: 1,
    predictionCount: 1,
    successfulCases: 1,
    moderateRiskCases: 0,
    highRiskCases: 0,
    uploadedXrays: 1,
    reportsGenerated: 1
  };

  return (
    <Box>
      <Header
        title="Orthodontist Clinical Dashboard"
        subtitle="Real-time BAMP Treatment Outcome Monitoring & Predictive Analytics"
        action={
          <Box display="flex" gap={1}>
            <IconButton onClick={fetchStats} disabled={loading} color="primary">
              <Refresh className={loading ? 'animate-spin' : ''} />
            </IconButton>
            <Button variant="contained" startIcon={<PersonAdd />} onClick={() => navigate('/patients/add')} sx={{ borderRadius: '12px' }}>
              New Patient
            </Button>
          </Box>
        }
      />

      {/* 8 Required Dashboard Widgets */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Patients" value={widgets.totalPatients} icon={<People />} color="#0f52ba" subtitle="Live Registered Cases" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="New Patients" value={widgets.newPatientsThisMonth} icon={<PersonAdd />} color="#0d9488" subtitle="Recent Registrations" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Prediction Count" value={widgets.predictionCount} icon={<Insights />} color="#8b5cf6" subtitle="AI Inference Runs" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Successful Cases" value={widgets.successfulCases} icon={<CheckCircle />} color="#10b981" subtitle=">85% Success Rate" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Moderate Risk Cases" value={widgets.moderateRiskCases} icon={<Warning />} color="#f59e0b" subtitle="70-85% Success Rate" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="High Risk Cases" value={widgets.highRiskCases} icon={<ErrorOutline />} color="#ef4444" subtitle="<70% Success Rate" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Uploaded X-Rays" value={widgets.uploadedXrays} icon={<CloudUpload />} color="#0284c7" subtitle="Lateral Cephalograms" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Reports Generated" value={widgets.reportsGenerated} icon={<Description />} color="#6366f1" subtitle="Clinical PDFs" />
        </Grid>
      </Grid>

      {/* Interactive Charts */}
      <DashboardCharts data={stats?.charts} />
    </Box>
  );
};
