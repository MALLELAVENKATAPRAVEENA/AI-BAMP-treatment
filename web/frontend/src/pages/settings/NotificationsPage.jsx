import React from 'react';
import { Box, Card, CardContent, Typography, FormControlLabel, Switch, Button } from '@mui/material';
import { Header } from '../../components/common/Header';

export const NotificationsPage = () => {
  return (
    <Box>
      <Header
        title="Notification Preferences"
        subtitle="Configure email and system notifications for OTP alerts, prediction results, and audit logs."
      />

      <Card sx={{ p: 3, maxWidth: 650, borderRadius: '16px' }}>
        <CardContent display="flex" flexDirection="column" gap={2}>
          <FormControlLabel control={<Switch defaultChecked />} label="Email OTP Authentication Verification Alerts" />
          <FormControlLabel control={<Switch defaultChecked />} label="AI BAMP Prediction Result Notifications" />
          <FormControlLabel control={<Switch defaultChecked />} label="System Audit Log Compliance Alerts" />
          <Button variant="contained" sx={{ mt: 3, width: 'fit-content' }}>
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
