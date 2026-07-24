import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { AdminPanelSettings, SupervisorAccount, Security, Memory } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Header
        title="Administrator System Control Center"
        subtitle="Platform User Management, Audit Logs, and AI Infrastructure Status"
        action={
          <Button variant="contained" color="secondary" startIcon={<SupervisorAccount />} onClick={() => navigate('/admin/users')}>
            Manage Users
          </Button>
        }
      />

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Practitioners" value="42" icon={<SupervisorAccount />} color="#0f52ba" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="AI Model Status" value="Active v2.4" icon={<Memory />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Security Score" value="99.8%" icon={<Security />} color="#0d9488" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total System Events" value="1,240" icon={<AdminPanelSettings />} color="#8b5cf6" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>Quick Administrative Actions</Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Button variant="outlined" onClick={() => navigate('/admin/users')}>User Role Approvals & Management</Button>
              <Button variant="outlined" onClick={() => navigate('/admin/audit-logs')}>View System Compliance Audit Logs</Button>
              <Button variant="outlined" onClick={() => navigate('/admin/models')}>Inspect Machine Learning Ensemble Performance</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
