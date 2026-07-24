import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser } = useAuthContext();
  const { showNotification } = useNotification();

  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      showNotification('Please enter the full 6-digit OTP', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({ email, otp });
      loginUser(res.data.user, res.data.token);
      showNotification('Login Successful', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message;
      if (msg.includes('Expired')) {
        showNotification('OTP Expired', 'error');
      } else if (msg.includes('Invalid OTP')) {
        showNotification('Invalid OTP', 'error');
      } else if (msg.includes('Not Found')) {
        showNotification('User Not Found', 'error');
      } else {
        showNotification(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email });
      showNotification('A fresh OTP has been sent to your email', 'info');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleVerify} textAlign="center">
      <Typography variant="h5" fontWeight={700} color="primary.main" mb={1}>
        Email OTP Verification
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Please enter the 6-digit OTP dispatched to <strong>{email || 'your email'}</strong>
      </Typography>

      <TextField
        fullWidth
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="123456"
        inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' } }}
        margin="normal"
      />

      <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2 }} disabled={loading}>
        {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
      </Button>

      <Box mt={3}>
        <Typography variant="body2">
          Didn't receive code?{' '}
          <Link sx={{ cursor: 'pointer', fontWeight: 700 }} onClick={handleResend}>
            Resend OTP
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
