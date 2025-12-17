import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { COLORS } from '../../constants/colors';
import Confetti from 'react-confetti';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [orderId, setOrderId] = useState('');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const order_id = searchParams.get('order_id');
    const transaction_status = searchParams.get('status') || searchParams.get('transaction_status');

    if (order_id) setOrderId(order_id);

    if (transaction_status === 'settlement' || transaction_status === 'capture' || transaction_status === 'success') {
      setStatus('success');
    } else if (transaction_status === 'pending') {
      setStatus('pending');
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  const handleBackToCampaigns = () => {
    navigate('/campaigns');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: COLORS.background,
        fontFamily: 'Montserrat, Arial, sans-serif'
      }}
    >
      {status === 'success' && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />}
      
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
          }}
        >
          {status === 'success' ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 100, color: '#10b981', mb: 2 }} />
          ) : status === 'pending' ? (
            <Box sx={{ fontSize: 80, mb: 2 }}>⏳</Box>
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 100, color: '#ef4444', mb: 2 }} />
          )}

          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: COLORS.textPrimary }}>
            {status === 'success' ? 'Pembayaran Berhasil!' : status === 'pending' ? 'Menunggu Pembayaran' : 'Pembayaran Gagal'}
          </Typography>

          <Typography sx={{ color: COLORS.textSecondary, mb: 4 }}>
            {status === 'success' 
              ? `Terima kasih! Pembayaran Anda untuk Order ID #${orderId} telah berhasil diverifikasi.` 
              : status === 'pending'
              ? `Mohon selesaikan pembayaran Anda untuk Order ID #${orderId}.`
              : `Maaf, pembayaran Anda untuk Order ID #${orderId} gagal. Silakan coba lagi.`}
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleBackToCampaigns}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 2
              }}
            >
              Kembali ke Campaign Saya
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;
