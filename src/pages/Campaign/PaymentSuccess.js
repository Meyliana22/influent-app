import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import { FaCheckCircle } from 'react-icons/fa';
import { FileText } from 'lucide-react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function PaymentSuccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const confettiEmojis = ['🎉', '✨', '🎊', '⭐', '💫'];
    const confettiElements = [];
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.innerText = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-20px';
      confetti.style.fontSize = '2rem';
      confetti.style.opacity = '0.8';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }
    const style = document.createElement('style');
    style.innerHTML = `@keyframes fall { to { top: 100vh; transform: rotate(${Math.random() * 360}deg); } }`;
    document.head.appendChild(style);
    return () => {
      confettiElements.forEach(el => el.remove());
      style.remove();
    };
  }, []);

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, Arial, sans-serif', p: 2.5 }}>
      <Paper elevation={6} sx={{ maxWidth: 480, width: '100%', mx: 'auto', bgcolor: COLORS.white, borderRadius: 2.5, boxShadow: 9, p: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Box sx={{ width: 95, height: 95, mx: 'auto', mb: 3, bgcolor: '#43e97b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 4, animation: 'scaleIn 0.5s ease-out' }}>
          <FaCheckCircle style={{ fontSize: '3rem', color: COLORS.white }} />
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1.7, color: COLORS.textPrimary, lineHeight: 1.3 }}>
          Pembayaran Berhasil!
        </Typography>
        <Typography sx={{ fontSize: 16, color: COLORS.textSecondary, mb: 3, lineHeight: 1.6 }}>
          Campaign kamu sedang diproses dan akan segera aktif. Influencer dapat mulai mendaftar ke campaign Anda.
        </Typography>
        <Box sx={{ p: 1.7, bgcolor: COLORS.primaryLight, borderRadius: 2, border: '1px solid rgba(102, 126, 234, 0.2)', mb: 3, textAlign: 'left' }}>
          <Typography sx={{ mb: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <FileText size={17} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Apa selanjutnya?
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.75 }}>
            <li>Influencer akan melihat dan mendaftar ke campaign Anda</li>
            <li>Anda dapat melihat dan memilih influencer yang sesuai</li>
            <li>Campaign akan berjalan sesuai timeline yang ditentukan</li>
          </Box>
        </Box>
        <Stack spacing={1.7} direction="column">
          <Button
            onClick={() => navigate('/campaigns')}
            variant="contained"
            size="medium"
            sx={{
              bgcolor: '#667eea',
              borderRadius: 2,
              fontWeight: 700,
              py: 1.5,
              fontSize: 15,
              boxShadow: 2.5,
              color: '#fff',
              width: '100%',
              textTransform: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#667eea',
                boxShadow: 5,
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          >
            Campaign Saya
          </Button>
          <Button
            onClick={() => navigate(`/campaign/${id}/applicants`)}
            variant="outlined"
            size="medium"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              py: 1.5,
              fontSize: 15,
              borderColor: COLORS.primary,
              color: COLORS.primary,
              bgcolor: 'transparent',
              width: '100%',
              textTransform: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: COLORS.primary,
                color: '#fff',
                borderColor: COLORS.primary
              },
              '&:active': {
                bgcolor: 'transparent',
                color: COLORS.primary
              }
            }}
          >
            Lihat Pelamar
          </Button>
        </Stack>
        <Typography sx={{ mt: 2.5, fontSize: 11, color: COLORS.textLight, lineHeight: 1.5 }}>
          Terima kasih telah menggunakan Influent!<br />
          Notifikasi akan dikirim ketika ada influencer yang mendaftar.
        </Typography>
        <style>{`
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </Paper>
    </Box>
  );
}

export default PaymentSuccess;
