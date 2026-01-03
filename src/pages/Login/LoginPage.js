import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  Fade,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import authService from '../../services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({ email: [], password: [] });

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setEmail(location.state.email);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const newErrors = { email: [], password: [] };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email.push('Email tidak boleh kosong');
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email.push('Format email tidak valid');
      hasError = true;
    }

    if (!password) {
      newErrors.password.push('Kata sandi tidak boleh kosong');
      hasError = true;
    } else if (password.length < 4) {
      newErrors.password.push('Kata sandi minimal 4 karakter');
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;
    
    setIsLoading(true);
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Terjadi kesalahan server. Silakan coba lagi nanti.');
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Gagal masuk');
        error.status = response.status;
        throw error;
      }

      const token = data.data.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      
      const userData = data.data.user;
      const userRole = userData.role;
      const userName = userData.name;
      
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        email: userData.email,
        role: userRole,
        name: userName,
        rememberMe
      }));

      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }

      showToast(`Selamat datang, ${userName}!`, 'success');

      let dashboardPath = '/campaign/dashboard';
      if (userRole === 'admin') dashboardPath = '/admin/dashboard';
      else if (userRole === 'student') dashboardPath = '/student/dashboard';
      else if (userRole === 'umkm' || userRole === 'company') dashboardPath = '/campaign/dashboard';
      
      setTimeout(() => navigate(dashboardPath), 1000);

    } catch (error) {
      console.error("Login Result:", error);
      // Check for 403 Forbidden (Unverified Email)
      const isUnverified = error.status === 403;
      console.log(error)
      // Also fallback to message check just in case legacy or different path
      const isUnverifiedMessage = error.message?.includes('verify your email') || error.message?.includes('not verified'); 

      if (isUnverified || isUnverifiedMessage) {
         setLoginError(
            <Box>
              {error.message}. 
              <Button
                variant="text"
                size="small"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await authService.resendOtp(email);
                    showToast("OTP baru telah dikirim. Silakan cek email Anda.", "success");
                    // Redirect to Register page (step 2) to enter OTP
                    // We default to 'umkm' route but it doesn't matter much since we forced the step
                    setTimeout(() => {
                      navigate('/register/umkm', { 
                        state: { 
                          step: 'otp', 
                          email: email,
                          // Optional: pass a role if we knew it, or default
                          userRole: 'umkm' 
                        } 
                      });
                    }, 1000);
                  } catch (err) {
                    showToast(err.message, "error");
                  } finally {
                     setIsLoading(false);
                  }
                }}
                sx={{ 
                  color: '#d32f2f', 
                  fontWeight: 'bold', 
                  textTransform: 'none', 
                  ml: 1,
                  p: 0,
                  minWidth: 'auto',
                  textDecoration: 'underline',
                  '&:hover': { bgcolor: 'transparent' }
                }}
              >
                Kirim Ulang OTP
              </Button>
            </Box>
         );
      } else {
         setLoginError(error.message || 'Email atau kata sandi salah. Coba lagi.');
      }
      
      showToast('Login gagal.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramLogin = async () => {
    try {
      setIsLoading(true);
      const data = await authService.getInstagramAuthUrl();
      console.log(data);
      if (data && data.data.url) {
        console.log(data.data.url);
        window.location.href = data.data.url;
      } else {
        throw new Error('URL otorisasi tidak valid');
      }
    } catch (error) {
      console.error('Instagram auth error:', error);
      showToast('Gagal memulai login Instagram', 'error');
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9ff 0%, #fef5ff 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2,
      fontFamily: "'Montserrat', sans-serif"
    }}>
      <Fade in={true} timeout={800}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(110, 0, 190, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              position: 'relative'
            }}
          >
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ 
                position: 'absolute', 
                top: 20, 
                left: 20,
                color: 'text.secondary'
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
                Selamat Datang
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Silakan masuk untuk melanjutkan
              </Typography>
            </Box>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                {successMessage}
              </Alert>
            )}

            {loginError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  placeholder="Masukkan email anda"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLoginError('');
                    if (errors.email.length > 0) setErrors({ ...errors, email: [] });
                  }}
                  error={errors.email.length > 0}
                  helperText={errors.email[0]}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                    color: '#6E00BE',
                    textColor: '#6E00BE',
                    
                    sx: { borderRadius: '12px' }
                  }}
                />

                <TextField
                  fullWidth
                  label="Kata Sandi"
                  placeholder="Masukkan kata sandi anda"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                    if (errors.password.length > 0) setErrors({ ...errors, password: [] });
                  }}
                  error={errors.password.length > 0}
                  helperText={errors.password[0]}
                  disabled={isLoading}
                 
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    color: '#6E00BE',
                    textColor: '#6E00BE',
                    sx: { borderRadius: '12px' }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* <FormControlLabel
                    control={
                      <Checkbox 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ color: '#6E00BE', '&.Mui-checked': { color: '#6E00BE' } }}
                      />
                    }
                    label={<Typography variant="body2" color="text.secondary">Ingat saya</Typography>}
                  /> */}
                  <Link 
                    component="button" 
                    type="button" 
                    onClick={() => navigate('/forget-password')} 
                    underline="hover" 
                    sx={{ color: '#6E00BE', fontWeight: 600, fontSize: '0.9rem' }}
                  >
                    Lupa kata sandi?
                  </Link>
                </Box>

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    bgcolor: '#6E00BE',
                    color: '#fff',
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(110, 0, 190, 0.4)',
                    '&:hover': {
                      bgcolor: '#5a009e',
                      boxShadow: '0 12px 24px rgba(110, 0, 190, 0.5)',
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Masuk Sekarang'}
                </Button>

                <Box sx={{ position: 'relative', my: 2 }}>
                  <Divider sx={{ my: 1 }}>
                    <Typography variant="caption" color="text.secondary" px={1}>
                      ATAU
                    </Typography>
                  </Divider>
                </Box>
{/*                 
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  startIcon={<InstagramIcon />}
                  onClick={handleInstagramLogin}
                  disabled={isLoading}
                  sx={{
                    borderColor: '#E1306C',
                    color: '#E1306C',
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#C13584',
                      bgcolor: 'rgba(225, 48, 108, 0.04)',
                    }
                  }}
                >
                  Login with Instagram
                </Button> */}

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Daftar sebagai UMKM?{' '}
                    <Button 
                      variant="text" 
                      onClick={() => {
                        navigate('/register/umkm');
                        sessionStorage.removeItem('registrationState');
                      }}
                      sx={{ 
                        fontWeight: 600, 
                        color: '#6E00BE', 
                        textTransform: 'none', 
                        minWidth: 'auto', 
                        p: 0,
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } 
                      }}
                    >
                      Klik disini
                    </Button>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Daftar sebagai Influencer?{' '}
                    <Button 
                      variant="text" 
                      onClick={() => {
                        navigate('/register/influencer');
                        sessionStorage.removeItem('registrationState');
                      }}
                      sx={{ 
                        fontWeight: 600, 
                        color: '#6E00BE', 
                        textTransform: 'none', 
                        minWidth: 'auto', 
                        p: 0,
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } 
                      }}
                    >
                      Klik disini
                    </Button>
                  </Typography>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
}

export default LoginPage;
