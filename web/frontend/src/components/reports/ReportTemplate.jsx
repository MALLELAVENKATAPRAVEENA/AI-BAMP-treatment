import React from 'react';
import { Card, CardContent, Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Divider } from '@mui/material';
import { Download, Print } from '@mui/icons-material';

export const ReportTemplate = ({ report, onDownload }) => {
  if (!report) return null;

  return (
    <Card sx={{ p: 3, borderRadius: '16px', border: '2px solid #e2e8f0' }}>
      <CardContent>
        {/* Report Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" pb={2} borderBottom="2px solid #0f52ba">
          <Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              BAMP TREATMENT OUTCOME CLINICAL REPORT
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI-Based Outcome Assessment &amp; Cephalometric Analysis System
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Download />} onClick={onDownload}>
            Export PDF
          </Button>
        </Box>

        {/* Patient Metadata */}
        <Box my={3} p={2} bgcolor="action.hover" borderRadius="10px">
          <Typography variant="subtitle2" fontWeight={700} color="primary">
            PATIENT CLINICAL SUMMARY
          </Typography>
          <Typography variant="body2"><strong>Report ID:</strong> {report.reportId || 'REP-2026-001'}</Typography>
          <Typography variant="body2"><strong>Patient ID:</strong> {report.patientId || 'PAT-2026-001'}</Typography>
          <Typography variant="body2"><strong>Generated Date:</strong> {new Date().toLocaleDateString()}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Cephalometric Baseline Parameters
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Metric</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Measured</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Norm</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow><TableCell>SNA Angle</TableCell><TableCell>82.5°</TableCell><TableCell>82.0°</TableCell><TableCell>Normal</TableCell></TableRow>
            <TableRow><TableCell>SNB Angle</TableCell><TableCell>84.1°</TableCell><TableCell>80.0°</TableCell><TableCell>Protrusive Mandible</TableCell></TableRow>
            <TableRow><TableCell>ANB Angle</TableCell><TableCell>-1.6°</TableCell><TableCell>2.0°</TableCell><TableCell>Class III Skeletal</TableCell></TableRow>
            <TableRow><TableCell>Wits Appraisal</TableCell><TableCell>-3.5 mm</TableCell><TableCell>-1.0 mm</TableCell><TableCell>Class III Discrepancy</TableCell></TableRow>
          </TableBody>
        </Table>

        <Box mt={3} textAlign="right">
          <Button startIcon={<Print />} onClick={() => window.print()} color="secondary">
            Print Preview
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
