import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button } from '@mui/material';
import { Header } from '../../components/common/Header';

export const SecurityPage = () => {
  return (
    <Box>
      <Header
        title="Security & Password Governance"
        subtitle="Enforce password policies (7-9 characters, upper/lower, number, special char)."
      />

      <Card sx={{ p: 3, maxWidth: 600, borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Change Account Password
          </Typography>
          <TextField fullWidth type="password" label="Current Password" margin="normal" />
          <TextField fullWidth type="password" label="New Password (7-9 chars)" margin="normal" />
          <TextField fullWidth type="password" label="Confirm New Password" margin="normal" />
          <Button variant="contained" sx={{ mt: 3 }}>
            Update Password
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
