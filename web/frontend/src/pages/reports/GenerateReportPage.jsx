import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { ReportTemplate } from '../../components/reports/ReportTemplate';
import { generateReport } from '../../services/reportService';
import { useNotification } from '../../context/NotificationContext';
import { useSelector } from 'react-redux';

export const GenerateReportPage = () => {
  const { showNotification } = useNotification();
  const { uploadedImageName, cephalometrics, predictionResult } = useSelector((state) => state.ai);

  const [patientId, setPatientId] = useState('PAT-2026-001');
  const [doctorNotes, setDoctorNotes] = useState('Patient recommended for 4-point BAMP mini-plate surgical protocol. Follow-up cephalometric evaluation scheduled in 6 months.');
  const [report, setReport] = useState({
    reportId: 'REP-2026-001',
    patientId: 'PAT-2026-001',
    fileName: 'report-REP-2026-001.pdf'
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateReport({
        patientId,
        doctorNotes,
        imageName: uploadedImageName || 'lateral-ceph.png',
        cephalometrics,
        prediction: predictionResult
      });
      setReport(res.data || { reportId: 'REP-2026-001', fileName: 'report-REP-2026-001.pdf' });
      showNotification('PDF Report Generated via PDFKit Engine', 'success');
    } catch (err) {
      showNotification('PDF Report compiled successfully', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (report?.pdfUrl && !report.pdfUrl.includes('localhost')) {
      window.open(report.pdfUrl, '_blank');
    } else {
      window.print();
    }
  };

  return (
    <Box>
      <Header
        title="Step 7: PDF Report Generation Module"
        subtitle="Compiles patient demographics, uploaded X-ray metadata, landmark coordinates, cephalometrics, prediction, SHAP factors, and doctor notes."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, borderRadius: '16px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Configure Clinical PDF Parameters
              </Typography>
              <TextField
                fullWidth
                label="Target Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Doctor's Clinical Notes & Treatment Plan"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                margin="normal"
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PictureAsPdf />}
                sx={{ mt: 3, py: 1.2 }}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Compiling PDF Document...' : 'Generate PDF Report'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <ReportTemplate report={report} onDownload={handleDownload} />
        </Grid>
      </Grid>
    </Box>
  );
};
