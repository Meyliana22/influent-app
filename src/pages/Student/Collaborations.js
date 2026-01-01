import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../../components/common';
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Badge,
  ThemeProvider,
  createTheme,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import {
  ArrowForwardIos,
  CheckCircle,
  Pending,
  Cancel,
  AccessTime,
  CheckCircleOutline,
  TrendingUp,
  Star,
  ChatBubble,
  AccountBalanceWallet,
  Campaign,
  CalendarToday,
  MonetizationOn,
  Description,
  Assignment
} from '@mui/icons-material';
import { COLORS } from '../../constants/colors';
import SubmitWork from './SubmitWork';

// Mock data for collaborations
const mockCollaborations = {
  upcoming: [
    {
      id: 0,
      title: 'Holiday Campaign 2024',
      brand: 'GiftBox Inc.',
      status: 'upcoming',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      type: 'Instagram & TikTok',
      compensation: 'Rp 7.500.000',
      requirements: '3 posts, 5 stories, 2 reels',
      brandLogo: 'https://via.placeholder.com/40/ff9900/ffffff',
      description: 'Promote our holiday collection across Instagram and TikTok platforms.',
      progress: 0,
      completedTasks: 0,
      totalTasks: 10
    }
  ],
  ongoing: [
    {
      id: 1,
      title: 'Summer Collection 2024',
      brand: 'FashionNova',
      status: 'ongoing',
      startDate: '2024-06-15',
      endDate: '2024-07-15',
      type: 'Instagram Post',
      compensation: 'Rp 5.000.000',
      requirements: '2 posts, 3 stories',
      brandLogo: 'https://via.placeholder.com/40',
      description: 'Promote our new summer collection with 2 feed posts and 3 stories.',
      progress: 40, // 40% completed
      completedTasks: 2, // 2 out of 5 tasks completed
      totalTasks: 5
    },
    {
      id: 2,
      title: 'Tech Gadgets Review',
      brand: 'TechHaven',
      status: 'ongoing',
      startDate: '2024-06-20',
      endDate: '2024-07-10',
      type: 'YouTube Video',
      compensation: 'Rp 8.000.000',
      requirements: '1 video (5-10 min)',
      brandLogo: 'https://via.placeholder.com/40/cccccc/ffffff',
      description: 'Create an honest review video of our latest tech gadgets.',
      progress: 25, // 25% completed
      completedTasks: 1, // 1 out of 4 tasks completed
      totalTasks: 4
    }
  ],
  completed: [
    {
      id: 3,
      title: 'Winter Fashion Week',
      brand: 'TrendCo',
      type: 'Fashion',
      status: 'completed',
      startDate: '2025-01-15',
      endDate: '2025-02-28',
      compensation: '$1,800',
      requirements: '10 Instagram stories, 2 reels',
      description: 'Showcase winter collection through creative influencer content.',
      brandLogo: 'https://via.placeholder.com/100',
      progress: 100,
      rating: 4.7,
      messages: 0,
    },
  ],
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#6E00BE',
      dark: '#5a009e',
      light: '#f3e5f5',
    },
    secondary: {
      main: '#2d8659',
    },
  },
});

