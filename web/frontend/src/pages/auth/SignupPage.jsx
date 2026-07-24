import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema } from '../../utils/validators';
import { Box, Typography, TextField, MenuItem, Button, Link, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLES } from '../../utils/constants';

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
      role: ROLES.ORTHODONTIST,
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const res = await register(data);
      if (res.data?.token && res.data?.user) {
        loginUser(res.data.user, res.data.token);
      }
      showNotification('Registration Successful', 'success');
      navigate('/dashboard');
    } catch (err) {
      showNotification(err.message || 'Registration Failed', 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="center" mb={1}>
        Create Medical Account
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

        <Grid item xs={12}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Role Category">
                <MenuItem value={ROLES.ORTHODONTIST}>Orthodontist</MenuItem>
                <MenuItem value={ROLES.RESEARCHER}>Researcher</MenuItem>
                <MenuItem value={ROLES.ADMINISTRATOR}>Administrator</MenuItem>
              </TextField>
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

      <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2 }} disabled={isSubmitting}>
        {isSubmitting ? 'Registering Account...' : 'Register Account'}
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
