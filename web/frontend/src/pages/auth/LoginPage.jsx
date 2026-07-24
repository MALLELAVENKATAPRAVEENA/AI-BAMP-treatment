import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../utils/validators';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Link } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuthContext();
  const { showNotification } = useNotification();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      if (res.data?.token && res.data?.user) {
        loginUser(res.data.user, res.data.token);
        showNotification('Orthodontist Sign In Successful', 'success');
        navigate('/dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      const msg = err.message || 'Sign In Failed';
      if (msg.includes('Password')) {
        showNotification('Invalid Password', 'error');
      } else if (msg.includes('Not Found')) {
        showNotification('User Account Not Found. Please Register First.', 'error');
      } else {
        showNotification(msg, 'error');
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Box textAlign="center" mb={3}>
        <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" fontWeight={700} color="primary.main">
          AI BAMP Outcome Predictor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Class III Malocclusion Clinical Portal
        </Typography>
      </Box>

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Email Address"
            placeholder="doctor@orthocenter.org"
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
        <FormControlLabel control={<Checkbox defaultChecked color="primary" />} label="Remember Me" />
        <Link sx={{ cursor: 'pointer', fontSize: 14, fontWeight: 700 }} onClick={() => navigate('/forgot-password')}>
          Forgot Password?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Authenticating Credentials...' : 'Sign In to Portal'}
      </Button>

      <Box textAlign="center" mt={3}>
        <Typography variant="body2">
          Don't have an Orthodontist account?{' '}
          <Link sx={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/signup')}>
            Register Account
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
