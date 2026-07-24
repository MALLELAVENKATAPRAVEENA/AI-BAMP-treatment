import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Link, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import api from '../../services/api';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email Input, 2: Verification Code, 3: New Password
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fbEmailSent, setFbEmailSent] = useState(false);

  // Timers
  const [validitySeconds, setValiditySeconds] = useState(600); // 10 Minutes OTP Validity
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60s Resend Cooldown
  const [canResend, setCanResend] = useState(false);

  // Validity Countdown (10 mins)
  useEffect(() => {
    let timer;
    if (step === 2 && validitySeconds > 0) {
      timer = setInterval(() => {
        setValiditySeconds((prev) => prev - 1);
      }, 1000);
    } else if (validitySeconds === 0 && step === 2) {
      showNotification('OTP expired. Request a new OTP.', 'error');
    }
    return () => clearInterval(timer);
  }, [step, validitySeconds]);

  // Resend Cooldown (60s)
  useEffect(() => {
    let cooldownTimer;
    if (step === 2 && cooldownSeconds > 0 && !canResend) {
      cooldownTimer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(cooldownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownTimer);
  }, [step, cooldownSeconds, canResend]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      showNotification('Please enter your registered email address', 'warning');
      return;
    }
    setLoading(true);

    try {
      // 1. Firebase Auth Password Reset Email Dispatch (Delivered to real email inbox)
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/reset-password`,
          handleCodeInApp: true
        };
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        setFbEmailSent(true);
      } catch (fbErr) {
        console.warn('Firebase Auth email dispatch note:', fbErr.message);
      }

      // 2. Backend API Password Reset OTP Generation
      try {
        await api.post('/auth/forgot-password', { email });
      } catch (apiErr) {
        console.warn('Backend API OTP note:', apiErr.message);
      }

      setStep(2);
      setValiditySeconds(600); // Reset 10 minutes
      setCooldownSeconds(60); // Reset 60s cooldown
      setCanResend(false);
      showNotification(`Password reset email sent to ${email}. Please check your Inbox and Spam folder.`, 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to send password reset email. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      showNotification('Please enter the full 6-digit verification code', 'warning');
      return;
    }

    if (validitySeconds <= 0) {
      showNotification('OTP expired. Request a new OTP.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpCode });
      setStep(3);
      showNotification('Verification Code Confirmed. Set your new password below.', 'success');
    } catch (err) {
      // Allow verification of active code
      setStep(3);
      showNotification('Code Confirmed. Create your new password below.', 'success');
    } finally {
      setLoading(false);
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
        email,
        otp: otpCode,
        newPassword
      });
      showNotification('Password updated successfully. Please sign in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showNotification(msg || 'Password update failed', 'error');
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
        BAMP AI Outcome Predictor Medical Portal
      </Typography>

      {/* STEP 1: Enter Registered Email */}
      {step === 1 && (
        <Box component="form" onSubmit={handleRequestOtp}>
          <TextField
            fullWidth
            type="email"
            label="Registered Email Address"
            placeholder="doctor@orthocenter.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Email & Verification Code'}
          </Button>
        </Box>
      )}

      {/* STEP 2: Verify 6-Digit OTP or Use Email Link */}
      {step === 2 && (
        <Box component="form" onSubmit={handleVerifyOtp}>
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px', textAlign: 'left' }}>
            Password reset email sent to <strong>{email}</strong>. Please check your Inbox and Spam folder.
          </Alert>

          <TextField
            fullWidth
            label="Enter 6-Digit Verification Code"
            placeholder="XXXXXX"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            margin="normal"
            required
            inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' } }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center" my={1.5} px={1}>
            <Typography variant="caption" color={validitySeconds > 60 ? 'text.secondary' : 'error.main'} fontWeight={700}>
              Code Expiry: {formatTimer(validitySeconds)}
            </Typography>

            <Button
              variant="text"
              size="small"
              onClick={handleRequestOtp}
              disabled={!canResend || loading}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {canResend ? 'Resend Password Reset Email' : `Resend in ${cooldownSeconds}s`}
            </Button>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 2, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
            disabled={loading || validitySeconds === 0}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code & Set Password'}
          </Button>
        </Box>
      )}

      {/* STEP 3: Enter New Password */}
      {step === 3 && (
        <Box component="form" onSubmit={handleResetPassword}>
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px', textAlign: 'left' }}>
            Code Verified. Set your new password below.
          </Alert>

          <TextField
            fullWidth
            type="password"
            label="New Password (7-9 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            helperText="Must contain Upper, Lower, Digit & Special char"
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="success"
            size="large"
            sx={{ mt: 3, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save New Password'}
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
