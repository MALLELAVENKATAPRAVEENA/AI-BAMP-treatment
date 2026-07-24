import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showNotification('Please enter your email address', 'warning');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSubmitted(true);
      showNotification('Password reset link sent to your email', 'success');
    } catch (err) {
      showNotification(err.message || 'Request failed', 'error');
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

          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2 }} disabled={loading}>
            {loading ? 'Dispatching Reset Link...' : 'Send Reset Password Link'}
          </Button>
        </>
      ) : (
        <Alert severity="success" sx={{ my: 2, textAlign: 'left', borderRadius: '12px' }}>
          Password reset link has been sent to <strong>{email}</strong>. Please check your email inbox to reset your password.
        </Alert>
      )}

      <Box mt={3}>
        <Link sx={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/login')}>
          Back to Login
        </Link>
      </Box>
    </Box>
  );
};
