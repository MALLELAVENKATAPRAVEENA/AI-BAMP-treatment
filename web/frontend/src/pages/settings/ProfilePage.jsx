import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, Avatar,
  IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { AccountCircle, PhotoCamera, Delete, Lock, DeleteSweep } from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuthContext } from '../../context/AuthContext';

export const ProfilePage = () => {
  const { user, token } = useAuth();
  const { loginUser } = useAuthContext();
  const { showNotification } = useNotification();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [hospitalName, setHospitalName] = useState(user?.hospitalName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch live user profile from Firestore on mount
    api.get('/users/profile')
      .then(res => {
        if (res.data?.data) {
          const u = res.data.data;
          setFullName(u.fullName || '');
          setMobileNumber(u.mobileNumber || '');
          setHospitalName(u.hospitalName || '');
          setAvatarUrl(u.avatarUrl || null);
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName,
        mobileNumber,
        hospitalName,
        avatarUrl
      };
      if (password) payload.password = password;

      const res = await api.put('/users/profile', payload);
      if (res.data?.data) {
        loginUser(res.data.data, token);
      }
      showNotification('User profile updated successfully in Firebase Firestore', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showNotification(err.message || 'Profile update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    try {
      await api.post('/admin/clear-demo-data');
      showNotification('All demo and test data wiped from Firebase Firestore!', 'success');
      setClearDialogOpen(false);
      window.location.reload();
    } catch (err) {
      showNotification('Error clearing demo data: ' + err.message, 'error');
    }
  };

  return (
    <Box>
      <Header
        title="Practitioner Profile Settings"
        subtitle="Manage your clinical profile, hospital affiliation, security credentials, and profile photo."
      />

      <Grid container spacing={3}>
        {/* Left Column: Avatar Card & Roles */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center', borderRadius: '16px' }}>
            <Box position="relative" display="inline-block" mb={2}>
              <Avatar
                src={avatarUrl}
                sx={{ width: 110, height: 110, mx: 'auto', bgcolor: 'primary.main', fontSize: 44, fontWeight: 700 }}
              >
                {!avatarUrl && (fullName ? fullName.charAt(0).toUpperCase() : <AccountCircle sx={{ fontSize: 90 }} />)}
              </Avatar>
              <IconButton
                color="primary"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'background.paper' }
                }}
              >
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                <PhotoCamera />
              </IconButton>
            </Box>

            <Typography variant="h6" fontWeight={700}>
              {fullName || 'Doctor Practitioner'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>

            <Box mt={1.5} display="flex" justifyContent="center" gap={1}>
              <Button size="small" variant="outlined" component="label" startIcon={<PhotoCamera />}>
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </Button>
              {avatarUrl && (
                <Button size="small" variant="outlined" color="error" onClick={handleRemoveAvatar} startIcon={<Delete />}>
                  Remove
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="caption" display="block" color="primary" fontWeight={700}>
              CLINICAL ROLE: {user?.role || 'Orthodontist'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              AFFILIATION: {hospitalName || 'Orthodontic Clinic'}
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            {/* Clear All Demo Data Admin Action */}
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteSweep />}
              onClick={() => setClearDialogOpen(true)}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Clear All Demo Data
            </Button>
          </Card>
        </Grid>

        {/* Right Column: Profile Edit Form */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: '16px' }}>
            <CardContent component="form" onSubmit={handleUpdateProfile}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Personal Information & Hospital Details
              </Typography>
              
              <Grid container spacing= {2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                  />
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
                    label="Hospital / Clinic Name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                <Lock color="primary" /> Security & Password Update
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password (Optional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep existing password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, borderRadius: '12px', fontWeight: 700, px: 4 }}
              >
                {loading ? 'Saving Profile Changes...' : 'Save Profile Changes'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Clear Demo Data Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} paperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Clear All Demo Data from Firebase?
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: '12px', mb: 2 }}>
            This action will permanently wipe all test patients, predictions, uploaded X-rays, and PDF reports from Firebase Firestore.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to start with a completely clean database? Newly created records will be stored directly under your account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClearDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleClearDemoData} color="error" variant="contained" sx={{ borderRadius: '12px', fontWeight: 700 }}>
            Yes, Wipe Demo Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
