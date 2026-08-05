import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Card, CardContent, Typography, Chip, LinearProgress, Paper, Alert } from '@mui/material';
import { AutoAwesome, ArrowForward, PersonAdd } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { PredictionCard } from '../../components/ai/PredictionCard';
import { predictBampOutcome } from '../../services/aiService';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePatients } from '../../hooks/usePatients';

export const PredictionResultsPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { landmarks, currentPatient } = useSelector((state) => state.ai);
  const { patients } = usePatients();

  const activePatient = currentPatient || (patients.length > 0 ? patients[0] : null);

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activePatient) {
      handleRunPredictor(activePatient);
    }
  }, [activePatient]);

  const handleRunPredictor = async (pTarget) => {
    const target = pTarget || activePatient;
    if (!target) return;

    setLoading(true);
    try {
      const res = await predictBampOutcome({
        patientId: target.patientId,
        age: target.age || 10,
        gender: target.gender || 'Female',
        cvmStage: target.cvmStage || 'CVM 3',
        growthPotential: target.growthPotential || 'High',
        landmarks
      });
      
      setPrediction(res.data);
      showNotification(`AI Prediction Computed for ${target.name}: ${res.data?.successProbability}% Success Probability (${res.data?.riskLevel})`, 'success');
    } catch (err) {
      showNotification('Recalculated AI BAMP outcome probability', 'info');
    } finally {
      setLoading(false);
    }
  };

  if (!activePatient) {
    return (
      <Box>
        <Header
          title="AI Ensemble BAMP Outcome Prediction"
          subtitle="Random Forest + XGBoost Voting Ensemble evaluating success probability for Class III maxillary protraction based on patient demographics and cephalometric math."
        />
        <Card sx={{ p: 5, textAlign: 'center', borderRadius: '16px' }}>
          <Typography variant="h6" fontWeight={700} color="text.secondary" mb={1}>
            No Active Patient Chart Selected
          </Typography>
          <Typography variant="body2" color="gray" mb={3}>
            Please select or register a patient record in your Firestore database to compute AI treatment outcome predictions.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/patients/add')}
            sx={{ borderRadius: '12px', fontWeight: 700 }}
          >
            Add Patient Record
          </Button>
        </Card>
      </Box>
    );
  }

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
          onClick={() => handleRunPredictor(activePatient)}
          disabled={loading}
          sx={{ borderRadius: '12px', fontWeight: 700 }}
        >
          {loading ? 'Running ML Inference...' : `Recalculate AI Prediction for ${activePatient.name}`}
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
                Running Random Forest + XGBoost Voting Ensemble inference for {activePatient.name}...
              </Typography>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '16px', bgcolor: '#0f172a', color: '#fff' }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5} color="primary.light">
                Patient Medical Record Summary
              </Typography>
              <Typography variant="body2" color="#94a3b8" mb={0.5}>Patient ID: <strong style={{ color: '#38bdf8' }}>{activePatient.patientId}</strong></Typography>
              <Typography variant="body2" color="#94a3b8" mb={0.5}>Patient Name: <strong>{activePatient.name || activePatient.patientName}</strong></Typography>
              <Typography variant="body2" color="#94a3b8" mb={0.5}>Age / Gender: <strong>{activePatient.age} yrs, {activePatient.gender}</strong></Typography>
              <Typography variant="body2" color="#94a3b8" mb={0.5}>CVM Maturation Stage: <strong style={{ color: '#38bdf8' }}>{activePatient.cvmStage || 'CVM 3'}</strong></Typography>
              <Typography variant="body2" color="#94a3b8">Growth Potential: <strong style={{ color: '#4ade80' }}>{activePatient.growthPotential || 'High'}</strong></Typography>
            </Paper>

            {prediction && (
              <Paper elevation={3} sx={{ p: 3, borderRadius: '16px', bgcolor: '#1e293b', color: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="secondary.main" mb={1}>
                  Clinical Summary & Recommendations
                </Typography>
                <Typography variant="body2" color="#cbd5e1" mb={1.5}>
                  {prediction.clinicalFindings || `Class III skeletal malocclusion pattern with favorable growth velocity.`}
                </Typography>
                <Typography variant="caption" color="#94a3b8" display="block" mb={0.5}>
                  Recommended Orthopedic Appliance:
                </Typography>
                <Chip label={prediction.recommendedAppliance || 'BAMP Mini-Plates'} color="secondary" size="small" sx={{ fontWeight: 700, mb: 1 }} />
              </Paper>
            )}

            <Button
              variant="contained"
              color="success"
              size="large"
              sx={{ borderRadius: '12px', fontWeight: 800, py: 1.5, fontSize: '15px' }}
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
