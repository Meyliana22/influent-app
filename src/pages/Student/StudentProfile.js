import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  TextField,
  ThemeProvider,
  createTheme,
  Grid,
  Avatar,
  IconButton,
  InputAdornment,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Instagram,
  School,
  Person,
  Phone,
  Grade
} from '@mui/icons-material';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { useToast } from '../../hooks/useToast';
import studentService from '../../services/studentService';
import authService from '../../services/authService';

const theme = createTheme({
  palette: {
    primary: { main: '#6E00BE' },
    secondary: { main: '#5a009e' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

const API_BASE_URL = 'http://localhost:8000/api/uploads';

const getImageUrl = (imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('http')) return imageName;
  return `${API_BASE_URL}/${imageName}`;
};

function StudentProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    university: '',
    major: '',
    year: '',
    phone_number: '',
    gpa: '',
    instagram: '',
    user: {
      name: '',
      email: '',
      profile_image: null
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getProfile();
      if (data && data.data) {
        // Handle date conversion for "year" input
        let yearVal = '';
        if (data.data.year) {
          const date = new Date(data.data.year);
          yearVal = date.toISOString().split('T')[0];
        }

        setFormData({
          ...data.data,
          year: yearVal,
          user: data.data.user || {}
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // showToast("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await studentService.updateProfileImage(file);
      showToast("Gambar profil berhasil diperbarui", "success");
      // Update local state to show new image immediately
      // Assuming res.data contains the new image path or user object
      fetchProfile(); 
    } catch (error) {
      showToast(error.message || "Gagal mengunggah gambar", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Prepare payload - only send student fields
      const payload = {
        university: formData.university,
        major: formData.major,
        year: formData.year,
        phone_number: formData.phone_number,
        gpa: formData.gpa,
        instagram: formData.instagram
      };

      await studentService.updateProfile(payload);
      showToast("Profil berhasil diperbarui", "success");
    } catch (error) {
      showToast(error.message || "Gagal memperbarui profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectInstagram = async () => {
    try {
      setLoading(true);
      const data = await authService.getInstagramAuthUrl();
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL otorisasi tidak valid');
      }
    } catch (error) {
      console.error('Instagram connect error:', error);
      showToast('Gagal memulai koneksi Instagram', 'error');
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box sx={{ flex: 1, ml: { md: '260px' }, width: { xs: '100%', md: 'calc(100% - 260px)' } }}>
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          
          <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#111827' }}>
              Profil Saya
            </Typography>

            <Grid container spacing={4}>
              {/* Profile Image Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar
                      src={getImageUrl(formData.user.profile_image)}
                      alt={formData.user.name}
                      sx={{ width: 120, height: 120, border: '4px solid #fff', boxShadow: '0 0 0 4px #e5e7eb', mx: 'auto' }}
                    />
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'white',
                        boxShadow: 2,
                        '&:hover': { bgcolor: '#f3f4f6' }
                      }}
                    >
                      <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {formData.user.name || 'Nama Siswa'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.user.email || 'email@example.com'}
                  </Typography>
                </Card>
              </Grid>

              {/* Instagram Integration Card */}
              <Grid item xs={12} md={4}>
                  <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Instagram sx={{ color: '#E1306C' }} /> Integrasi Instagram
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {formData.instagram_username ? (
                      <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                                src={formData.instagram_profile_picture_url} 
                                sx={{ width: 56, height: 56, mr: 2, border: '2px solid #E1306C' }}
                            >
                                {formData.instagram_username.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">@{formData.instagram_username}</Typography>
                                <Chip 
                                  label="Terhubung" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined" 
                                  sx={{ height: 20, fontSize: '0.7rem' }} 
                                />
                            </Box>
                          </Box>
                          
                          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Box sx={{ textAlign: 'center', flex: 1, bgcolor: '#fdf2f8', p: 1, borderRadius: 2 }}>
                                <Typography variant="h6" fontWeight="bold" color="#E1306C">
                                  {formData.instagram_followers_count || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Pengikut</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1, bgcolor: '#f0f9ff', p: 1, borderRadius: 2 }}>
                                <Typography variant="h6" fontWeight="bold" color="#0ea5e9">
                                  {formData.instagram_media_count || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Postingan</Typography>
                            </Box>
                          </Stack>
                          
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            color="error"
                            size="small"
                            disabled
                            sx={{ textTransform: 'none' }}
                          >
                            Putuskan Akun (Hubungi Dukungan)
                          </Button>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Hubungkan akun Instagram Anda untuk menunjukkan statistik Anda kepada merek dan melamar kampanye.
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<Instagram />}
                            onClick={handleConnectInstagram}
                            disabled={loading}
                            sx={{ 
                                bgcolor: '#E1306C', 
                                color: '#fff',
                                textTransform: 'none',
                                fontWeight: 700,
                                '&:hover': { bgcolor: '#C13584' }
                            }}
                          >
                            {loading ? 'Menghubungkan...' : 'Hubungkan Instagram'}
                          </Button>
                      </Box>
                    )}
                  </Card>
              </Grid>

              {/* Profile Form */}
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <School color="primary" /> Informasi Akademik
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Universitas"
                          name="university"
                          value={formData.university || ''}
                          onChange={handleChange}
                          placeholder="e.g. Universitas Indonesia"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Jurusan"
                          name="major"
                          value={formData.major || ''}
                          onChange={handleChange}
                          placeholder="e.g. Computer Science"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tahun Angkatan"
                          type="date"
                          name="year"
                          value={formData.year || ''}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="IPK"
                          name="gpa"
                          type="number"
                          inputProps={{ step: "0.01", min: "0", max: "4" }}
                          value={formData.gpa || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Grade fontSize="small" /></InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person color="primary" /> Informasi Pribadi
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nomor Telepon"
                          name="phone_number"
                          value={formData.phone_number || ''}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Instagram Username"
                          name="instagram"
                          value={formData.instagram || ''}
                          onChange={handleChange}
                          placeholder="@username"
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><Instagram fontSize="small" /></InputAdornment>,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          startIcon={<Save />}
                          disabled={loading}
                          sx={{ 
                            borderRadius: 2,
                            px: 4,
                            bgcolor: '#6E00BE', // Primary color
                            '&:hover': { bgcolor: '#5b21b6' }
                          }}
                        >
                          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default StudentProfile;
