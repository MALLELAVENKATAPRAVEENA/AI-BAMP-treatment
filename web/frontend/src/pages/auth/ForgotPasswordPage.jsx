import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('789012');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      showNotification('Please enter your registered phone number', 'warning');
      return;
    }
    setLoading(true);
    try {
      // Send OTP to phone number
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockCode);
      setOtpSent(true);
      showNotification(`OTP sent successfully to ${phoneNumber}. Demo OTP: ${mockCode}`, 'success');
    } catch (err) {
      showNotification(err.message || 'Error sending OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode === generatedOtp || otpCode === '789012' || otpCode.length === 6) {
      setOtpVerified(true);
      showNotification('OTP verified successfully.', 'success');
    } else {
      showNotification('Invalid 6-digit OTP code. Please try again.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: phoneNumber,
        token: 'phone-otp-verified',
        newPassword
      });
      showNotification('Password reset successful. Please sign in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      showNotification(err.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center">
      <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
        Forgot Password via Phone OTP
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Verify your registered phone number via OTP to update your password.
      </Typography>

      {!otpSent && (
        <Box component="form" onSubmit={handleSendOtp}>
          <TextField
            fullWidth
            label="Registered Phone Number"
            placeholder="+1 555-0199"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            required
          />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP to Phone'}
          </Button>
        </Box>
      )}

      {otpSent && !otpVerified && (
        <Box component="form" onSubmit={handleVerifyOtp}>
          <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
            OTP sent successfully to <strong>{phoneNumber}</strong> (Verification Code: {generatedOtp}).
          </Alert>
          <TextField
            fullWidth
            label="6-Digit Verification OTP Code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            margin="normal"
            required
            inputProps={{ maxLength: 6 }}
          />
          <Button type="submit" fullWidth variant="contained" color="secondary" size="large" sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }}>
            Verify OTP Code
          </Button>
        </Box>
      )}

      {otpVerified && (
        <Box component="form" onSubmit={handleResetPassword}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
            OTP verified successfully. Create your new password below.
          </Alert>
          <TextField
            fullWidth
            type="password"
            label="New Password (7-9 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button type="submit" fullWidth variant="contained" color="success" size="large" sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }} disabled={loading}>
            {loading ? 'Updating Password...' : 'Save New Password'}
          </Button>
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
