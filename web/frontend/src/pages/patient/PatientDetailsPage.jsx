import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { getPatientById } from '../../services/patientService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CloudUpload, Insights, Description, Edit } from '@mui/icons-material';

export const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientById(id)
      .then((res) => setPatient(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading patient chart..." />;

  const p = patient || {
    patientId: id,
    name: 'Emily Vance',
    age: 10,
    gender: 'Female',
    dob: '2016-03-15',
    contactNumber: '+1 555-0192',
    chiefComplaint: 'Maxillary hypoplasia with skeletal Class III malocclusion.',
    medicalHistory: 'No systemic illness.',
    familyHistory: 'Father has mild skeletal Class III trait.',
    previousTreatment: 'Intermittent palatal expander.',
    cvmStage: 'CVM 3',
    skeletalAge: 10.5,
    growthPotential: 'High',
    bampStartDate: '2026-01-10',
    followUpDates: ['2026-03-10', '2026-06-15', '2026-09-20'],
    treatmentNotes: 'BAMP mini-plates surgically inserted in infrazygomatic crest.'
  };

  return (
    <Box>
      <Header
        title={`Patient Chart: ${p.name} (${p.patientId})`}
        subtitle="Comprehensive clinical history, growth assessment, and AI workflow shortcuts."
        action={
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/patients/edit/${p.patientId}`)}>
            Edit Chart
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Left Column: Demographics & Clinical info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                Demographic & Clinical Overview
              </Typography>
              <Box my={2}>
                <Typography variant="body2"><strong>Full Name:</strong> {p.name}</Typography>
                <Typography variant="body2"><strong>Age / Gender:</strong> {p.age} yrs / {p.gender}</Typography>
                <Typography variant="body2"><strong>DOB:</strong> {p.dob}</Typography>
                <Typography variant="body2"><strong>Contact:</strong> {p.contactNumber}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" fontWeight={700} color="secondary">
                Chief Complaint:
              </Typography>
              <Typography variant="body2" paragraph>{p.chiefComplaint}</Typography>

              <Typography variant="subtitle2" fontWeight={700} color="secondary">
                Medical & Family History:
              </Typography>
              <Typography variant="body2">Medical: {p.medicalHistory}</Typography>
              <Typography variant="body2">Family: {p.familyHistory}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Growth Assessment & AI Shortcuts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: '16px', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="secondary" gutterBottom>
                CVM Growth Stage & Milestones
              </Typography>
              <Box display="flex" gap={2} my={2}>
                <Chip label={`Stage: ${p.cvmStage}`} color="primary" sx={{ fontWeight: 700 }} />
                <Chip label={`Potential: ${p.growthPotential}`} color="secondary" sx={{ fontWeight: 700 }} />
                <Chip label={`Skeletal Age: ${p.skeletalAge} yrs`} variant="outlined" />
              </Box>
              <Typography variant="body2"><strong>BAMP Start Date:</strong> {p.bampStartDate}</Typography>
              <Typography variant="body2" mt={1}><strong>Treatment Notes:</strong> {p.treatmentNotes}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ p: 2, borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                AI Diagnostic Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
                <Button variant="contained" startIcon={<CloudUpload />} onClick={() => navigate('/ai/xray-upload')}>
                  Upload Patient X-Ray
                </Button>
                <Button variant="outlined" startIcon={<Insights />} onClick={() => navigate('/ai/prediction-results')}>
                  Generate AI BAMP Prediction
                </Button>
                <Button variant="outlined" color="secondary" startIcon={<Description />} onClick={() => navigate('/reports/generate')}>
                  Create PDF Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
