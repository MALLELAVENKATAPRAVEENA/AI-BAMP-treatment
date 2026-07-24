import React from 'react';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from '@mui/material';
import { FileDownload, Science } from '@mui/icons-material';
import { Header } from '../../components/common/Header';

export const DatasetExplorerPage = () => {
  const sampleDataset = [
    { id: 'BAMP-1001', age: 10.2, gender: 'Female', cvm: 'CVM 3', anb: -3.3, wits: -4.1, prob: '92.5%', outcome: 'Success' },
    { id: 'BAMP-1002', age: 11.8, gender: 'Male', cvm: 'CVM 4', anb: -5.3, wits: -5.2, prob: '76.4%', outcome: 'Moderate Risk' },
    { id: 'BAMP-1003', age: 9.5, gender: 'Female', cvm: 'CVM 2', anb: -0.6, wits: -2.1, prob: '95.8%', outcome: 'Success' },
    { id: 'BAMP-1004', age: 13.8, gender: 'Male', cvm: 'CVM 5', anb: -7.9, wits: -7.5, prob: '54.2%', outcome: 'High Risk' }
  ];

  return (
    <Box>
      <Header
        title="Class III BAMP Clinical Dataset Explorer"
        subtitle="Explore research cohort features, cephalometric metrics, and outcome ground truth labels."
        action={
          <Button variant="contained" startIcon={<FileDownload />} onClick={() => window.open('http://localhost:5000/api/ai/dataset/export', '_blank')}>
            Export Dataset CSV
          </Button>
        }
      />

      <Card sx={{ borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Subject ID</strong></TableCell>
              <TableCell><strong>Age / Gender</strong></TableCell>
              <TableCell><strong>CVM Stage</strong></TableCell>
              <TableCell><strong>ANB Angle</strong></TableCell>
              <TableCell><strong>Wits Appraisal</strong></TableCell>
              <TableCell><strong>Success Prob</strong></TableCell>
              <TableCell><strong>Outcome Classification</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleDataset.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                <TableCell>{row.age} yrs / {row.gender}</TableCell>
                <TableCell>{row.cvm}</TableCell>
                <TableCell>{row.anb}°</TableCell>
                <TableCell>{row.wits} mm</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{row.prob}</TableCell>
                <TableCell>
                  <Chip
                    label={row.outcome}
                    color={row.outcome === 'Success' ? 'success' : (row.outcome === 'Moderate Risk' ? 'warning' : 'error')}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};
