import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, IconButton, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import {
  People, PersonAdd, Insights, CheckCircle, Warning, ErrorOutline,
  CloudUpload, Description, Refresh, FolderOff, AdminPanelSettings
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
    totalPatients: 0,
    totalUsers: 1,
    newPatientsThisMonth: 0,
    predictionCount: 0,
    successfulCases: 0,
    moderateRiskCases: 0,
    highRiskCases: 0,
    uploadedXrays: 0,
    reportsGenerated: 0
  };

  const recent = stats?.recent || {
    recentPatients: [],
    recentUploads: [],
    recentPredictions: [],
    recentReports: []
  };

  return (
    <Box>
      <Header
        title="Orthodontist Clinical Dashboard"
        subtitle="Real-time BAMP Treatment Outcome Monitoring & Live Firebase Firestore Predictive Analytics"
        action={
          <Box display="flex" gap={1}>
            <IconButton onClick={fetchStats} disabled={loading} color="primary">
              <Refresh className={loading ? 'animate-spin' : ''} />
            </IconButton>
            <Button variant="contained" startIcon={<PersonAdd />} onClick={() => navigate('/patients/add')} sx={{ borderRadius: '12px', fontWeight: 700 }}>
              New Patient
            </Button>
          </Box>
        }
      />

      {/* Dashboard Stat Cards */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Patients" value={widgets.totalPatients} icon={<People />} color="#0f52ba" subtitle="Live Registered Cases" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={widgets.totalUsers} icon={<AdminPanelSettings />} color="#0d9488" subtitle="Active System Accounts" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Predictions" value={widgets.predictionCount} icon={<Insights />} color="#8b5cf6" subtitle="AI Inference Runs" />
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
          <StatCard title="Total Reports" value={widgets.reportsGenerated} icon={<Description />} color="#6366f1" subtitle="Clinical PDFs Generated" />
        </Grid>
      </Grid>

      {/* Interactive Charts */}
      <DashboardCharts data={stats?.charts} />

      {/* Recent Patients Activity Table */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Recent Patients Registered in Firestore
        </Typography>
        <Card sx={{ borderRadius: '16px' }}>
          {recent.recentPatients && recent.recentPatients.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><strong>Patient ID</strong></TableCell>
                  <TableCell><strong>Patient Name</strong></TableCell>
                  <TableCell><strong>Age / Gender</strong></TableCell>
                  <TableCell><strong>CVM Stage</strong></TableCell>
                  <TableCell><strong>BAMP Start Date</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.recentPatients.map((p) => (
                  <TableRow key={p.patientId} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.patientId}`)}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{p.patientId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.patientName || p.name}</TableCell>
                    <TableCell>{p.age} yrs / {p.gender}</TableCell>
                    <TableCell><Chip label={p.cvmStage || 'CVM 3'} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>{p.bampStartDate || new Date().toISOString().split('T')[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box p={4} textAlign="center">
              <FolderOff sx={{ fontSize: 48, color: 'gray', mb: 1 }} />
              <Typography variant="body1" fontWeight={700} color="text.secondary">
                No Patients Found in Firestore Database
              </Typography>
              <Typography variant="caption" color="gray">
                Click 'New Patient' above to register your first clinical record.
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};
