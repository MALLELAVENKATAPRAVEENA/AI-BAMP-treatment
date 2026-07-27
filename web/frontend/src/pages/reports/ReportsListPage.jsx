import React from 'react';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Button, IconButton } from '@mui/material';
import { Description, Download, Visibility } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { useNavigate } from 'react-router-dom';

export const ReportsListPage = () => {
  const navigate = useNavigate();

  const reports = [
    { reportId: 'REP-2026-001', patientName: 'Emily Vance', patientId: 'PAT-2026-001', date: '2026-03-10', riskLevel: 'Success' },
    { reportId: 'REP-2026-002', patientName: 'Lucas Miller', patientId: 'PAT-2026-002', date: '2026-03-12', riskLevel: 'Moderate Risk' }
  ];

  return (
    <Box>
      <Header
        title="Clinical Reports Directory"
        subtitle="Manage and export generated PDF clinical assessment documents."
        action={
          <Button variant="contained" startIcon={<Description />} onClick={() => navigate('/reports/generate')}>
            Generate New Report
          </Button>
        }
      />

      <Card sx={{ borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Report ID</strong></TableCell>
              <TableCell><strong>Patient Name</strong></TableCell>
              <TableCell><strong>Patient ID</strong></TableCell>
              <TableCell><strong>Date Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.reportId}>
                <TableCell sx={{ fontWeight: 600 }}>{r.reportId}</TableCell>
                <TableCell>{r.patientName}</TableCell>
                <TableCell>{r.patientId}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => navigate('/reports/generate')}><Visibility /></IconButton>
                  <IconButton color="secondary" onClick={() => navigate('/reports/generate')}><Download /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};
