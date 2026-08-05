import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, IconButton, Card, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import {
  People, PersonAdd, Insights, CheckCircle, Warning, ErrorOutline,
  CloudUpload, Description, Refresh, FolderOff
} from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { getDashboardStats } from '../../services/aiService';
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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

    if (!db) return;

    // Real-time Firestore Live Snapshots
    const unsubPatients = onSnapshot(collection(db, 'patients'), (snap) => {
      const patientList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({
        ...prev,
        widgets: {
          ...prev?.widgets,
          totalPatients: patientList.length,
          newPatientsThisMonth: patientList.length
        },
        recent: {
          ...prev?.recent,
          recentPatients: patientList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        }
      }));
    });

    const unsubPredictions = onSnapshot(collection(db, 'predictions'), (snap) => {
      const predList = snap.docs.map(doc => doc.data());
      const high = predList.filter(p => (p.successProbability || p.score || 0) >= 85).length;
      const mod = predList.filter(p => (p.successProbability || p.score || 0) >= 70 && (p.successProbability || p.score || 0) < 85).length;
      const low = predList.filter(p => (p.successProbability || p.score || 0) < 70).length;

      setStats(prev => ({
        ...prev,
        widgets: {
          ...prev?.widgets,
          predictionCount: predList.length,
          successfulCases: high,
          moderateRiskCases: mod,
          highRiskCases: low
        }
      }));
    });

    const unsubReports = onSnapshot(collection(db, 'reports'), (snap) => {
      setStats(prev => ({
        ...prev,
        widgets: {
          ...prev?.widgets,
          reportsGenerated: snap.docs.length
        }
      }));
    });

    const unsubXrays = onSnapshot(collection(db, 'xrayUploads'), (snap) => {
      setStats(prev => ({
        ...prev,
        widgets: {
          ...prev?.widgets,
          uploadedXrays: snap.docs.length
        }
      }));
    });

    return () => {
      unsubPatients();
      unsubPredictions();
      unsubReports();
      unsubXrays();
    };
  }, []);

  const widgets = stats?.widgets || {
    totalPatients: 0,
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
          <StatCard title="Total Predictions" value={widgets.predictionCount} icon={<Insights />} color="#8b5cf6" subtitle="AI Inference Runs" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Successful Cases" value={widgets.successfulCases} icon={<CheckCircle />} color="#10b981" subtitle=">85% Success Rate" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Uploaded X-Rays" value={widgets.uploadedXrays} icon={<CloudUpload />} color="#0284c7" subtitle="Lateral Cephalograms" />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Moderate Risk Cases" value={widgets.moderateRiskCases} icon={<Warning />} color="#f59e0b" subtitle="70-85% Success Rate" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="High Risk Cases" value={widgets.highRiskCases} icon={<ErrorOutline />} color="#ef4444" subtitle="<70% Success Rate" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Reports" value={widgets.reportsGenerated} icon={<Description />} color="#6366f1" subtitle="Clinical PDFs Generated" />
        </Grid>
      </Grid>

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
                  <TableRow key={p.patientId || p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.patientId || p.id}`)}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{p.patientId || p.id}</TableCell>
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
