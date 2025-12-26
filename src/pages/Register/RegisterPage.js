import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Stack,
  Fade,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Business,
  School,
  ArrowBack,
  VpnKey
} from '@mui/icons-material';
import authService from '../../services/authService';
import studentService from '../../services/studentService';

function RegisterPage() {
  const navigate = useNavigate();
  const { role } = useParams();
  const { showToast } = useToast();
  const [step, setStep] = useState('register'); // register, otp, onboarding
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  
  // Initialize role directly from URL param
  const [userRole, setUserRole] = useState(() => {
    console.log(role)

    if (!role) {
      navigate('/');
      return;
    }
    const lowerRole = role.toLowerCase();
    console.log(lowerRole)
    if(lowerRole === "umkm") return 'umkm';
    console.log(

    "BUKAN UMKM"
    )

   return 'influencer';
  
  });
  console.log(userRole)

  // Update active step index for Stepper
  useEffect(() => {
    if (step === 'register') setActiveStepIndex(0);
    else if (step === 'otp') setActiveStepIndex(1);
    else if (step === 'onboarding') setActiveStepIndex(2);
  }, [step]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: '',
    university: '',  
    companyName: '' 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Restore state logic (simplified for cleaner readability)
  useEffect(() => {
    const savedState = sessionStorage.getItem('registrationState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        
        // Validation: Verify if stored role matches current URL role
        // This prevents sticky role bug when switching directly from one register page to another
        const currentUrlRole = role?.toLowerCase() === 'umkm' ? 'umkm' : 'influencer';
        const storedRole = parsed.userRole;

        if (storedRole === currentUrlRole) {
          setStep(parsed.step || 'register');
          setUserRole(storedRole);
          setFormData(prev => ({ ...prev, ...parsed.formData }));
        } else {
          // If roles mismatch, clear the stale state
          sessionStorage.removeItem('registrationState');
        }
      } catch (e) {
        sessionStorage.removeItem('registrationState');
      }
    }
  }, [role]); // Add role as dependency to re-run if URL changes

  useEffect(() => {
    const stateToSave = {
      step,
      userRole,
      formData: {
        username: formData.username,
        email: formData.email,
        phone: formData.phone
      }
    };
    sessionStorage.setItem('registrationState', JSON.stringify(stateToSave));
  }, [step, userRole, formData.username, formData.email, formData.phone]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Password tidak sama");
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: userRole === 'umkm' ? 'company' : 'student',
        phone: formData.phone || undefined
      };
      
      await authService.register(payload);
      showToast("Registrasi berhasil! Cek email Anda.", "success");
      setStep('otp');
    } catch (error) {
      setErrorMsg(error.message || "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.verifyEmail(formData.email, formData.otp);
      showToast("Verifikasi berhasil!", "success");
      const loginResponse = await authService.login(formData.email, formData.password);
      
      // Update userRole based on actual registered role from backend
      if (loginResponse.data?.user?.role) {
         const backendRole = loginResponse.data.user.role;
         setUserRole(backendRole === 'student' ? 'influencer' : 'umkm');
      }

      setStep('onboarding');
    } catch (error) {
      setErrorMsg(error.message || "Verifikasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboarding = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (userRole === 'influencer') {
        await studentService.createProfile({
          university: formData.university,
          phone_number: formData.phone
        });
      }
      // UMKM logic handled as per requirement (often auto-handled or simple update)
      
      showToast("Setup profil berhasil!", "success");
      sessionStorage.removeItem('registrationState');
      setTimeout(() => {
        navigate(userRole === 'umkm' ? '/campaign/dashboard' : '/student/dashboard');
      }, 500);
    } catch (error) {
       console.error(error);
       setErrorMsg("Gagal menyimpan profil");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Daftar', 'Verifikasi', 'Profil'];

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
              p: { xs: 4, md: 5 },
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(110, 0, 190, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              position: 'relative'
            }}
          >
             <IconButton 
              onClick={() => step === 'register' ? navigate('/') : setStep(step === 'onboarding' ? 'otp' : 'register')}
              sx={{ 
                position: 'absolute', 
                top: 20, 
                left: 20,
                color: 'text.secondary'
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
              <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
                {step === 'register' && `Daftar ${userRole === 'umkm' ? 'UMKM' : 'Influencer'}`}
                {step === 'otp' && 'Verifikasi Email'}
                {step === 'onboarding' && 'Lengkapi Profil'}
              </Typography>
              <Typography variant="body1" color="text.primary">
                 {step === 'register' && 'Buat akun baru untuk memulai'}
                 {step === 'otp' && `Masukkan kode OTP yang dikirim ke email Anda`}
                 {step === 'onboarding' && 'Lengkapi informasi Anda untuk melanjutkan'}
              </Typography>
            </Box>

            <Stepper 
              activeStep={activeStepIndex} 
              alternativeLabel 
              sx={{ 
                mb: 4,
                '& .MuiStepIcon-root': {
                   color: '#e2e8f0', // Default inactive color
                   '&.Mui-active': { color: '#6E00BE' }, // Active step color
                   '&.Mui-completed': { color: '#6E00BE' }, // Completed step color
                },
                '& .MuiStepLabel-label': {
                   '&.Mui-active': { color: '#6E00BE', fontWeight: 600 },
                   '&.Mui-completed': { color: '#6E00BE' }
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {errorMsg}
              </Alert>
            )}

            {/* Step 1: Register Form */}
            {step === 'register' && (
              <form onSubmit={handleRegister}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                        '&:hover fieldset': { borderColor: '#6E00BE' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person sx={{ color: '#6E00BE' }} /></InputAdornment>,
                      sx: { borderRadius: '12px' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                        '&:hover fieldset': { borderColor: '#6E00BE' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Email sx={{ color: '#6E00BE' }} /></InputAdornment>,
                      sx: { borderRadius: '12px' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="No. Telepon"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                        '&:hover fieldset': { borderColor: '#6E00BE' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#6E00BE' }} /></InputAdornment>,
                      sx: { borderRadius: '12px' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                        '&:hover fieldset': { borderColor: '#6E00BE' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#6E00BE' }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '12px' }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Konfirmasi Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                        '&:hover fieldset': { borderColor: '#6E00BE' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#6E00BE' }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '12px' }
                    }}
                  />
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
                      mt: 1,
                      boxShadow: '0 8px 20px rgba(110, 0, 190, 0.4)',
                      '&:hover': {
                        bgcolor: '#5a009e',
                        boxShadow: '0 12px 24px rgba(110, 0, 190, 0.5)',
                      }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Daftar Sekarang'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* Step 2: OTP Form */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp}>
                <Stack spacing={4}>
                  <TextField
                    fullWidth
                    label="Kode OTP"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan 6 digit kode"
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                        '&:hover fieldset': { borderColor: '#6E00BE' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: '#6E00BE' }} /></InputAdornment>,
                      sx: { borderRadius: '12px', fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center' }
                    }}
                    inputProps={{ style: { textAlign: 'center' } }}
                  />
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
                      '&:hover': { bgcolor: '#5a009e' }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verifikasi OTP'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* Step 3: Onboarding Form */}
            {step === 'onboarding' && (
              <form onSubmit={handleOnboarding}>
                <Stack spacing={3}>
                  {userRole === 'influencer' ? (
                    <TextField
                      fullWidth
                      label="Nama Universitas"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Universitas Indonesia"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                          '&:hover fieldset': { borderColor: '#6E00BE' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><School sx={{ color: '#6E00BE' }} /></InputAdornment>,
                        sx: { borderRadius: '12px' }
                      }}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Nama Usaha"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Toko Kopi Jaya"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                          '&:hover fieldset': { borderColor: '#6E00BE' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Business sx={{ color: '#6E00BE' }} /></InputAdornment>,
                        sx: { borderRadius: '12px' }
                      }}
                    />
                  )}
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
                      mt: 1,
                      boxShadow: '0 8px 20px rgba(110, 0, 190, 0.4)',
                      '&:hover': { bgcolor: '#5a009e' }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Simpan Profil'}
                  </Button>
                </Stack>
              </form>
            )}
            
            {step === 'register' && (
               <Box sx={{ textAlign: 'center', mt: 3 }}>
                 <Typography variant="body2" color="text.secondary">
                   Sudah punya akun?{' '}
                   <Button 
                      variant="text" 
                      onClick={() => navigate('/login')}
                      sx={{ 
                        fontWeight: 600, 
                        color: '#6E00BE', 
                        textTransform: 'none', 
                        minWidth: 'auto', 
                        p: 0,
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } 
                      }}
                   >
                     Masuk disini
                   </Button>
                 </Typography>
               </Box>
            )}
            
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
}

export default RegisterPage;
