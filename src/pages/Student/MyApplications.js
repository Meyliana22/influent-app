import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../../components/common';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Chip,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Card,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Campaign,
  CalendarToday,
  MonetizationOn,
  Description,
  Group,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import * as campaignService from '../../services/campaignService';
import { useToast } from '../../hooks/useToast';

import { Modal } from '../../components/common';

const MyApplications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal state for cancellation
  const [cancelModal, setCancelModal] = useState({ 
    open: false, 
    appId: null 
  });

  // Modal state for details
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const parseInfluencerCategory = (category) => {
    if (!category) return [];
    if (Array.isArray(category)) return category;
    try {
        if (category.startsWith('[')) {
            return JSON.parse(category);
        }
        return [category];
    } catch (e) {
        return [category];
    }
  };

  const handleViewDetails = (application) => {
    // access campaign object from application
    const campaignData = application.campaign || application;
    setSelectedCampaign(campaignData);
    setShowDetailModal(true);
  };

  const fetchApplications = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      const response = await campaignService.getCampaignUsers();
      
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response.result && Array.isArray(response.result)) {
        data = response.result;
      }
      
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Gagal memuat lamaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateCancel = (applicationId) => {
    setCancelModal({ open: true, appId: applicationId });
  };

  const confirmCancel = async () => {
    const applicationId = cancelModal.appId;
    if (!applicationId) return;

    try {
      await campaignService.cancelCampaignUser(applicationId);
      showToast('Lamaran dibatalkan', 'success');
      setCancelModal({ open: false, appId: null });
      fetchApplications();
    } catch (error) {
      console.error('Cancel error:', error);
      showToast('Gagal membatalkan lamaran', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'paid': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      case 'pending': return 'warning';
      default: return 'primary';
    }
  };

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'Diterima';
      case 'paid': return 'Dibayar';
      case 'rejected': return 'Ditolak';
      case 'cancelled': return 'Dibatalkan';
      case 'pending': return 'Menunggu';
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'completed': return 'Selesai';
      default: return status || '-';
    }
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: isMobile ? 0 : '260px',
          marginTop: '72px',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          minHeight: 'calc(100vh - 72px)',
          bgcolor: '#f8f9fa',
          p: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, borderLeft: '5px solid #6E00BE', pl: 2 }}>
              Lamaran Saya
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Lacak status lamaran kampanye Anda
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : applications.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 3, 
                bgcolor: '#fff', 
                border: '1px solid #e2e8f0' 
              }}
            >
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                Anda belum melamar kampanye apa pun.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/student/browse-campaigns')}
                sx={{ 
                  bgcolor: '#6E00BE',
                  '&:hover': { bgcolor: '#5a009e' }
                }}
              >
                Jelajahi Kampanye
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#6E00BE' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Kampanye</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Tanggal Melamar</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }} align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow 
                      key={app.id || app.campaign_user_id}
                      sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                    >
                      <TableCell>
                         <Typography variant="body1" fontWeight={600}>
                            {app.campaign?.title || app.campaign_title || `Campaign #${app.campaign_id}`}
                         </Typography>
                         {app.campaign?.price_per_post && (
                            <Typography variant="caption" color="textSecondary">
                              Rp {Number(app.campaign.price_per_post).toLocaleString('id-ID')} / post
                            </Typography>
                         )}
                      </TableCell>
                      <TableCell>
                         <Chip 
                            label={app.campaign?.campaign_category || 'Kampanye'} 
                            size="small" 
                            variant="outlined" 
                            sx={{ borderRadius: 1 }}
                         />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={translateStatus(app.application_status)} 
                          color={getStatusColor(app.application_status)}
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(app.created_at || app.applied_at || Date.now()).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {app.application_status === 'pending' && (
                             <Button 
                               variant="outlined" 
                               size="small"
                               color="error"
                               onClick={() => initiateCancel(app.id || app.campaign_user_id)}
                               startIcon={<CancelIcon />}
                               sx={{ borderRadius: 2, textTransform: 'none' }}
                             >
                               Batal
                             </Button>
                          )}
                          
                          <Button 
                            variant="outlined"
                            size="small"
                            startIcon={app.application_status === 'accepted' ? <AssignmentIcon /> : <VisibilityIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#6E00BE', color: '#6E00BE', '&:hover': { borderColor: '#5a009e', bgcolor: '#f3e5f5' } }}
                            onClick={() => {
                              if (app.application_status === 'accepted') {
                                 navigate(`/student/campaign/${app.campaign_id || app.campaign?.id}/work`);
                              } else {
                                 handleViewDetails(app);
                              }
                            }}
                          >
                            {app.application_status === 'accepted' ? 'Kirim Pekerjaan' : 'Detail'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Cancel Confirmation Modal */}
          <Modal
             isOpen={cancelModal.open}
             onClose={() => setCancelModal({ ...cancelModal, open: false })}
             title="Batalkan Lamaran"
             onConfirm={confirmCancel}
             confirmText="Ya, Batalkan Lamaran"
             cancelText="Tidak, Simpan"
             variant="danger"
          >
             <Typography>
                Apakah Anda yakin ingin membatalkan lamaran Anda? Tindakan ini tidak dapat dibatalkan.
             </Typography>
          </Modal>

          {/* Campaign Detail Modal */}
          {selectedCampaign && (
            <Modal
              isOpen={showDetailModal}
              onClose={() => setShowDetailModal(false)}
              title={selectedCampaign.title || 'Detail Kampanye'}
              maxWidth="lg"
            >
              <Box sx={{ maxHeight: '75vh', overflowY: 'auto', p: 1 }}>
                {/* Banner Image */}
                {selectedCampaign.banner_image && (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '240px', 
                      background: `url(${getImageUrl(selectedCampaign.banner_image)}) center/cover`, 
                      borderRadius: '16px', 
                      mb: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }} 
                  />
                )}

                <Stack spacing={4}>
                  {/* 1. Header Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip 
                            label={selectedCampaign.campaign_category || 'General'} 
                            size="small" 
                            sx={{ bgcolor: '#f3e5f5', color: '#6E00BE', fontWeight: 600 }} 
                          />
                          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {selectedCampaign.type || 'Campaign'}
                          </Typography>
                      </Stack>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                        {selectedCampaign.title}
                      </Typography>
                    </Box>

                    <Stack alignItems="flex-end" spacing={1}>
                       <Chip
                          label={translateStatus(selectedCampaign.status)}
                          sx={{
                            bgcolor: getStatusColor(selectedCampaign.status) === 'success' ? '#dcfce7' : '#f1f5f9',
                            color: getStatusColor(selectedCampaign.status) === 'success' ? '#15803d' : '#64748b',
                            fontWeight: 700,
                            border: '1px solid',
                            borderColor: getStatusColor(selectedCampaign.status) === 'success' ? '#bbf7d0' : '#e2e8f0',
                          }}
                       />
                       <Typography variant="h5" sx={{ fontWeight: 800, color: '#6E00BE' }}>
                          Rp {Number(selectedCampaign.price_per_post).toLocaleString('id-ID')}
                          <Typography component="span" variant="body2" sx={{ color: '#64748b', fontWeight: 500, ml: 0.5 }}>/ post</Typography>
                       </Typography>
                    </Stack>
                  </Box>

                  {/* 2. Main Content Grid */}
                  <Grid container spacing={3} alignItems="stretch">
                    {/* Row 1: Product/Desc & Requirements */}
                    <Grid item xs={12} md={selectedCampaign.has_product ? 6 : 7}>
                       <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                          <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                               {selectedCampaign.has_product ? <MonetizationOn sx={{ fontSize: 18, color: '#64748b' }} /> : <Description sx={{ fontSize: 18, color: '#64748b' }} />}
                               <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>
                                  {selectedCampaign.has_product ? 'Informasi Produk' : 'Detail Kampanye'}
                               </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: 2.5 }}>
                             <Stack spacing={3}>
                                {selectedCampaign.has_product ? (
                                   <>
                                     <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>NAMA PRODUK</Typography>
                                        <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>{selectedCampaign.product_name}</Typography>
                                     </Box>
                                     <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>NILAI PRODUK</Typography>
                                        <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 600 }}>Rp {Number(selectedCampaign.product_value).toLocaleString('id-ID')}</Typography>
                                     </Box>
                                     <Divider sx={{ borderStyle: 'dashed' }} />
                                     <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>DESKRIPSI</Typography>
                                        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>{selectedCampaign.product_desc}</Typography>
                                     </Box>
                                   </>
                                ) : (
                                   <Box>
                                      <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>{selectedCampaign.description || 'Tidak ada deskripsi tambahan.'}</Typography>
                                   </Box>
                                )}
                             </Stack>
                          </Box>
                       </Card>
                    </Grid>

                    <Grid item xs={12} md={selectedCampaign.has_product ? 6 : 5}>
                       <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                          <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                               <Group sx={{ fontSize: 18, color: '#64748b' }} />
                               <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Kriteria Influencer</Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: 2.5 }}>
                             <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                   <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Min. Followers</Typography>
                                   <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 700 }}>{selectedCampaign.min_followers?.toLocaleString('id-ID') || '-'}</Typography>
                                </Box>
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                   <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Jenis Kelamin</Typography>
                                   <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 700 }}>{selectedCampaign.selected_gender || 'Semua'}</Typography>
                                </Box>
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <Box>
                                   <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mb: 1, display: 'block' }}>KATEGORI</Typography>
                                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                      {parseInfluencerCategory(selectedCampaign.influencer_category).map((cat, idx) => (
                                         <Chip key={idx} label={cat} size="small" sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', fontWeight: 600 }} />
                                      ))}
                                   </Box>
                                </Box>
                             </Stack>
                          </Box>
                       </Card>
                    </Grid>

                    {/* Row 2: Timeline & Guidelines */}
                    <Grid item xs={12} md={6}>
                       <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                          <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                               <CalendarToday sx={{ fontSize: 18, color: '#64748b' }} />
                               <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Timeline Campaign</Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: 2.5 }}>
                             <Stack spacing={2}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                   <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#eff6ff', color: '#3b82f6', height: 'fit-content' }}>
                                      <Campaign sx={{ fontSize: 20 }} />
                                   </Box>
                                   <Box>
                                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>PERIODE</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                         {selectedCampaign.start_date && new Date(selectedCampaign.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} -{' '}
                                         {selectedCampaign.end_date && new Date(selectedCampaign.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </Typography>
                                   </Box>
                                </Box>
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                   <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#fef2f2', color: '#ef4444', height: 'fit-content' }}>
                                      <AccessTime sx={{ fontSize: 20 }} />
                                   </Box>
                                   <Box>
                                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>DEADLINE PENGIRIMAN</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                         {selectedCampaign.submission_deadline ? new Date(selectedCampaign.submission_deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Tidak Ditentukan'}
                                      </Typography>
                                   </Box>
                                </Box>
                             </Stack>
                          </Box>
                       </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                       <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                          <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                               <AssignmentIcon sx={{ fontSize: 18, color: '#64748b' }} />
                               <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Brief & Guideline</Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: 2.5 }}>
                             <Stack spacing={2}>
                                <Box>
                                   <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mb: 0.5, display: 'block' }}>KONTEN</Typography>
                                   <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5, bgcolor: '#f8fafc', p: 1.5, borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                                      {selectedCampaign.content_guidelines || '-'}
                                   </Typography>
                                </Box>
                                <Box>
                                   <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mb: 0.5, display: 'block' }}>CAPTION</Typography>
                                   <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5, bgcolor: '#f8fafc', p: 1.5, borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                                      {selectedCampaign.caption_guidelines || '-'}
                                   </Typography>
                                </Box>
                             </Stack>
                          </Box>
                       </Card>
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </Modal>
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default MyApplications;