function Collaborations() {
  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Akan Datang', 'Sedang Berlangsung', 'Selesai'];
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [showSubmitWork, setShowSubmitWork] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [applications, setApplications] = useState([
    { id: 'app-1', title: 'Summer Collection 2024', brand: 'FashionNova', status: 'pending', appliedAt: '2024-06-10' },
    { id: 'app-2', title: 'Tech Gadgets Review', brand: 'TechHaven', status: 'accepted', appliedAt: '2024-06-05' },
    { id: 'app-3', title: 'Holiday Campaign 2024', brand: 'GiftBox Inc.', status: 'rejected', appliedAt: '2024-05-20' },
  ]);
  const [appFilter, setAppFilter] = useState('all');

  const handleFilter = (status) => {
    // toggle filter: clicking same status will reset to 'all'
    setAppFilter((prev) => (prev === status ? 'all' : status));
  };
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedCollaboration(null);
    setShowSubmitWork(false);
  };

  const handleCollaborationClick = (collaboration) => {
    setSelectedCollaboration(collaboration);
  };

  const handleBackToList = () => {
    setSelectedCollaboration(null);
    setShowSubmitWork(false);
  };

  const handleSubmitWorkClick = () => {
    setShowSubmitWork(true);
  };

  const handleOpenApplications = () => setApplicationsOpen(true);
  const handleCloseApplications = () => setApplicationsOpen(false);

  const handleBackFromSubmit = () => {
    setShowSubmitWork(false);
  };

  const renderCollaborationList = (collaborations) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr' },
        gap: 3,
        mt: 0.5,
      }}
    >
      {collaborations.map((collab) => (
        <Box key={collab.id}>
          <Card
            sx={{
              borderRadius: '16px',
              border: 'none',
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #6E00BE 0%, #5a009e 100%)',
              },
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.12)',
              },
            }}
          >
            <CardActionArea onClick={() => handleCollaborationClick(collab)} sx={{ p: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5} alignItems="flex-start">
                  <Grid item>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={collab.brandLogo}
                        alt={collab.brand}
                        sx={{
                          width: 56,
                          height: 56,
                          borderBottom: '3px solid #6E00BE',
                          boxShadow: '0 4px 12px rgba(110, 0, 190, 0.1)',
                        }}
                      />
                      {(collab.status === 'ongoing' || collab.status === 'upcoming') && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 16,
                            height: 16,
                            backgroundColor: '#2d8659',
                            borderRadius: '50%',
                            border: '3px solid #f8f9fa',
                          }}
                        />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#1a1a2e',
                          fontSize: '1.1rem',
                          mb: 0.5,
                        }}
                      >
                        {collab.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6c757d',
                          fontSize: '0.9rem',
                        }}
                      >
                        {collab.brand} · {collab.type}
                      </Typography>
                    </Box>

                    {(collab.status === 'ongoing' || collab.status === 'upcoming') && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.75rem' }}>
                            Kemajuan
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6E00BE', fontWeight: 600, fontSize: '0.75rem' }}>
                            {collab.progress}% ({collab.completedTasks}/{collab.totalTasks} tasks)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={collab.progress}
                          sx={{
                            height: 6,
                            borderRadius: '3px',
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              background: '#6E00BE',
                            },
                          }}
                        />
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <AccessTime sx={{ fontSize: '1rem', color: '#6E00BE', opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ color: '#6c757d' }}>
                        {new Date(collab.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(collab.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs="auto" sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 'auto', justifyContent: 'flex-end' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#6c757d', display: 'block', mb: 0.5 }}>
                        Kompensasi
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#6E00BE',
                          fontSize: '1.1rem',
                        }}
                      >
                        {collab.compensation}
                      </Typography>
                    </Box>


                    {collab.messages > 0 && (
                      <Badge
                        badgeContent={collab.messages}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: '#d32f2f',
                            color: '#fff',
                            fontWeight: 600,
                          },
                        }}
                      >
                        <ChatBubble sx={{ fontSize: '1.4rem', color: '#6E00BE' }} />
                      </Badge>
                    )}

                    <ArrowForwardIos
                      sx={{
                        fontSize: '1rem',
                        color: '#6E00BE',
                        opacity: 0.5,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      ))}
    </Box>
  );

  const renderCollaborationDetail = (collab) => (
    <Box>
      <Button
        startIcon={
          <ArrowForwardIos sx={{ transform: 'rotate(180deg)', fontSize: '0.9rem' }} />
        }
        onClick={handleBackToList}
        sx={{
          mb: 3,
          color: '#6E00BE',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(110, 0, 190, 0.05)',
          },
        }}
      >
        Kembali ke Daftar
      </Button>

      <Stack spacing={3}>
         {/* 1. Header Section */}
         <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
            <Avatar
              src={collab.brandLogo}
              alt={collab.brand}
              sx={{
                width: 72,
                height: 72,
                borderBottom: '3px solid #6E00BE',
                boxShadow: '0 4px 12px rgba(110, 0, 190, 0.1)',
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                    {collab.title}
                  </Typography>
                   <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {collab.brand}
                      </Typography>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {collab.type}
                      </Typography>
                   </Stack>
                </Box>
                <Chip
                  label={
                    collab.status === 'upcoming' ? 'Akan Datang' :
                    collab.status === 'ongoing' ? 'Sedang Berlangsung' : 'Selesai'
                  }
                  sx={{
                    background: 
                      collab.status === 'upcoming' ? '#fff7ed' :
                      collab.status === 'ongoing' ? '#eff6ff' : 
                      '#f0fdf4',
                    color: 
                      collab.status === 'upcoming' ? '#c2410c' :
                      collab.status === 'ongoing' ? '#1d4ed8' : 
                      '#15803d',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor:
                      collab.status === 'upcoming' ? '#ffedd5' :
                      collab.status === 'ongoing' ? '#dbeafe' : 
                      '#dcfce7',
                  }}
                />
              </Box>
            </Box>
         </Box>

         {/* 2. Main Content Grid */}
         <Grid container spacing={3} alignItems="stretch">
            {/* Left Col: Detail Dokumen */}
            <Grid item xs={12} md={7}>
               <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                       <Description sx={{ fontSize: 18, color: '#64748b' }} />
                       <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Detail Kampanye</Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                     <Stack spacing={3}>
                        <Box>
                           <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 1, display: 'block' }}>DESKRIPSI</Typography>
                           <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                              {collab.description}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 1, display: 'block' }}>PERSYARATAN</Typography>
                           <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <Stack spacing={1}>
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                   <Assignment sx={{ fontSize: 18, color: '#6E00BE', mt: 0.3 }} />
                                   <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                                      {collab.requirements}
                                   </Typography>
                                </Box>
                              </Stack>
                           </Box>
                        </Box>
                     </Stack>
                  </Box>
               </Card>
            </Grid>

            {/* Right Col: Timeline & Compensation */}
            <Grid item xs={12} md={5}>
               <Stack spacing={3} sx={{ height: '100%' }}>
                  <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', flex: 1 }}>
                     <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                           <CalendarToday sx={{ fontSize: 18, color: '#64748b' }} />
                           <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Timeline</Typography>
                        </Stack>
                     </Box>
                     <Box sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                             <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#eff6ff', color: '#3b82f6', height: 'fit-content' }}>
                               <Campaign sx={{ fontSize: 20 }} />
                             </Box>
                             <Box>
                               <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>PERIODE</Typography>
                               <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                  {new Date(collab.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} -{' '}
                                  {new Date(collab.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                               </Typography>
                             </Box>
                        </Box>
                     </Box>
                  </Card>

                  <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', bgcolor: '#F3F0FF', borderColor: '#E9D5FF' }}>
                     <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 700, letterSpacing: 1 }}>KOMPENSASI</Typography>
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                           <MonetizationOn sx={{ color: '#6E00BE', fontSize: 24 }} />
                           <Typography variant="h5" sx={{ fontWeight: 800, color: '#6E00BE' }}>
                             {collab.compensation}
                           </Typography>
                        </Stack>
                     </Box>
                  </Card>
               </Stack>
            </Grid>
         </Grid>

         {/* 3. Actions */}
          {collab.status === 'ongoing' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mt: 2, 
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: '#fff'
              }}
            >
               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ChatBubble />}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#e2e8f0',
                      color: '#475569',
                      '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                    }}
                  >
                    Pesan Merek
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Assignment />}
                    onClick={handleSubmitWorkClick}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#6E00BE',
                      '&:hover': { bgcolor: '#5a009e' }
                    }}
                  >
                    Kirim Pekerjaan
                  </Button>
               </Stack>
            </Paper>
          )}
      </Stack>
    </Box>
  );

  const renderApplicationsDialog = () => (
    <Dialog open={applicationsOpen} onClose={handleCloseApplications} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Lamaran Saya</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`Semua (${applications.length})`}
            color="primary"
            clickable
            onClick={() => handleFilter('all')}
            variant={appFilter === 'all' ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer', '& .MuiChip-label': { fontWeight: 800 } }}
          />
          <Chip
            label={`Tertunda (${applications.filter((a) => a.status === 'pending').length})`}
            color="warning"
            clickable
            onClick={() => handleFilter('pending')}
            variant={appFilter === 'pending' ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer', '& .MuiChip-label': { fontWeight: 800 } }}
          />
          <Chip
            label={`Diterima (${applications.filter((a) => a.status === 'accepted').length})`}
            color="success"
            clickable
            onClick={() => handleFilter('accepted')}
            variant={appFilter === 'accepted' ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer', '& .MuiChip-label': { fontWeight: 800 } }}
          />
          <Chip
            label={`Ditolak (${applications.filter((a) => a.status === 'rejected').length})`}
            color="default"
            clickable
            onClick={() => handleFilter('rejected')}
            variant={appFilter === 'rejected' ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer', '& .MuiChip-label': { fontWeight: 800 } }}
          />
        </Box>

        <List>
          {applications
            .filter((app) => (appFilter === 'all' ? true : app.status === appFilter))
            .map((app) => (
              <ListItem
                key={app.id}
                divider
                secondaryAction={
                  <Typography
                    variant="caption"
                    sx={{
                      color: app.status === 'accepted' ? 'green' : app.status === 'pending' ? '#ff9800' : '#9e9e9e',
                      fontWeight: 800,
                    }}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Typography>
                }
              >
                <ListItemAvatar>
                  <Avatar>{app.brand ? app.brand.charAt(0) : 'A'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={app.title}
                  primaryTypographyProps={{ sx: { fontWeight: 800 } }}
                  secondary={`${app.brand} · Applied ${new Date(app.appliedAt).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseApplications} sx={{ fontWeight: 800, textTransform: 'none' }}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', fontFamily: '"Inter", sans-serif' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <Box
          sx={{
            marginLeft: isMobile ? 0 : '260px',
            marginTop: '72px',
            width: isMobile ? '100%' : 'calc(100% - 260px)',
            padding: { xs: 2, md: 4 },
            backgroundColor: '#f8f9fa',
            minHeight: 'calc(100vh - 72px)'
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    sx={{
                      fontWeight: 800,
                      color: '#000',
                      m: 0,
                      background: 'linear-gradient(135deg, #000 0%, #000 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Kolaborasi Saya
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: '#6c757d', mt: 1 }}>
                    Lacak dan kelola semua kampanye aktif dan selesai Anda di satu tempat
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={handleOpenApplications}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 800,
                      border: '1.5px solid',
                      borderColor: '#6E00BE',
                      color: '#6E00BE',
                      px: 2,
                      py: 0.7,
                    }}
                  >
                    <Typography component="span" sx={{ fontWeight: 800 }}>Lamaran Saya</Typography>
                  </Button>
                </Box>
              </Box>
              
              {/* Total Earnings Card */}
              <Card 
                elevation={0}
                sx={{
                  mt: 3,
                  mb: 4,
                  background: '#6E00BE',
                  color: 'white',
                  borderRadius: '12px',
                  p: 3,
                  boxShadow: '0 4px 20px rgba(110, 0, 190, 0.2)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Pendapatan
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      Rp 15,000,000
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp sx={{ fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        +12% dari bulan lalu
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AccountBalanceWallet sx={{ fontSize: '2rem', color: 'white' }} />
                  </Box>
                </Box>
              </Card>
            </Box>

{selectedCollaboration ? (
              showSubmitWork ? (
                <SubmitWork 
                  collaboration={selectedCollaboration} 
                  onBack={handleBackFromSubmit} 
                />
              ) : (
                renderCollaborationDetail(selectedCollaboration)
              )
            ) : (
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  mb: 3,
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: '#6c757d',
                      '&.Mui-selected': {
                        color: '#6E00BE',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: '3px',
                      background: '#6E00BE',
                    },
                  }}
                >
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" />
                        <Typography component="span">Akan Datang ({mockCollaborations.upcoming.length})</Typography>
                      </Box>
                    }
                  />
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp fontSize="small" />
                        <Typography component="span">Sedang Berlangsung ({mockCollaborations.ongoing.length})</Typography>
                      </Box>
                    }
                  />
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" />
                        <Typography component="span">Selesai ({mockCollaborations.completed.length})</Typography>
                      </Box>
                    }
                  />
                </Tabs>

                <Box sx={{ p: 3 }}>
                  <TabPanel value={tabValue} index={0}>
                    {renderCollaborationList(mockCollaborations.upcoming)}
                  </TabPanel>
                  <TabPanel value={tabValue} index={1}>
                    {renderCollaborationList(mockCollaborations.ongoing)}
                  </TabPanel>
                  <TabPanel value={tabValue} index={2}>
                    {renderCollaborationList(mockCollaborations.completed)}
                  </TabPanel>
                </Box>
              </Card>
            )}
          </Container>
          {renderApplicationsDialog()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Collaborations;
