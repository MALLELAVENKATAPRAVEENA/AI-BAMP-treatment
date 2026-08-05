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
  const [loading, setLoading] = useState(false);

  const [widgets, setWidgets] = useState({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    predictionCount: 0,
    successfulCases: 0,
    moderateRiskCases: 0,
    highRiskCases: 0,
    uploadedXrays: 0,
    reportsGenerated: 0
  });

  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    // Initial fetch to seed default data if empty and load immediately
    getPatients().then((res) => {
      if (res?.data && res.data.length > 0) {
        setRecentPatients(res.data);
        setWidgets(prev => ({
          ...prev,
          totalPatients: res.data.length,
          newPatientsThisMonth: res.data.length
        }));
      }
    }).catch(err => console.warn('Dashboard initial fetch notice:', err));

    if (!db) return;

    // Real-time Firestore Listeners with Console Debug Logging
    const unsubPatients = onSnapshot(collection(db, 'patients'), (snap) => {
      const patientList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('[Firestore Dashboard Debug] Collection: patients, Total Documents Loaded:', patientList.length);

      const getTime = (val) => {
        if (!val) return 0;
        if (typeof val === 'string') return new Date(val).getTime();
        if (val.seconds) return val.seconds * 1000;
        if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
        return 0;
      };

      const sorted = [...patientList].sort((a, b) => {
        return getTime(b.createdAt || b.timestamp) - getTime(a.createdAt || a.timestamp);
      });

      setRecentPatients(sorted);
      setWidgets(prev => ({
        ...prev,
        totalPatients: patientList.length,
        newPatientsThisMonth: patientList.length
      }));
    });

    const unsubPredictions = onSnapshot(collection(db, 'predictions'), (snap) => {
      const predList = snap.docs.map(doc => doc.data());
      console.log('[Firestore Dashboard Debug] Collection: predictions, Total Documents Loaded:', predList.length);

      let high = 0;
      let mod = 0;
      let low = 0;

      predList.forEach(p => {
        const score = p.successProbability || p.score || 85;
        if (score >= 85) high++;
        else if (score >= 70) mod++;
        else low++;
      });

      setWidgets(prev => ({
        ...prev,
        predictionCount: predList.length,
        successfulCases: high,
        moderateRiskCases: mod,
        highRiskCases: low
      }));
    });

    const unsubReports = onSnapshot(collection(db, 'reports'), (snap) => {
      console.log('[Firestore Dashboard Debug] Collection: reports, Total Documents Loaded:', snap.docs.length);
      setWidgets(prev => ({
        ...prev,
        reportsGenerated: snap.docs.length
      }));
    });

    const unsubXrays = onSnapshot(collection(db, 'patient_xrays'), (snap) => {
      console.log('[Firestore Dashboard Debug] Collection: patient_xrays, Total Documents Loaded:', snap.docs.length);
      setWidgets(prev => ({
        ...prev,
        uploadedXrays: snap.docs.length
      }));
    });

    return () => {
      unsubPatients();
      unsubPredictions();
      unsubReports();
      unsubXrays();
    };
  }, []);

  const formatDate = (dateVal) => {
    if (!dateVal) return '2026-01-15';
    if (typeof dateVal === 'string') return dateVal.split('T')[0];
    if (dateVal.toDate && typeof dateVal.toDate === 'function') {
      try { return dateVal.toDate().toISOString().split('T')[0]; } catch (_) {}
    }
    if (dateVal.seconds) {
      try { return new Date(dateVal.seconds * 1000).toISOString().split('T')[0]; } catch (_) {}
    }
    return '2026-01-15';
  };

  return (
    <Box>
      <Header
        title="Orthodontist Clinical Dashboard"
        subtitle="Real-time BAMP Treatment Outcome Monitoring & Live Firebase Firestore Predictive Analytics"
        action={
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/patients/add')}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
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
          Recent Patients Registered in Firestore Database (Real-time Live Sync)
        </Typography>
        <Card sx={{ borderRadius: '16px' }}>
          {recentPatients && recentPatients.length > 0 ? (
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
                {recentPatients.map((p) => (
                  <TableRow key={p.patientId || p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.patientId || p.id}`)}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{p.patientId || p.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.patientName || p.name}</TableCell>
                    <TableCell>{p.age} yrs / {p.gender}</TableCell>
                    <TableCell><Chip label={p.cvmStage || 'CVM 3'} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>{formatDate(p.bampStartDate || p.createdAt || p.timestamp)}</TableCell>
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
