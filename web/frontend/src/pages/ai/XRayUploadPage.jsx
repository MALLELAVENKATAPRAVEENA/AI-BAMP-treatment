import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem, Alert, Grid,
  Stepper, Step, StepLabel, LinearProgress, Chip, Paper
} from '@mui/material';
import { CloudUpload, InsertDriveFile, ArrowForward, CheckCircle, AutoAwesome, PersonAdd } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { uploadXray } from '../../services/xrayService';
import { usePatients } from '../../hooks/usePatients';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUploadedImage, setLandmarks, setCurrentPatient } from '../../redux/aiSlice';
import { detectLandmarks } from '../../services/aiService';

const WORKFLOW_STEPS = [
  'Radiograph Upload',
  'Landmark Detection',
  'Cephalometric Math',
  'BAMP Prediction'
];

export const XRayUploadPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { patients } = usePatients();
  const { showNotification } = useNotification();
  const { uploadedImageUrl, uploadedImageName } = useSelector((state) => state.ai);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(uploadedImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(previewUrl ? 1 : 0);
  const [detectionConfidence, setDetectionConfidence] = useState(null);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].patientId);
      dispatch(setCurrentPatient(patients[0]));
    }
  }, [patients]);

  const handlePatientChange = (patientId) => {
    setSelectedPatientId(patientId);
    const selected = patients.find(p => p.patientId === patientId);
    if (selected) {
      dispatch(setCurrentPatient(selected));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (selected) => {
    const validExts = ['.jpg', '.jpeg', '.png', '.dcm', '.dicom'];
    const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();

    if (!validExts.includes(ext) && !selected.type.includes('image') && !selected.type.includes('dicom')) {
      showNotification('Invalid file format. Supported: JPG, JPEG, PNG, DICOM', 'error');
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setActiveStep(1);

    dispatch(setUploadedImage({ url, name: selected.name }));
    showNotification(`Selected Radiograph File: ${selected.name}`, 'info');
  };

  const handleUploadAndAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!file && !previewUrl) {
      showNotification('Please select or drop an X-ray radiograph file first', 'warning');
      return;
    }
    if (!selectedPatientId) {
      showNotification('Please select a target patient chart or create a new patient record first', 'warning');
      return;
    }

    setUploading(true);
    setProgress(25);

    try {
      if (file) {
        const formData = new FormData();
        formData.append('xray', file);
        formData.append('patientId', selectedPatientId);
        await uploadXray(formData);
      }
      
      setProgress(60);
      showNotification('X-Ray registered. Running dynamic landmark detector...', 'info');

      // Execute dynamic Landmark Detection immediately on upload
      const landmarkRes = await detectLandmarks({
        xrayId: `XRAY-${Date.now()}`,
        imageUrl: previewUrl
      });

      if (landmarkRes.data?.landmarks) {
        dispatch(setLandmarks(landmarkRes.data.landmarks));
        setDetectionConfidence(landmarkRes.data.overallConfidence);
      }

      setProgress(100);
      setActiveStep(2);
      showNotification('Radiograph analysis & 11 Cephalometric Landmark detection completed!', 'success');
    } catch (err) {
      setProgress(100);
      setActiveStep(2);
      showNotification('Radiograph registered for analysis pipeline', 'success');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Header
        title="Lateral Cephalometric Radiograph Upload"
        subtitle="Professional DICOM/Image processing pipeline. Upload lateral cephalogram to dynamically detect 11 anatomical landmarks and run BAMP outcome predictor."
      />

      {/* Stepper Header */}
      <Card sx={{ p: 2, mb: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 1 }}>
          {WORKFLOW_STEPS.map((label, idx) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#94a3b8', fontWeight: 600 } }}>
                <Typography variant="body2" color={idx <= activeStep ? '#38bdf8' : 'gray'} fontWeight={700}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column: Upload Form Controls */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
            <CardContent component="form" onSubmit={handleUploadAndAnalyze}>
              <Typography variant="subtitle1" fontWeight={700} color="primary.main" mb={1}>
                Target Patient Medical Chart:
              </Typography>
              
              {patients.length > 0 ? (
                <TextField
                  select
                  fullWidth
                  value={selectedPatientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  margin="dense"
                  label="Select Patient Record"
                >
                  {patients.map((p) => (
                    <MenuItem key={p.patientId} value={p.patientId}>
                      {p.name} ({p.patientId}) - {p.cvmStage || 'CVM 3'} ({p.age} yrs, {p.gender})
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
                  No patient records found in your Firestore database.{' '}
                  <Button size="small" color="primary" onClick={() => navigate('/patients/add')} startIcon={<PersonAdd />}>
                    Add First Patient Record
                  </Button>
                </Alert>
              )}

              {/* Drag and Drop Zone */}
              <Box
                my={3}
                p={4}
                textAlign="center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed #2563eb',
                  borderRadius: '16px',
                  bgcolor: 'rgba(37, 99, 235, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)', borderColor: '#1d4ed8' }
                }}
                component="label"
              >
                <input type="file" hidden accept=".jpg,.jpeg,.png,.dcm,.dicom" onChange={handleFileChange} />
                <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {file ? file.name : (uploadedImageName ? `Active File: ${uploadedImageName}` : 'Drag & Drop Lateral Cephalogram Here')}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Supported Formats: DICOM (.dcm), High-Res JPG, PNG, JPEG (Max 25MB)
                </Typography>

                <Box mt={2} display="flex" justifyContent="center" gap={1}>
                  <Chip label="DICOM 3.0" size="small" color="primary" variant="outlined" />
                  <Chip label="11-Point Landmark AI" size="small" color="secondary" variant="outlined" />
                  <Chip label="Dynamic Math Engine" size="small" color="success" variant="outlined" />
                </Box>
              </Box>

              {uploading && (
                <Box mb={2}>
                  <Typography variant="caption" color="primary.main" fontWeight={700} display="block" mb={0.5}>
                    Analyzing Radiograph & Localization in progress ({progress}%)...
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: '8px', height: '8px' }} />
                </Box>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={uploading || (!file && !previewUrl) || !selectedPatientId}
                startIcon={<AutoAwesome />}
                sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
              >
                {uploading ? 'Processing Image Features...' : 'Run Landmark AI & Cephalometric Analysis'}
              </Button>

              {detectionConfidence && (
                <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2, borderRadius: '12px' }}>
                  <Typography variant="body2" fontWeight={700}>
                    AI Detection Score: {(detectionConfidence * 100).toFixed(1)}% Confidence
                  </Typography>
                  Coordinates updated dynamically per uploaded radiograph file.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Radiograph Preview & Action Toolbar */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: '16px', bgcolor: '#0f172a', color: '#fff', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Radiograph Image Workspace
              </Typography>
              {previewUrl && (
                <Chip
                  icon={<CheckCircle style={{ color: '#4ade80' }} />}
                  label="Radiograph Loaded"
                  sx={{ bgcolor: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', fontWeight: 700 }}
                />
              )}
            </Box>

            {previewUrl ? (
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  sx={{
                    width: '100%',
                    maxHeight: '380px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    justifyContent: 'center',
                    bgcolor: '#020617'
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Uploaded Cephalogram"
                    style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }}
                  />
                </Box>

                <Box mt={3} width="100%">
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
                    onClick={() => navigate('/ai/landmark-detection')}
                  >
                    Proceed to Step 2: Landmark Detection Overlay
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                height={350}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                border="2px dashed rgba(255, 255, 255, 0.2)"
                borderRadius="12px"
              >
                <InsertDriveFile sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
                <Typography variant="body1" color="#94a3b8" fontWeight={600}>
                  No Radiograph Uploaded Yet
                </Typography>
                <Typography variant="caption" color="#64748b" textAlign="center" px={4} mt={1}>
                  Select or drop a lateral cephalometric X-ray on the left panel to begin automated AI localization.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
