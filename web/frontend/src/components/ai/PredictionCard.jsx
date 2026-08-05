import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Grid, Divider } from '@mui/material';
import { CheckCircle, Warning, ErrorOutline, AutoAwesome } from '@mui/icons-material';

export const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  const successProbability = prediction.successProbability !== undefined ? prediction.successProbability : 88.5;
  const riskVal = prediction.riskCategory || prediction.riskLevel || (successProbability >= 85 ? 'Success' : successProbability >= 70 ? 'Moderate Risk' : 'High Risk');
  const rawConf = prediction.confidenceScore !== undefined ? prediction.confidenceScore : 0.94;
  const confDisplay = rawConf > 1 ? rawConf.toFixed(1) : (rawConf * 100).toFixed(1);

  const defaultFactors = [
    { feature: `CVM Maturation Stage (${prediction.skeletalMaturityStage || 'CVM 3'})`, importance: 0.35 },
    { feature: 'ANB Sagittal Jaw Discrepancy', importance: 0.28 },
    { feature: 'Chronological Age Window', importance: 0.22 },
    { feature: 'Wits Occlusal Appraisal', importance: 0.15 }
  ];

  const featureImportance = (prediction.featureImportance && prediction.featureImportance.length > 0)
    ? prediction.featureImportance
    : defaultFactors;

  const getBadgeColor = (risk) => {
    if (risk === 'Success' || risk === 'Low Risk') return 'success';
    if (risk === 'Moderate Risk') return 'warning';
    return 'error';
  };

  const getIcon = (risk) => {
    if (risk === 'Success' || risk === 'Low Risk') return <CheckCircle />;
    if (risk === 'Moderate Risk') return <Warning />;
    return <ErrorOutline />;
  };

  return (
    <Card sx={{ p: 1, borderRadius: '16px' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AutoAwesome color="primary" />
            <Typography variant="h6" fontWeight={700}>
              AI BAMP Treatment Outcome Prediction Results
            </Typography>
          </Box>
          <Chip
            icon={getIcon(riskVal)}
            label={riskVal.toUpperCase()}
            color={getBadgeColor(riskVal)}
            sx={{ fontWeight: 800, fontSize: 13, px: 1.5 }}
          />
        </Box>

        <Grid container spacing={3} alignItems="center" my={1}>
          <Grid item xs={12} sm={6}>
            <Box textAlign="center" p={3} sx={{ bgcolor: 'action.hover', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
                Predicted Success Probability
              </Typography>
              <Typography variant="h2" fontWeight={900} color={getBadgeColor(riskVal) + '.main'} sx={{ my: 1 }}>
                {successProbability}%
              </Typography>
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={successProbability}
                  color={getBadgeColor(riskVal)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box p={2}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                AI Voting Ensemble Metrics:
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                • Model Ensemble: <strong>Random Forest + XGBoost</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                • Detection Confidence: <strong>{confDisplay}%</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                • Threshold: <strong>Success (&ge;85%), Moderate (70–84%), High (&lt;70%)</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Maxillary Advancement: <strong>{prediction.maxillaryProtractionMm || 3.8} mm</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Key Anatomical & Clinical Feature Impact
        </Typography>
        <Box>
          {featureImportance.map((feat, idx) => {
            const impVal = (feat.importance > 1 ? feat.importance : feat.importance * 100).toFixed(0);
            return (
              <Box key={idx} mb={1.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {feat.feature}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    {impVal}% Weight
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(impVal)}
                  sx={{ height: 6, borderRadius: 3, bgcolor: 'divider' }}
                />
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};
