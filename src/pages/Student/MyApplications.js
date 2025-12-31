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
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  Cancel as CancelIcon,
  Assignment as AssignmentIcon
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
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      case 'pending': return 'warning';
      default: return 'primary';
    }
  };

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'Diterima';
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
              // maxWidth="lg"
              // Note: The common/Modal component might handle props differently. 
              // If it doesn't support maxWidth directly, it might be fine or need sx props.
              // Assuming compatibility or wrapping children in Box.
            >
              <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>
                {/* Banner Image */}
                {selectedCampaign.banner_image && (
                  <Box sx={{ width: '100%', height: '200px', background: `url(${getImageUrl(selectedCampaign.banner_image)}) center/cover`, borderRadius: '12px', mb: '24px' }} />
                )}

                {/* Campaign Details Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '24px', mb: '24px' }}>
                  {/* Left Column */}
                  <Box>
                    <Typography sx={{ m: 0, mb: '12px', color: '#1a1f36', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Informasi Produk</Typography>

                    {selectedCampaign.has_product && (
                      <>
                        <Box sx={{ mb: '16px' }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Nama Produk</Typography>
                          <Typography sx={{ mt: '4px', fontSize: '1rem', color: '#1a1f36', fontWeight: 600 }}>{selectedCampaign.product_name}</Typography>
                        </Box>

                        <Box sx={{ mb: '16px' }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Nilai Produk</Typography>
                          <Typography sx={{ mt: '4px', fontSize: '1rem', color: '#1a1f36', fontWeight: 600 }}>Rp {Number(selectedCampaign.product_value).toLocaleString('id-ID')}</Typography>
                        </Box>

                        <Box sx={{ mb: '16px' }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Deskripsi</Typography>
                          <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36', lineHeight: 1.5 }}>{selectedCampaign.product_desc}</Typography>
                        </Box>
                      </>
                    )}

                    <Box sx={{ mb: '16px' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Kategori</Typography>
                      <Typography sx={{ mt: '4px', fontSize: '1rem', color: '#1a1f36', fontWeight: 600 }}>{selectedCampaign.campaign_category}</Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Kategori Influencer</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: '8px' }}>
                        {parseInfluencerCategory(selectedCampaign.influencer_category).map((cat, idx) => (
                          <Box key={idx} sx={{ background: '#f3e5f5', color: '#6E00BE', px: '12px', py: '6px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{cat}</Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Right Column */}
                  <Box>
                    <Typography sx={{ m: 0, mb: '12px', color: '#1a1f36', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detail Kampanye</Typography>

                    <Box sx={{ mb: '16px' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Harga Per Postingan</Typography>
                      <Typography sx={{ mt: '4px', fontSize: '1.2rem', color: '#6E00BE', fontWeight: 700 }}>Rp {Number(selectedCampaign.price_per_post).toLocaleString('id-ID')}</Typography>
                    </Box>

                    <Box sx={{ mb: '16px' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Status</Typography>
                      <Typography sx={{ mt: '4px', fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', color: selectedCampaign.status === 'active' ? '#155724' : '#6c757d' }}>{translateStatus(selectedCampaign.status)}</Typography>
                    </Box>

                    <Box sx={{ mb: '16px' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Tanggal</Typography>
                      <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36' }}>
                          Mulai: {selectedCampaign.start_date && new Date(selectedCampaign.start_date).toLocaleDateString('id-ID')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', color: '#1a1f36' }}>
                          Selesai: {selectedCampaign.end_date && new Date(selectedCampaign.end_date).toLocaleDateString('id-ID')}
                      </Typography>
                       <Typography sx={{ fontSize: '0.95rem', color: '#d32f2f', fontWeight: 600, mt: 0.5 }}>
                          Batas Waktu Pengiriman: {selectedCampaign.submission_deadline ? new Date(selectedCampaign.submission_deadline).toLocaleDateString('id-ID') : 'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Persyaratan</Typography>
                      <Box sx={{ mt: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Box sx={{ background: '#f7fafc', p: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                          <Typography component="span" sx={{ fontWeight: 600, color: '#1a1f36' }}>Min Pengikut: </Typography>
                          <Typography component="span" sx={{ color: '#6c757d' }}>{selectedCampaign.min_followers?.toLocaleString('id-ID') || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ background: '#f7fafc', p: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                          <Typography component="span" sx={{ fontWeight: 600, color: '#1a1f36' }}>Jenis Kelamin: </Typography>
                          <Typography component="span" sx={{ color: '#6c757d' }}>{selectedCampaign.selected_gender || 'Semua'}</Typography>
                        </Box>
                        <Box sx={{ background: '#f7fafc', p: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                          <Typography component="span" sx={{ fontWeight: 600, color: '#1a1f36' }}>Usia: </Typography>
                          <Typography component="span" sx={{ color: '#6c757d' }}>
                            {(() => {
                               if (!selectedCampaign.selected_age) return 'Semua';
                               try {
                                  let parsed = selectedCampaign.selected_age;
                                  if (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                                     parsed = JSON.parse(parsed);
                                     if (typeof parsed === 'string' && parsed.startsWith('[')) {
                                         parsed = JSON.parse(parsed);
                                     }
                                  }
                                  return Array.isArray(parsed) ? parsed.join(', ') : parsed;
                               } catch (e) {
                                  return selectedCampaign.selected_age;
                               }
                            })()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Guidelines */}
                {(selectedCampaign.content_guidelines || selectedCampaign.caption_guidelines) && (
                  <Box sx={{ mb: '24px' }}>
                    <Typography sx={{ m: 0, mb: '12px', color: '#1a1f36', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Panduan</Typography>

                    {selectedCampaign.content_guidelines && (
                      <Box sx={{ mb: '12px' }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Panduan Konten</Typography>
                        <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{selectedCampaign.content_guidelines}</Typography>
                      </Box>
                    )}

                    {selectedCampaign.caption_guidelines && (
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Panduan Caption</Typography>
                        <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{selectedCampaign.caption_guidelines}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button 
                      onClick={() => setShowDetailModal(false)}
                      variant="contained"
                      sx={{ bgcolor: '#6E00BE', '&:hover': { bgcolor: '#5a009e' } }}
                    >
                      Tutup
                    </Button>
                </Box>
              </Box>
            </Modal>
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default MyApplications;
