import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Grid, Divider } from '@mui/material';
import { CheckCircle, Warning, ErrorOutline, AutoAwesome } from '@mui/icons-material';

export const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  const {
    successProbability = 88.5,
    confidenceScore = 0.94,
    riskLevel = 'Success',
    featureImportance = []
  } = prediction;

  const getBadgeColor = (risk) => {
    if (risk === 'Success') return 'success';
    if (risk === 'Moderate Risk') return 'warning';
    return 'error';
  };

  const getIcon = (risk) => {
    if (risk === 'Success') return <CheckCircle />;
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
              AI BAMP Treatment Outcome Prediction
            </Typography>
          </Box>
          <Chip
            icon={getIcon(riskLevel)}
            label={riskLevel.toUpperCase()}
            color={getBadgeColor(riskLevel)}
            sx={{ fontWeight: 700, fontSize: 13 }}
          />
        </Box>

        <Grid container spacing={3} alignItems="center" my={1}>
          <Grid item xs={12} sm={6}>
            <Box textAlign="center" p={3} sx={{ bgcolor: 'action.hover', borderRadius: '12px' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Success Probability
              </Typography>
              <Typography variant="h2" fontWeight={800} color={riskLevel === 'Success' ? 'success.main' : 'warning.main'}>
                {successProbability}%
              </Typography>
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={successProbability}
                  color={getBadgeColor(riskLevel)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box p={2}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                AI Model Metrics:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Model Ensemble: <strong>Random Forest + XGBoost</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Detection Confidence: <strong>{(confidenceScore * 100).toFixed(0)}%</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Threshold: <strong>Success (&gt;85%), Moderate (70–85%), High (&lt;70%)</strong>
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} mb={1}>
          Key Feature Importance Factors
        </Typography>
        <Box>
          {featureImportance.map((feat, idx) => (
            <Box key={idx} mb={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600}>
                  {feat.feature}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(feat.importance * 100).toFixed(0)}% Impact
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={feat.importance * 100}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'divider' }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
