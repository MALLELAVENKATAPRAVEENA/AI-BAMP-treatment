import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotification();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email, token, newPassword });
      showNotification('Password Reset Successful. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" fontWeight={700} color="primary.main" textAlign="center" mb={1}>
        Reset Account Password
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Passwords must be 7-9 chars long with Upper, Lower, Digit, & Special characters.
      </Typography>

      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        margin="normal"
      />

      <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.2 }} disabled={loading}>
        {loading ? 'Updating Password...' : 'Reset Password'}
      </Button>
    </Box>
  );
};
