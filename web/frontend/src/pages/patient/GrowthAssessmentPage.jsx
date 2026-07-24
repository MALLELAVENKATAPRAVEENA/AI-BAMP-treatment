import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import { Header } from '../../components/common/Header';
import { CVM_STAGES } from '../../utils/constants';

export const GrowthAssessmentPage = () => {
  return (
    <Box>
      <Header
        title="Cervical Vertebral Maturation (CVM) Assessment Guide"
        subtitle="Skeletal maturation indexing for optimal Bone-Anchored Maxillary Protraction timing."
      />

      <Grid container spacing={3}>
        {CVM_STAGES.map((stage, idx) => (
          <Grid item xs={12} sm={6} md={4} key={stage}>
            <Card sx={{ p: 2, height: '100%', borderLeft: idx === 1 || idx === 2 ? '4px solid #10b981' : '4px solid #0f52ba' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" fontWeight={700}>
                    {stage}
                  </Typography>
                  <Chip
                    label={idx === 1 || idx === 2 ? 'OPTIMAL BAMP WINDOW' : 'Standard Stage'}
                    color={idx === 1 || idx === 2 ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Lower border concavity & vertebral body shapes evaluated for pubertal growth peak estimation.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
