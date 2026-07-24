import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

export const ShapChart = ({ shapData }) => {
  const features = shapData?.features || [
    { name: 'CVM Stage (CVM 3)', impact: 12.4, value: '+12.4%' },
    { name: 'Age (11 yrs)', impact: 3.8, value: '+3.8%' },
    { name: 'ANB Angle (-2.5°)', impact: -2.1, value: '-2.1%' },
    { name: 'Wits Appraisal (-3.2mm)', impact: -1.5, value: '-1.5%' },
    { name: 'FMA Angle (24.5°)', impact: 0.9, value: '+0.9%' }
  ];

  return (
    <Card sx={{ p: 2, borderRadius: '16px' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={1}>
          SHAP (SHapley Additive exPlanations) Summary Plot
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Quantifies how individual patient clinical parameters shift the base population probability towards success (+) or risk (-).
        </Typography>

        <Box height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={features} margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" unit="%" />
              <YAxis dataKey="name" type="category" width={160} style={{ fontSize: '12px' }} />
              <Tooltip />
              <ReferenceLine x={0} stroke="#666" />
              <Bar dataKey="impact" fill="#0f52ba" radius={[0, 4, 4, 0]} name="SHAP Contribution %" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Table size="small" sx={{ mt: 3 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Clinical Feature Factor</strong></TableCell>
              <TableCell align="right"><strong>SHAP Value Impact</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right" sx={{ color: row.impact >= 0 ? 'success.main' : 'error.main', fontWeight: 700 }}>
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
