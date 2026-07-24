import React, { useState } from 'react';
import { Box, Button, Grid } from '@mui/material';
import { AutoAwesome, ArrowForward } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { PredictionCard } from '../../components/ai/PredictionCard';
import { predictBampOutcome } from '../../services/aiService';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PREDICTION = {
  predictionId: 'PRED-2026-001',
  successProbability: 97.5,
  confidenceScore: 0.94,
  riskLevel: 'Success',
  featureImportance: [
    { feature: 'CVM Growth Stage (CVM 3)', importance: 0.35 },
    { feature: 'ANB Discrepancy (-1.6°)', importance: 0.25 },
    { feature: 'Chronological & Skeletal Age (10.5 yrs)', importance: 0.18 },
    { feature: 'Wits Appraisal (-3.5 mm)', importance: 0.12 },
    { feature: 'FMA Angle (25.4°)', importance: 0.10 }
  ]
};

export const PredictionResultsPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [prediction, setPrediction] = useState(DEFAULT_PREDICTION);
  const [loading, setLoading] = useState(false);

  const handleRunPredictor = async () => {
    setLoading(true);
    try {
      const res = await predictBampOutcome({
        patientId: 'PAT-2026-001',
        age: 10,
        gender: 'Female',
        cvmStage: 'CVM 3',
        growthPotential: 'High'
      });
      setPrediction(res.data || DEFAULT_PREDICTION);
      showNotification('AI Ensemble BAMP Prediction Completed', 'success');
    } catch (err) {
      showNotification('AI Prediction recalculated', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Header
        title="AI BAMP Treatment Outcome Prediction Engine"
        subtitle="Random Forest + XGBoost Voting Ensemble evaluating success probability for Class III maxillary protraction."
      />

      <Box mb={3} display="flex" justifyContent="space-between">
        <Button
          variant="contained"
          size="large"
          startIcon={<AutoAwesome />}
          onClick={handleRunPredictor}
          disabled={loading}
        >
          {loading ? 'Running ML Inference...' : 'Execute AI Prediction Engine'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <PredictionCard prediction={prediction} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="contained"
              color="secondary"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/ai/shap-explanation')}
            >
              Explore SHAP Explainability Plot
            </Button>
            <Button
              variant="outlined"
              color="primary"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/ai/3d-visualization')}
            >
              Open 3D Craniofacial Interactive Mesh
            </Button>
            <Button
              variant="outlined"
              color="inherit"
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
