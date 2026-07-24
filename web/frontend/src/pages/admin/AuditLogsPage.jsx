import React, { useEffect, useState } from 'react';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { Header } from '../../components/common/Header';
import { getAuditLogs } from '../../services/aiService';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([
    { id: '1', timestamp: new Date().toISOString(), userName: 'Dr. Sarah Jenkins', role: 'Orthodontist', action: 'PATIENT_CREATE', details: 'Added PAT-2026-001' },
    { id: '2', timestamp: new Date().toISOString(), userName: 'System Admin', role: 'Administrator', action: 'USER_LOGIN', details: 'Authenticated successfully' }
  ]);

  useEffect(() => {
    getAuditLogs()
      .then((res) => {
        if (res.data && res.data.length > 0) setLogs(res.data);
      })
      .catch((err) => console.warn(err));
  }, []);

  return (
    <Box>
      <Header
        title="Immutable System Audit Logs"
        subtitle="Full audit trail of user actions, patient access, AI model runs, and document exports."
      />

      <Card sx={{ borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Timestamp</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Action Code</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell sx={{ fontSize: '12px' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{log.userName}</TableCell>
                <TableCell><Chip label={log.role} size="small" variant="outlined" /></TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};
