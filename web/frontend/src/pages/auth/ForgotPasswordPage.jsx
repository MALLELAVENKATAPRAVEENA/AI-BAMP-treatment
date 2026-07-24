import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [directResetUrl, setDirectResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showNotification('Please enter your email address', 'warning');
      return;
    }
    setLoading(true);
    setDirectResetUrl(null);

    try {
      // 1. Send via Firebase Client SDK
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (fbErr) {
        console.warn('Firebase Auth email send warning:', fbErr.message);
      }

      // 2. Call backend API for reset link generation
      const res = await forgotPassword({ email });
      if (res.data?.resetLink) {
        setDirectResetUrl(res.data.resetLink);
      }
      setSubmitted(true);
      showNotification('Password reset link generated successfully', 'success');
    } catch (err) {
      showNotification(err.message || 'Request failed. User may not exist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} textAlign="center">
      <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your registered email ID to receive a direct password reset link.
      </Typography>

      {!submitted ? (
        <>
          <TextField
            fullWidth
            type="email"
            label="Requested Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }} disabled={loading}>
            {loading ? 'Dispatching Reset Link...' : 'Send Reset Password Link'}
          </Button>
        </>
      ) : (
        <Box textAlign="left">
          <Alert severity="success" sx={{ my: 2, borderRadius: '12px' }}>
            Password reset link generated for <strong>{email}</strong>.
          </Alert>

          {directResetUrl && (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 1, py: 1.5, borderRadius: '12px', fontWeight: 700 }}
              onClick={() => {
                const url = new URL(directResetUrl);
                navigate(`${url.pathname}${url.search}`);
              }}
            >
              Click Here to Reset Password Now
            </Button>
          )}
        </Box>
      )}

      <Box mt={3}>
        <Link sx={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/login')}>
          Back to Login
        </Link>
      </Box>
    </Box>
  );
};
