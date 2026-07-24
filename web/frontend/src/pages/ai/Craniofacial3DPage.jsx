import React from 'react';
import { Box, Button } from '@mui/material';
import { Header } from '../../components/common/Header';
import { CraniofacialViewer } from '../../components/visualization/CraniofacialViewer';
import { useNavigate } from 'react-router-dom';
import { Description } from '@mui/icons-material';

export const Craniofacial3DPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Header
        title="3D Craniofacial Interactive Visualization"
        subtitle="AI-estimated 3D anatomical facial mesh with before/after BAMP protraction simulation."
      />

      <CraniofacialViewer />

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Description />}
          onClick={() => navigate('/reports/generate')}
        >
          Export Comprehensive PDF Report
        </Button>
      </Box>
    </Box>
  );
};
