import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { Analytics, FileDownload, Storage, Science } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { StatCard } from '../../components/common/StatCard';
import { useNavigate } from 'react-router-dom';

export const ResearcherDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Header
        title="Clinical Research & Data Science Portal"
        subtitle="Cephalometric Datasets, Statistical Validation, and AI Model Export"
        action={
          <Button variant="contained" color="secondary" startIcon={<FileDownload />} onClick={() => navigate('/researcher/datasets')}>
            Export Dataset CSV
          </Button>
        }
      />

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Dataset Cohorts" value="150" icon={<Storage />} color="#0f52ba" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Cephalometric Indices" value="1,650" icon={<Science />} color="#0d9488" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Ensemble ROC-AUC" value="0.964" icon={<Analytics />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="SHAP Consistency" value="98.2%" icon={<Analytics />} color="#8b5cf6" />
        </Grid>
      </Grid>
    </Box>
  );
};
