import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  StepLabel,
  MenuItem,
  FormControl,
  InputLabel,
  Select 
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
  VpnKey,
  CalendarMonth,
  Grade,
  People as PeopleIcon,
  Instagram,
  Home,
  Wc,
  Category,
  CloudUpload,
  Badge
} from '@mui/icons-material';
import authService from '../../services/authService';
import studentService from '../../services/studentService';
import companyService from '../../services/companyService';

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useParams();
  const { showToast } = useToast();
  const [step, setStep] = useState('register'); // register, otp, onboarding, upload_ktm
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  
  // Initialize role based on URL param or pathname
  const [userRole, setUserRole] = useState(() => {
    if (location.pathname === '/register-umkm') return 'umkm';
    if (role && role.toLowerCase() === 'umkm') return 'umkm';
    return 'influencer';
  });

  // Update active step index for Stepper
  useEffect(() => {
    if (step === 'register') setActiveStepIndex(0);
    else if (step === 'otp') setActiveStepIndex(1);
    else if (step === 'onboarding') setActiveStepIndex(2);
    else if (step === 'upload_ktm') setActiveStepIndex(3);
  }, [step]);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: '',
    university: '',  
    companyName: '',
    major: '',
    year: '',
    gpa: '',
    instagram_username: '',
    // New Fields
    domicile: '',
    age: '',
    gender: '',
    instagram_profile_link: '',
    content_category: '',
    instagram_followers_count: '',
    ktmFile: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Restore state logic (simplified for cleaner readability)
  // Update userRole if URL changes (e.g. navigation between register pages)
  useEffect(() => {
    if (location.pathname === '/register-umkm') {
      setUserRole('umkm');
    } else if (role) {
      setUserRole(role.toLowerCase() === 'umkm' ? 'umkm' : 'influencer');
    }
  }, [location.pathname, role]);

  useEffect(() => {
    // Check for navigation state first (priority over session storage)
    if (location.state?.step && location.state?.email) {
      setStep(location.state.step);
      setFormData(prev => ({ ...prev, email: location.state.email }));
      return; 
    }

    const savedState = sessionStorage.getItem('registrationState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        
        // Validation: Verify if stored role matches current URL role
        const currentUrlRole = (location.pathname === '/register-umkm' || role?.toLowerCase() === 'umkm') ? 'umkm' : 'influencer';
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
  }, [location.pathname, role]);

  useEffect(() => {
    const stateToSave = {
      step,
      userRole,
      formData: {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone
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
      setErrorMsg("Kata sandi tidak sama");
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
       // Check if error is related to unverified email (400 with message or 403)
       // Check if error is related to unverified email (400 with message or 403)
       // Relaxed check: 403 implies unverified, 409 implies exists.
       const isEmailProblem = 
          error.status === 403 || 
          error.status === 409 ||
          error.message?.toLowerCase().includes('already exists') || 
          error.message?.toLowerCase().includes('sudah terdaftar') ||
          error.message?.toLowerCase().includes('verify') ||
          error.message?.toLowerCase().includes('verifikasi');
       
       if (isEmailProblem) {
         // Ask user if they want to resend OTP
         setErrorMsg(
           <Box>
             Email sudah terdaftar. 
             <Button 
               size="small" 
               sx={{ color: '#d32f2f', fontWeight: 'bold', textDecoration: 'underline', ml: 1, p: 0, minWidth: 'auto', textTransform: 'none' }}
               onClick={async () => {
                 try {
                   setIsLoading(true);
                   await authService.resendOtp(formData.email);
                   showToast("OTP baru telah dikirim ke email Anda", "success");
                   setStep('otp');
                 } catch (resendError) {
                   showToast(resendError.message || "Gagal mengirim ulang OTP", "error");
                 } finally {
                   setIsLoading(false);
                 }
               }}
             >
               Kirim Ulang OTP?
             </Button>
           </Box>
         );
       } else {
         setErrorMsg(error.message || "Registrasi gagal");
       }
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic steps based on role
  const steps = userRole === 'umkm' 
    ? ['Daftar', 'Verifikasi'] 
    : ['Daftar', 'Verifikasi', 'Profil', 'Unggah KTM'];

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const verifyResponse = await authService.verifyEmail(formData.email, formData.otp);
      showToast("Verifikasi berhasil!", "success");
      
      // If we have a password (normal registration flow) or if we got a token, proceed
      if (formData.password || localStorage.getItem('token')) {
        // No need to login again if verifyEmail returned token
        // const loginResponse = await authService.login(formData.email, formData.password);
        
        // Update userRole based on actual registered role from backend
        let currentRole = userRole;
        // Check structure: verifyResponse.data.user.role based on user snippet
        const userData = verifyResponse.data?.user;
        
        if (userData?.role) {
           const backendRole = userData.role;
           currentRole = backendRole === 'student' ? 'influencer' : 'umkm';
           setUserRole(currentRole);
        }

        // For UMKM: Auto-create profile and finish (Skip Step 3)
        if (currentRole === 'umkm') {
            try {
                await companyService.createProfile({
                    business_name: formData.username, // Use the name from Step 1 as Business Name
                    phone_number: formData.phone
                });
                showToast("Registrasi Selesai!", "success");
                sessionStorage.removeItem('registrationState');
                setTimeout(() => {
                    navigate('/campaign/dashboard');
                }, 500);
            } catch (profileError) {
                console.error(profileError);
                // Even if profile creation fails slightly, try to redirect or show error
                showToast("Gagal menyimpan profil otomatis", "warning");
                navigate('/campaign/dashboard');
            }
        } else {
            // For Influencer: Proceed to Step 3 (Onboarding)
            setStep('onboarding');
        }

      } else {
        // If no password (flow from Login -> Resend OTP), redirect to login
        showToast("Silakan login dengan akun Anda", "success");
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      setErrorMsg(error.message || "Verifikasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboarding = async (e) => {
    e.preventDefault();
    console.log("handleOnboarding triggered");
    
    setIsLoading(true);
    try {
      if (userRole === 'influencer') {
        // Step 3: Update Profile
        const payload = {
          university: formData.university,
          major: formData.major,
          year: formData.year,
          gpa: formData.gpa,
          instagram_username: formData.instagram_username, // Keeping original field if backend still uses it, or map to new logic
          domicile: formData.domicile,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          instagram_profile_link: formData.instagram_profile_link,
          content_category: formData.content_category,
          instagram_followers_count: parseInt(formData.instagram_followers_count, 10),
          phone_number: formData.phone
        };
        console.log("Sending Influencer Profile Payload:", payload);
        
        await studentService.createProfile(payload);
        showToast("Profil berhasil disimpan!", "success");
        setStep('upload_ktm'); // Move to Step 4

      } else if (userRole === 'umkm') { // UMKM finishes here
        const payload = {
          business_name: formData.companyName,
          phone_number: formData.phone
        };
        console.log("Sending UMKM Payload:", payload);

        await companyService.createProfile(payload);
        showToast("Registrasi Selesai!", "success");
        sessionStorage.removeItem('registrationState');
        setTimeout(() => {
            navigate('/campaign/dashboard');
        }, 500);
      }
    } catch (error) {
       console.error("Error in handleOnboarding:", error);
       setErrorMsg("Gagal menyimpan profil: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadKtm = async (e) => {
    e.preventDefault();
    if (!formData.ktmFile) {
        setErrorMsg("Silakan pilih file KTM terlebih dahulu");
        return;
    }

    setIsLoading(true);
    try {
        await studentService.uploadKtm(formData.ktmFile);
        showToast("Registrasi Selesai!", "success");
        sessionStorage.removeItem('registrationState');
        setTimeout(() => {
            navigate('/student/dashboard');
        }, 500);
    } catch (error) {
        console.error("Error uploading KTM:", error);
        setErrorMsg("Gagal mengupload KTM: " + (error.message || "Unknown error"));
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setFormData({ ...formData, ktmFile: file });
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
              onClick={() => {
                if (step === 'register') navigate('/');
                else if (step === 'otp') setStep('register');
                else if (step === 'onboarding') setStep('otp');
                else if (step === 'upload_ktm') setStep('onboarding');
              }}
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
                 {step === 'upload_ktm' && 'Upload foto KTM Anda untuk verifikasi'}
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
                    label={userRole === 'umkm' ? "Nama Usaha" : "Nama Lengkap"}
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
                    label="Kata Sandi"
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
                    label="Konfirmasi Kata Sandi"
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

             {/* Step 3: Profiling Form */}
             {step === 'onboarding' && (
              <form onSubmit={handleOnboarding}>
                <Stack spacing={3}>
                  {userRole === 'influencer' ? (
                    <>
                    {/* New Fields */}
                    <TextField
                      fullWidth
                      label="Domisili"
                      name="domicile"
                      value={formData.domicile}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Jakarta Selatan"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                          '&:hover fieldset': { borderColor: '#6E00BE' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Home sx={{ color: '#6E00BE' }} /></InputAdornment>,
                        sx: { borderRadius: '12px' }
                      }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                           fullWidth
                           label="Umur"
                           name="age"
                           type="number"
                           value={formData.age}
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
                               startAdornment: <InputAdornment position="start"><CalendarMonth sx={{ color: '#6E00BE' }} /></InputAdornment>,
                               sx: { borderRadius: '12px' }
                           }}
                        />
                         <FormControl fullWidth required>
                            <InputLabel id="gender-label" sx={{ '&.Mui-focused': { color: '#6E00BE' } }}>Jenis Kelamin</InputLabel>
                            <Select
                                labelId="gender-label"
                                name="gender"
                                value={formData.gender}
                                label="Jenis Kelamin"
                                onChange={handleChange}
                                disabled={isLoading}
                                sx={{
                                    borderRadius: '12px',
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6E00BE' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6E00BE' }
                                }}
                                startAdornment={<InputAdornment position="start"><Wc sx={{ color: '#6E00BE', ml: 1 }} /></InputAdornment>}
                            >
                                <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                                <MenuItem value="Perempuan">Perempuan</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                      fullWidth
                      label="Link Profil Instagram"
                      name="instagram_profile_link"
                      value={formData.instagram_profile_link}
                      onChange={handleChange}
                      required
                      placeholder="https://instagram.com/username"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                          '&:hover fieldset': { borderColor: '#6E00BE' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Instagram sx={{ color: '#6E00BE' }} /></InputAdornment>,
                        sx: { borderRadius: '12px' }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Jumlah Followers Instagram"
                      name="instagram_followers_count"
                      type="number"
                      value={formData.instagram_followers_count}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: 1000"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                          '&:hover fieldset': { borderColor: '#6E00BE' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PeopleIcon sx={{ color: '#6E00BE' }} /></InputAdornment>,
                        sx: { borderRadius: '12px' }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Kategori Konten"
                      name="content_category"
                      value={formData.content_category}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Lifestyle"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                          '&:hover fieldset': { borderColor: '#6E00BE' }
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Category sx={{ color: '#6E00BE' }} /></InputAdornment>,
                        sx: { borderRadius: '12px' }
                      }}
                    />

                    {/* Existing Fields (Retained) */}
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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Jurusan"
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        required
                        placeholder="Contoh: Ilmu Komputer"
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
                      <TextField
                        fullWidth
                        label="Tahun Angkatan"
                        name="year"
                        type="number"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        placeholder="2023"
                        disabled={isLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                            '&:hover fieldset': { borderColor: '#6E00BE' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CalendarMonth sx={{ color: '#6E00BE' }} /></InputAdornment>,
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                         <TextField
                            fullWidth
                            label="IPK"
                            name="gpa"
                            value={formData.gpa}
                            onChange={handleChange}
                            required
                            placeholder="3.50"
                            disabled={isLoading}
                            inputProps={{ step: "0.01", min: "0", max: "4.00" }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                                '&:hover fieldset': { borderColor: '#6E00BE' }
                              },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Grade sx={{ color: '#6E00BE' }} /></InputAdornment>,
                              sx: { borderRadius: '12px' }
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Instagram Username"
                            name="instagram_username"
                            value={formData.instagram_username}
                            onChange={handleChange}
                            required
                            placeholder="@username"
                            disabled={isLoading}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                                '&:hover fieldset': { borderColor: '#6E00BE' }
                              },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><Instagram sx={{ color: '#6E00BE' }} /></InputAdornment>,
                              sx: { borderRadius: '12px' }
                            }}
                          />
                    </Box>
                    </>
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
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : (userRole === 'influencer' ? 'Lanjut' : 'Simpan Profil')}
                  </Button>
                </Stack>
              </form>
             )}

            {/* Step 4: Upload KTM */}
            {step === 'upload_ktm' && (
                <form onSubmit={handleUploadKtm}>
                    <Stack spacing={4} alignItems="center">
                        <Box sx={{
                            width: '100%',
                            height: 200,
                            border: '2px dashed #6E00BE',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: 'rgba(110, 0, 190, 0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: 'rgba(110, 0, 190, 0.1)' }
                        }}>
                             <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="ktm-file-upload"
                                type="file"
                                onChange={handleFileChange}
                              />
                             <label htmlFor="ktm-file-upload" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                 {formData.ktmFile ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Badge badgeContent="✓" color="success">
                                            <CloudUpload sx={{ fontSize: 48, color: '#6E00BE', mb: 1 }} />
                                        </Badge>
                                        <Typography variant="body1" fontWeight={600}>
                                            {formData.ktmFile.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Klik untuk mengganti
                                        </Typography>
                                    </Box>
                                 ) : (
                                    <>
                                        <CloudUpload sx={{ fontSize: 48, color: '#6E00BE', mb: 1 }} />
                                        <Typography variant="h6" color="#6E00BE" fontWeight={600}>
                                            Upload Foto KTM
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Klik atau drag file ke sini
                                        </Typography>
                                    </>
                                 )}
                             </label>
                        </Box>
                        
                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={isLoading || !formData.ktmFile}
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
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Selesai & Masuk Dashboard'}
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
            
            {step === 'register' && userRole === 'influencer' && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Daftar sebagai UMKM?{' '}
                   <Button 
                      variant="text" 
                      onClick={() => {
                        navigate('/register-umkm');
                        setUserRole('umkm');
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
            )}

            {step === 'register' && userRole === 'umkm' && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Daftar sebagai Influencer?{' '}
                   <Button 
                      variant="text" 
                      onClick={() => {
                        navigate('/register/influencer');
                        setUserRole('influencer');
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
            )}
            
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
}

export default RegisterPage;
