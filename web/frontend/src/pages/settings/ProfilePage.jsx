import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Avatar } from '@mui/material';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { AccountCircle } from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';

export const ProfilePage = () => {
  const { user, token } = useAuth();
  const { loginUser } = useAuthContext();
  const { showNotification } = useNotification();

  const [fullName, setFullName] = useState(user?.fullName || 'Dr. Sarah Jenkins');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '+1 555-0199');
  const [hospitalName, setHospitalName] = useState(user?.hospitalName || 'St. Jude Orthodontics');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        fullName,
        mobileNumber,
        hospitalName
      });
      if (res.data) {
        loginUser(res.data, token);
      }
      showNotification('Practitioner profile updated successfully', 'success');
    } catch (err) {
      showNotification(err.message || 'Profile update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Header
        title="Practitioner Profile Settings"
        subtitle="Manage your clinical profile, hospital affiliation, and role permissions."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
            <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              <AccountCircle sx={{ fontSize: 80 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={700}>
              {fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'doctor@bamportho.ai'}
            </Typography>
            <Typography variant="caption" display="block" mt={1} color="primary" fontWeight={700}>
              ROLE: {user?.role || 'Orthodontist'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              {hospitalName}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: '16px' }}>
            <CardContent component="form" onSubmit={handleUpdate}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Account Details & Clinical Affiliation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email Address" defaultValue={user?.email || 'sarah.jenkins@orthocenter.org'} disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hospital Name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} disabled={loading}>
                {loading ? 'Saving Changes...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
