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
    if (e) e.preventDefault();
    if (!email) {
      showNotification('Please enter your requested email address', 'warning');
      return;
    }
    setLoading(true);
    setDirectResetUrl(null);

    try {
      // 1. Firebase Client SDK Password Reset Email
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/reset-password`,
          handleCodeInApp: true
        };
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
      } catch (fbErr) {
        console.warn('Firebase Auth email reset warning:', fbErr.message);
      }

      // 2. Call backend service for fallback reset token link
      const res = await forgotPassword({ email });
      if (res.data?.resetLink) {
        setDirectResetUrl(res.data.resetLink);
      }

      setSubmitted(true);
      showNotification('Password reset email sent. Please check your inbox and spam folder.', 'success');
    } catch (err) {
      showNotification(err.message || 'Request failed. User may not exist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center">
      <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your registered email ID to receive password reset instructions.
      </Typography>

      {!submitted ? (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="email"
            label="Requested Email Address"
            placeholder="doctor@orthocenter.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }} disabled={loading}>
            {loading ? 'Dispatching Reset Link...' : 'Send Reset Password Link'}
          </Button>
        </Box>
      ) : (
        <Box textAlign="left">
          <Alert severity="success" sx={{ my: 2, borderRadius: '12px' }}>
            Password reset email sent to <strong>{email}</strong>. Please check your inbox and spam folder.
          </Alert>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            sx={{ mt: 2, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Resending...' : 'Resend Password Reset Email'}
          </Button>

          {directResetUrl && (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 1.5, py: 1.5, borderRadius: '12px', fontWeight: 700 }}
              onClick={() => {
                const url = new URL(directResetUrl, window.location.origin);
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
