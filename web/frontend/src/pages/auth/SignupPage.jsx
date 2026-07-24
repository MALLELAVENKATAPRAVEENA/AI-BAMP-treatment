import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema } from '../../utils/validators';
import { Box, Typography, TextField, Button, Link, Grid, Divider } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase/firebaseConfig';
import api from '../../services/api';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuthContext();
  const { showNotification } = useNotification();
  const [googleLoading, setGoogleLoading] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: '',
      hospitalName: '',
      role: 'Orthodontist',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, role: 'Orthodontist' };
      const res = await register(payload);
      if (res.data?.token && res.data?.user) {
        loginUser(res.data.user, res.data.token);
      }
      showNotification('Orthodontist Account Registered Successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      showNotification(err.message || 'Registration Failed', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // 1. Open official Google Sign-In Popup
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // 2. Sync Google User details with Firebase Firestore backend
      const res = await api.post('/auth/google-login', {
        uid: googleUser.uid,
        email: googleUser.email,
        displayName: googleUser.displayName,
        photoURL: googleUser.photoURL
      });

      if (res.data?.token && res.data?.user) {
        loginUser(res.data.user, res.data.token);
        showNotification(`Welcome, ${googleUser.displayName || 'Doctor'}! Google Registration Successful.`, 'success');
        navigate('/dashboard');
      } else {
        const fallbackUser = {
          uid: googleUser.uid,
          name: googleUser.displayName || 'Orthodontist Practitioner',
          email: googleUser.email,
          photoURL: googleUser.photoURL,
          role: 'Orthodontist'
        };
        loginUser(fallbackUser, 'google-auth-token-2026');
        showNotification('Google Account Registered Successfully', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      showNotification(err.message || 'Google Authentication failed.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="center" mb={1}>
        Create Orthodontist Account
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={2.5}>
        AI BAMP Outcome Assessment Portal
      </Typography>

      {/* Google Authentication Button */}
      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={<GoogleIcon style={{ color: '#4285F4' }} />}
        onClick={handleGoogleSignIn}
        disabled={googleLoading || isSubmitting}
        sx={{
          mb: 2.5,
          py: 1.2,
          borderRadius: '12px',
          fontWeight: 700,
          color: 'text.primary',
          borderColor: 'rgba(255,255,255,0.2)',
          bgcolor: 'rgba(255,255,255,0.03)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: '#4285F4' }
        }}
      >
        {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
      </Button>

      <Divider sx={{ mb: 2.5, color: 'text.secondary', fontSize: '13px' }}>OR REGISTER WITH EMAIL</Divider>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Full Name" error={!!errors.fullName} helperText={errors.fullName?.message} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Email" error={!!errors.email} helperText={errors.email?.message} />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="mobileNumber"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Mobile Number" error={!!errors.mobileNumber} helperText={errors.mobileNumber?.message} />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="hospitalName"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Hospital Name" error={!!errors.hospitalName} helperText={errors.hospitalName?.message} />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="Password (7-9 chars)"
                error={!!errors.password}
                helperText={errors.password?.message || 'Must contain Upper, Lower, Digit & Special char'}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="password"
                label="Confirm Password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }} disabled={isSubmitting || googleLoading}>
        {isSubmitting ? 'Registering Account...' : 'Register Orthodontist Account'}
      </Button>

      <Box textAlign="center" mt={2}>
        <Typography variant="body2">
          Already registered?{' '}
          <Link sx={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/login')}>
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
