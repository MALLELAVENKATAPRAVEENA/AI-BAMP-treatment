import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema } from '../../utils/validators';
import { Box, Typography, TextField, Button, Link, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuthContext();
  const { showNotification } = useNotification();

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
      
      // Trigger Firebase Auth Email Verification if current user is active
      try {
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          console.log(`[Auth Audit] Firebase Auth sendEmailVerification dispatched to: ${data.email}`);
        }
      } catch (verErr) {
        console.warn(`[Auth Audit] Firebase Auth sendEmailVerification warning:`, verErr.message);
      }

      if (res.data?.token && res.data?.user) {
        loginUser(res.data.user, res.data.token);
      }

      showNotification('Verification email sent. Please check your inbox and spam folder.', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error(`[Auth Audit] Registration error:`, err);
      showNotification('Email delivery failed. Please check if the email address is registered.', 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="center" mb={1}>
        Create Orthodontist Account
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        AI BAMP Outcome Assessment Portal
      </Typography>

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

      <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }} disabled={isSubmitting}>
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
