import React from 'react';
import { Box, Button } from '@mui/material';
import { Header } from '../../components/common/Header';
import { ShapChart } from '../../components/ai/ShapChart';
import { useNavigate } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';

export const SHAPExplanationPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Header
        title="SHAP Explainability & Feature Contribution"
        subtitle="Transparent AI explanations revealing how patient parameters shift treatment success probability."
      />

      <ShapChart />

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="secondary"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/ai/3d-visualization')}
        >
          View 3D Craniofacial Simulation
        </Button>
      </Box>
    </Box>
  );
};
