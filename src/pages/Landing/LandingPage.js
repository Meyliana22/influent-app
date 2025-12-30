import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Stack,
  useTheme,
  useMediaQuery,
  Link,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import logo from '../../assets/logo.svg';
import personDashboard from '../../assets/dashboard/person.svg';
import personInfluent from '../../assets/dashboard/person_influent.svg';
import searchIcon from '../../assets/dashboard/searchIcon.svg';
import accountIcon from '../../assets/dashboard/account.svg';
import collabIcon from '../../assets/dashboard/collab.svg';
import filterIcon from '../../assets/dashboard/filter.svg';
import paymentIcon from '../../assets/dashboard/payment.svg';
import reviewIcon from '../../assets/dashboard/review.svg';
import chatIcon from '../../assets/dashboard/chat.svg';
import logoFooter from '../../assets/dashboard/footerLogo.svg';
import emailIcon from '../../assets/dashboard/email.svg';
import phoneIcon from '../../assets/dashboard/phone.svg';
import locationIcon from '../../assets/dashboard/location.svg';

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Tentang', href: '#tentang' },
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Mengapa Influent?', href: '#mengapa' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
         <img src={logo} alt="Influent" style={{ height: '28px' }} />
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component="a" href={item.href} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
             <ListItemButton onClick={() => navigate('/login')} sx={{ justifyContent: 'center' }}>
                <ListItemText primary="Masuk" sx={{ color: '#6E00BE', fontWeight: 600 }} />
             </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ fontFamily: 'Montserrat, Arial, sans-serif', bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      {/* Header with Glassmorphism */}
      <AppBar 
        position="sticky" 
        elevation={scrolled ? 4 : 0}
        sx={{ 
          bgcolor: '#F8F9FA' ,
          // backdropFilter: scrolled ? 'blur(20px)' : 'none',
          // transition: 'all 0.3s ease',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          py: 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="Influent" style={{ height: '32px' }} />
            </Box>
            
            {isMobile ? (
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Stack direction="row" spacing={4} alignItems="center">
                {navItems.map((item) => (
                  <Link 
                    key={item.label} 
                    href={item.href} 
                    underline="none" 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: '0.95rem', 
                      color: scrolled ? 'text.primary' : (scrolled ? 'text.primary' : '#333'), // Depending on hero bg coverage, keep text contrasting
                      '&:hover': { color: '#6E00BE' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#6E00BE',
                    borderColor: '#6E00BE',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    borderWidth: '2px',
                    '&:hover': {
                      bgcolor: 'rgba(110, 0, 190, 0.04)',
                      borderColor: '#6E00BE',
                      borderWidth: '2px'
                    }
                  }}
                >
                  Masuk
                </Button>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, borderTopRightRadius: 16, borderBottomRightRadius: 16 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Hero Section - Flat White */}
      <Box sx={{
        bgcolor: '#ffffff',
        pt: { xs: 8, md: 15 },
        pb: { xs: 10, md: 20 },
        color: '#1a1a1a',
        position: 'relative',
        overflow: 'hidden',
        mt: -10 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6} >
              <Grow in={true} timeout={1000}>
                <Box>
                  <Typography variant="h2" component="h1" fontWeight={800} sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, mb: 3, lineHeight: 1.1, color: '#1a1a1a' }}>
                    PLATFORM KOLABORASI <Box component="span" sx={{ color: '#6E00BE' }}>UMKM</Box> & <Box component="span" sx={{ color: '#6E00BE' }}>MAHASISWA</Box>
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, mb: 5, color: '#666', lineHeight: 1.6, maxWidth: '600px' }}>
                    Temukan partner ideal untuk promosi digital yang efektif. Hubungkan potensi mahasiswa dengan kebutuhan bisnis UMKM.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register/umkm')}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: '#6E00BE',
                        color: '#fff',
                        fontWeight: 700,
                        px: 4,
                        py: 1.8,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: 'none', // Flat
                        '&:hover': {
                          bgcolor: '#5a009e',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Daftar Sebagai UMKM
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/register/influencer')}
                      sx={{
                        color: '#6E00BE',
                        borderColor: '#6E00BE',
                        borderWidth: 2,
                        fontWeight: 700,
                        px: 4,
                        py: 1.8,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          borderColor: '#5a009e',
                          bgcolor: 'rgba(110, 0, 190, 0.05)',
                          borderWidth: 2
                        }
                      }}
                    >
                      Daftar Sebagai Influencer
                    </Button>
                  </Stack>
                </Box>
              </Grow>
            </Grid>
            {!isMobile && (
              <Grid item md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={personDashboard}
                  alt="Dashboard"
                  sx={{
                    width: '100%',
                    maxWidth: 550,
                    height: 'auto'
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Tentang Kami Section */}
      <Box component="section" id="tentang" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
           <Grid container spacing={8} alignItems="center">
             {!isMobile && (
               <Grid item md={5}>
                 <Box
                    sx={{
                      borderRadius: '32px',
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(110, 0, 190, 0.1)',
                      transform: 'rotate(-3deg)',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'rotate(0deg) scale(1.02)' }
                    }}
                 >
                    <Box component="img" src={personInfluent} alt="About Us" sx={{ width: '100%', height: 'auto', display: 'block' }} />
                 </Box>
               </Grid>
             )}
             <Grid item xs={12} md={7} >
                <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 1.5 }}>
                  TENTANG KAMI
                </Typography>
                <Typography variant="h3" component="h2" fontWeight={800} color="text.primary" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 3, mt: 1 }}>
                   Membangun Ekosistem Digital
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  Influent adalah jembatan inovatif yang menghubungkan aspirasi bisnis UMKM dengan kreativitas mahasiswa. 
                  Platform kami dirancang untuk menciptakan simbiosis mutualisme yang mendorong pertumbuhan ekonomi lokal.
                </Typography>
                {/* <Grid container spacing={4} sx={{ mt: 2 }}>
                  {[
                    { number: '1000+', label: 'UMKM Terdaftar' },
                    { number: '5000+', label: 'Influencer Mahasiswa' },
                  ].map((stat, idx) => (
                    <Grid item key={idx}>
                      <Typography variant="h4" fontWeight={800} color="primary">{stat.number}</Typography>
                      <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    </Grid>
                  ))}
                </Grid> */}
             </Grid>
           </Grid>
        </Container>
      </Box>

      {/* Cara Kerja Section */}
      <Box component="section" id="cara-kerja" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" fontWeight={800} color="text.primary" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1 }}>
              Cara Kerja
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
             {[
               { icon: accountIcon, title: "1. Buat Akun", text: "Daftar instan sebagai UMKM atau Mahasiswa dengan verifikasi cepat." },
               { icon: searchIcon, title: "2. Eksplorasi Campaign", text: "Temukan atau buat campaign yang sesuai dengan niche dan target audience." },
               { icon: collabIcon, title: "3. Mulai Kolaborasi", text: "Jalin kerjasama, pantau performa, dan selesaikan pembayaran dengan aman." }
             ].map((step, index) => (
                <Grid item xs={12} md={8} key={index}>
                  <Card 
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: '24px',
                      bgcolor: '#fff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid #eee',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                        borderColor: 'primary.main',
                        zIndex: 1
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        bgcolor: 'primary.50', // Requires theme setup or use alpha
                        background: 'rgba(110, 0, 190, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                      }}>
                        <Box component="img" src={step.icon} sx={{ width: '50%', height: '50%' }} alt={step.title} />
                      </Box>
                      <Typography variant="h5" component="h3" fontWeight={700} gutterBottom sx={{ color: '#2d3748' }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {step.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
             ))}
          </Grid>
        </Container>
      </Box>

      {/* Mengapa Influent Section */}
      <Box component="section" id="mengapa" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" component="h2" fontWeight={800} color="text.primary" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
               Mengapa Memilih Influent?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
              Fitur unggulan yang dirancang untuk memaksimalkan hasil kolaborasi Anda.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { icon: filterIcon, title: "Smart Filtering", text: "Filter canggih untuk menemukan influencer berdasarkan demografi, minat, dan engagement rate.", color: '#E3F2FD' },
              { icon: paymentIcon, title: "Secure Payment", text: "Sistem Escrow menjamin keamanan dana hingga kewajiban kedua belah pihak terpenuhi.", color: '#F3E5F5' },
              { icon: chatIcon, title: "Integrated Chat", text: "Komunikasi seamless tanpa perlu keluar platform. Diskusi brief dan revisi jadi lebih terorganisir.", color: '#E8F5E9' },
              { icon: reviewIcon, title: "Trust System", text: "Review dan rating transparan membangun ekosistem kepercayaan yang solid.", color: '#FFF3E0' },
            ].map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%', 
                    borderRadius: '24px', 
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s',
                    '&:hover': {
                       boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                       borderColor: 'transparent',
                       transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 64,
                      height: 64,
                      bgcolor: '#F3E5F5', // Light purple background
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Box component="img" src={item.icon} sx={{ width: 32, height: 32 }} alt={item.title} />
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h3" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section - Flat Purple */}
      <Box sx={{
        py: { xs: 8, md: 12 },
        bgcolor: '#6E00BE',
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Typography variant="h3" component="h2" fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 3 }}>
            Siap Menciptakan Dampak?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, mb: 6, opacity: 0.9, lineHeight: 1.6 }}>
            Bergabunglah dengan ribuan UMKM dan Mahasiswa yang telah sukses berkolaborasi di Influent.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => navigate('/register-umkm')}
              sx={{
                bgcolor: '#ffffff',
                color: '#6E00BE',
                fontWeight: 700,
                px: 5,
                py: 2,
                borderRadius: '12px',
                fontSize: '1.1rem',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#f3f3f3' }
              }}
            >
              Mulai Sekarang
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: '#fff', color: '#2d3748', py: 8, borderTop: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid item xs={12} md={4}>
               <Box component="img" src={logo} alt="Influent" sx={{ height: 32, mb: 3 }} />
               <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                 Influent adalah platform pionir yang menghubungkan UMKM Indonesia dengan potensi tak terbatas dari mahasiswa berbakat untuk akselerasi digital.
               </Typography>
               <Stack direction="row" spacing={2}>
                 {/* Social Media Icons placeholders */}
                 {[1, 2, 3].map((i) => (
                   <Box key={i} sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#6E00BE', color: '#fff' }, transition: 'all 0.2s' }}>
                      <Box component="span" sx={{ fontSize: 14 }}>●</Box>
                   </Box>
                 ))}
               </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
               <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>Platform</Typography>
               <Stack spacing={1.5}>
                 {['Tentang Kami', 'Cara Kerja', 'Mengapa Influent?', 'Biaya'].map((text, idx) => (
                   <Link key={idx} href="#" color="text.secondary" underline="none" sx={{ '&:hover': { color: '#6E00BE' } }}>
                     {text}
                   </Link>
                 ))}
               </Stack>
            </Grid>
            {/* <Grid item xs={12} md={2}>
               <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>Dukungan</Typography>
               <Stack spacing={1.5}>
                 {['Pusat Bantuan', 'Syarat & Ketentuan', 'Kebijakan Privasi', 'Hubungi Kami'].map((text, idx) => (
                   <Link key={idx} href="#" color="text.secondary" underline="none" sx={{ '&:hover': { color: '#6E00BE' } }}>
                     {text}
                   </Link>
                 ))}
               </Stack>
            </Grid> */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2 }}>Hubungi Kami</Typography>
              <Stack spacing={2}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(110,0,190,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E00BE' }}>
                       <img src={emailIcon} alt="" style={{ width: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                      <Typography variant="body2" fontWeight={600}>info@influent.id</Typography>
                    </Box>
                 </Box>
                 {/* Add more contacts similarly */}
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ borderTop: '1px solid #eee', mt: 8, pt: 4, textAlign: 'center' }}>
             <Typography variant="body2" color="text.secondary">© 2025 Influent. All rights reserved.</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
