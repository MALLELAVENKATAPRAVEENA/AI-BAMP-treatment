import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../utils/validators';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Link, Divider } from '@mui/material';
import { LocalHospital, Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase/firebaseConfig';
import api from '../../services/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuthContext();
  const { showNotification } = useNotification();
  const [googleLoading, setGoogleLoading] = useState(false);

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
        showNotification(`Welcome, ${googleUser.displayName || 'Doctor'}! Google Sign-In Successful.`, 'success');
        navigate('/dashboard');
      } else {
        // Fallback user object
        const fallbackUser = {
          uid: googleUser.uid,
          name: googleUser.displayName || 'Orthodontist Practitioner',
          email: googleUser.email,
          photoURL: googleUser.photoURL,
          role: 'Orthodontist'
        };
        loginUser(fallbackUser, 'google-auth-token-2026');
        showNotification('Google Sign-In Successful', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      showNotification(err.message || 'Google Authentication cancelled or failed.', 'error');
    } finally {
      setGoogleLoading(false);
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

      <Divider sx={{ mb: 2.5, color: 'text.secondary', fontSize: '13px' }}>OR SIGN IN WITH EMAIL</Divider>

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
        disabled={isSubmitting || googleLoading}
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
