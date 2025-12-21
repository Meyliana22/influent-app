import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { COLORS } from '../../constants/colors';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Token verifikasi tidak ditemukan');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi gagal');
      }

      setSuccess(true);
      setMessage(data.message || 'Email berhasil diverifikasi! Silakan login.');
      
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Terjadi kesalahan saat verifikasi email');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleResendClick = () => {
    // Navigate to a resend verification page or show a form
    navigate('/resend-verification');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9ff 0%, #fef5ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: '20px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(110, 0, 190, 0.15)',
            boxShadow: '0 20px 60px rgba(110, 0, 190, 0.15)'
          }}
        >
          {loading ? (
            <Stack spacing={3} alignItems="center">
              <CircularProgress size={60} sx={{ color: '#6E00BE' }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1f36' }}>
                Memverifikasi Email...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Mohon tunggu sebentar
              </Typography>
            </Stack>
          ) : success ? (
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36' }}>
                Verifikasi Berhasil!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                {message}
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={handleLoginClick}
                sx={{
                  mt: 2,
                  py: 1.5,
                  px: 4,
                  background: '#6E00BE',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(110, 0, 190, 0.4)',
                  '&:hover': {
                    background: '#5a009e',
                    boxShadow: '0 6px 20px rgba(110, 0, 190, 0.5)',
                  }
                }}
              >
                Masuk ke Akun
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ErrorIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36' }}>
                Verifikasi Gagal
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                {error}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleResendClick}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: '#6E00BE',
                    color: '#6E00BE',
                    '&:hover': {
                      borderColor: '#5a009e',
                      background: 'rgba(110, 0, 190, 0.04)',
                    }
                  }}
                >
                  Kirim Ulang Email
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleLoginClick}
                  sx={{
                    py: 1.5,
                    px: 4,
                    background: '#6E00BE',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(110, 0, 190, 0.4)',
                    '&:hover': {
                      background: '#5a009e',
                      boxShadow: '0 6px 20px rgba(110, 0, 190, 0.5)',
                    }
                  }}
                >
                  Kembali ke Login
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Email Icon Decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.1,
              transform: 'rotate(-15deg)'
            }}
          >
            <EmailIcon sx={{ fontSize: 120, color: '#6E00BE' }} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default VerifyEmailPage;
