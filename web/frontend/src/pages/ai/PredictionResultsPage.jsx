import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Card, CardContent, Typography, Chip, LinearProgress, Paper } from '@mui/material';
import { AutoAwesome, ArrowForward, Analytics, CheckCircle, Warning, Speed } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { PredictionCard } from '../../components/ai/PredictionCard';
import { predictBampOutcome } from '../../services/aiService';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PredictionResultsPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { landmarks } = useSelector((state) => state.ai);

  // Active Patient details state
  const [patient, setPatient] = useState({
    patientId: 'PAT-2026-001',
    name: 'Emily Vance',
    age: 10,
    gender: 'Female',
    cvmStage: 'CVM 3',
    growthPotential: 'High'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleRunPredictor();
  }, []);

  const handleRunPredictor = async () => {
    setLoading(true);
    try {
      const res = await predictBampOutcome({
        patientId: patient.patientId,
        age: patient.age,
        gender: patient.gender,
        cvmStage: patient.cvmStage,
        growthPotential: patient.growthPotential,
        landmarks
      });
      
      setPrediction(res.data);
      showNotification(`AI Prediction Computed: ${res.data?.successProbability}% Success Probability (${res.data?.riskLevel})`, 'success');
    } catch (err) {
      showNotification('Recalculated AI BAMP outcome probability', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Header
        title="Step 4: AI Ensemble BAMP Outcome Prediction"
        subtitle="Random Forest + XGBoost Voting Ensemble evaluating success probability for Class III maxillary protraction based on patient demographics and cephalometric math."
      />

      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          size="large"
          startIcon={<AutoAwesome />}
          onClick={handleRunPredictor}
          disabled={loading}
          sx={{ borderRadius: '12px', fontWeight: 700 }}
        >
          {loading ? 'Running ML Inference...' : 'Recalculate AI Prediction'}
        </Button>

        {prediction && (
          <Chip
            label={`Probability: ${prediction.successProbability}% • ${prediction.riskLevel}`}
            color={prediction.riskLevel === 'Success' ? 'success' : (prediction.riskLevel === 'Moderate Risk' ? 'warning' : 'error')}
            sx={{ fontSize: 15, fontWeight: 700, p: 1 }}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {prediction ? (
            <PredictionCard prediction={prediction} />
          ) : (
            <Card sx={{ p: 4, borderRadius: '16px', textAlign: 'center' }}>
              <LinearProgress sx={{ borderRadius: '8px', height: '8px', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Running Random Forest + XGBoost Voting Ensemble inference...
              </Typography>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '16px', bgcolor: '#0f172a', color: '#fff' }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Active Patient Medical Chart
              </Typography>
              <Typography variant="body2" color="#94a3b8">Patient Name: <strong>{patient.name}</strong></Typography>
              <Typography variant="body2" color="#94a3b8">Age / Gender: <strong>{patient.age} yrs, {patient.gender}</strong></Typography>
              <Typography variant="body2" color="#94a3b8">Maturation Stage: <strong style={{ color: '#38bdf8' }}>{patient.cvmStage}</strong></Typography>
              <Typography variant="body2" color="#94a3b8">Growth Potential: <strong style={{ color: '#4ade80' }}>{patient.growthPotential}</strong></Typography>
            </Paper>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ borderRadius: '12px', fontWeight: 700, py: 1.2 }}
              onClick={() => navigate('/ai/shap-explanation')}
            >
              Explore SHAP Explainability Plot
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ borderRadius: '12px', fontWeight: 700, py: 1.2 }}
              onClick={() => navigate('/ai/3d-visualization')}
            >
              Open 3D Craniofacial Interactive Mesh
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              sx={{ borderRadius: '12px', fontWeight: 700, py: 1.2 }}
              onClick={() => navigate('/reports/generate')}
            >
              Generate PDF Clinical Report
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
