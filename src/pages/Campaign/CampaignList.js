import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Stack, Card, Typography, Button, TextField, Select, MenuItem, InputAdornment, IconButton, Menu, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { COLORS } from '../../constants/colors';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { BarChart3 } from 'lucide-react';
import campaignService from '../../services/campaignService';
import FaceIcon from '@mui/icons-material/Face';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MovieIcon from '@mui/icons-material/Movie';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FlightIcon from '@mui/icons-material/Flight';
import CampaignIcon from '@mui/icons-material/Campaign';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArchiveIcon from '@mui/icons-material/Archive';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupIcon from '@mui/icons-material/Group';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { toast } from 'react-toastify';


function CampaignList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCampaignId, setMenuCampaignId] = useState(null);

  const handleMenuOpen = (event, campaignId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCampaignId(campaignId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCampaignId(null);
  };

  const handleArchiveClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowArchiveModal(true);
    handleMenuClose();
  };

  const handleArchiveConfirm = async () => {
    if (!selectedCampaign) return;
    
    try {
      await campaignService.updateCampaignStatus(selectedCampaign.campaign_id, 'archived');
      toast.success('Campaign berhasil diarsipkan');
      setShowArchiveModal(false);
      setSelectedCampaign(null);
      const params = { page: currentPage, limit: 10 };   
      if (filter) params.status = filter;
      if (search) params.title = search;
      params.sort = 'updated_at';
      params.order = 'DESC';
      const response = await campaignService.getCampaigns(params);
      setCampaigns(response.data || []);
      setPagination(response.pagination || { total: 0, totalPages: 0, hasMore: false, hasPrevious: false });
    } catch (error) {
      console.error('Error archiving campaign:', error);
      toast.error('Gagal mengarsipkan campaign');
    }
  };

  const handleDistributePayment = async (campaignId) => {
    try {
      if (!window.confirm("Are you sure you want to distribute payments to all eligible influencers for this campaign?")) return;
      
      await campaignService.distributePayment(campaignId);
      toast.success("Payments distributed successfully!");
      
      // Refresh list
      const params = { page: currentPage, limit: 10 };   
      if (filter) params.status = filter;
      if (search) params.title = search;
      params.sort = 'updated_at';
      params.order = 'DESC';
      const response = await campaignService.getCampaigns(params);
      setCampaigns(response.data || []);
    } catch (error) {
      console.error("Payment distribution failed:", error);
      toast.error("Failed to distribute payments");
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoading(true);
      try {
        const params = { page: currentPage, limit: 10, };   
        if (filter) { params.status = filter; }
        if (search) { params.title = search; }
        params.sort = 'updated_at';
        params.order = 'DESC';
        
        const response = await campaignService.getCampaigns(params);
        setCampaigns(response.data || []);
        setPagination(response.pagination || {
          total: 0,
          totalPages: 0,
          hasMore: false,
          hasPrevious: false,
        });
      } catch (err) {
        console.error('Error loading campaigns:', err);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCampaigns();
    const handleStorageChange = () => loadCampaigns();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentPage, filter, search]);

  // Consolidated status configuration
  const STATUS_CONFIG = {
    admin_review: {
      badge: { bg: '#fff3cd', color: '#856404', shadow: '0 2px 8px rgba(255, 193, 7, 0.3)' },
      text: 'Ditinjau Admin',
      alert: { bg: '#fff3cd', border: '#ffc107', color: '#856404', icon: HourglassEmptyIcon,
        title: 'Menunggu Review Admin', 
        message: 'Campaign Anda sedang direview oleh tim admin. Anda akan dinotifikasi setelah disetujui.' }
    },
    pending_payment: {
      badge: { bg: '#cfe2ff', color: '#084298', shadow: '0 2px 8px rgba(13, 110, 253, 0.3)' },
      text: 'Menunggu Pembayaran',
      alert: { bg: '#cfe2ff', border: '#84c1ff', color: '#084298', icon: CreditCardIcon,
        title: 'Campaign Disetujui! Selesaikan Pembayaran', 
        message: 'Campaign Anda telah disetujui admin. Klik "Bayar Sekarang" untuk mengaktifkan campaign.' }
    },
    cancelled: {
      badge: { bg: '#ffe5e5', color: '#c41e3a', shadow: '0 2px 8px rgba(196, 30, 58, 0.3)' },
      text: 'Dibatalkan',
      alert: { bg: '#ffe5e5', border: '#ff9999', color: '#c41e3a', icon: CancelIcon,
        title: 'Campaign Dibatalkan', 
        message: 'Campaign dibatalkan.' }
    },
    active: {
      badge: { bg: '#d1fae5', color: '#155724', shadow: '0 2px 8px rgba(132, 250, 176, 0.3)' },
      text: 'Aktif',
      alert: { bg: '#d1fae5', border: '#6ee7b7', color: '#065f46', icon: RocketLaunchIcon,
        title: 'Campaign Sedang Berjalan', 
        message: 'Campaign aktif dan dapat diapply oleh mahasiswa. Monitor aplikasi dan review hasil kerja.' },
      subStatus: {
        registration_open: 'Pendaftaran Dibuka', student_selection: 'Seleksi Mahasiswa',
        student_confirmation: 'Konfirmasi Mahasiswa', content_submission: 'Pengumpulan Konten',
        content_revision: 'Revisi Konten', violation_reported: 'Laporan Pelanggaran',
        violation_confirmed: 'Konten Bermasalah', posting: 'Proses Posting', 
        payout_success: 'Berhasil Terbayar'
      },
      subStatusAlert: {
        payout_success: {
          bg: '#e0d4ff',
          border: '#c4b5fd',
          color: '#5b21b6',
          icon: CheckCircleIcon,
          title: 'Berhasil Terbayar',
          message: (campaign) => {
            const hasRefund = campaign.refund_amount && campaign.refund_amount > 0;
            const completedDate = campaign.completed_at ? new Date(campaign.completed_at).toLocaleDateString('id-ID') : 'tanggal tidak tersedia';
            return hasRefund 
              ? `Campaign telah selesai pada ${completedDate}. Dana telah dicairkan kepada mahasiswa. Silakan cek dana pengembalian Anda.`
              : `Campaign telah selesai. Dana telah dicairkan kepada mahasiswa.`;
          }
        }
      }
    },
    completed: {
      badge: { bg: '#e0d4ff', color: '#5b21b6', shadow: '0 2px 8px rgba(139, 92, 246, 0.3)' },
      text: 'Selesai',
      alert: { bg: '#e0d4ff', border: '#c4b5fd', color: '#5b21b6', icon: CheckCircleIcon,
        title: 'Campaign Selesai', 
        message: (campaign) => `Campaign ${campaign.title} telah resmi selesai. Terima kasih telah mempercayakan kolaborasi Anda kepada InfluEnt.` }
    },
    draft: {
      badge: { bg: '#e2e8f0', color: '#6c757d', shadow: '0 2px 8px rgba(143, 143, 143, 0.3)' },
      text: 'Draft'
    },
    archived: {
      badge: { bg: '#f5f5f5', color: '#616161', shadow: '0 2px 8px rgba(97, 97, 97, 0.2)' },
      text: '🗂️ Diarsipkan',
      alert: { bg: '#f5f5f5', border: '#e0e0e0', color: '#616161', icon: ArchiveIcon,
        title: 'Campaign Diarsipkan', 
        message: 'Campaign ini telah diarsipkan dan tidak akan muncul di daftar utama.' }
    }
  };

  const getStatusConfig = (status, subStatus) => {
    const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.draft;
    if (status?.toLowerCase() === 'active' && subStatus && config.subStatus?.[subStatus.toLowerCase()]) {
      return { ...config, text: config.subStatus[subStatus.toLowerCase()] };
    }
    return config;
  };

  // Reusable StatusAlert component
  const StatusAlert = ({ status, subStatus, cancellationReason, campaign }) => {
    const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.draft;
    
    // Check for sub-status specific alert (e.g., payout_success)
    let alert = config.alert;
    if (status?.toLowerCase() === 'active' && subStatus && config.subStatusAlert?.[subStatus.toLowerCase()]) {
      alert = config.subStatusAlert[subStatus.toLowerCase()];
    }
    
    if (!alert) return null;
    
    const Icon = alert.icon;
    const message = typeof alert.message === 'function' ? alert.message(campaign) : alert.message;
    
    return (
      <Box sx={{ 
        mt: 1, p: 2, bgcolor: alert.bg, borderRadius: 2, 
        border: `1px solid ${alert.border}`, display: 'flex', 
        gap: 1.5, alignItems: 'flex-start' 
      }}>
        <Icon sx={{ fontSize: 24, color: alert.color }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ 
            fontSize: 13, color: alert.color, fontWeight: 700, 
            mb: 0.5, letterSpacing: '0.3px' 
          }}>
            {alert.title}
          </Typography>
          <Typography sx={{ 
            fontSize: 12.5, color: alert.color, 
            lineHeight: 1.5, fontWeight: 500 
          }}>
            {status?.toLowerCase() === 'cancelled' && cancellationReason ? cancellationReason : message}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Kecantikan & Fashion': FaceIcon,
      'Teknologi': PhoneAndroidIcon,
      'Makanan & Minuman': RestaurantIcon,
      'Keluarga & Parenting': FamilyRestroomIcon,
      'Hiburan': MovieIcon,
      'Kesehatan & Olahraga': FitnessCenterIcon,
      'Gaya Hidup & Travel': FlightIcon
    };
    return icons[category] || CampaignIcon;
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, ml: isMobile ? 0 : 32.5, overflow: 'hidden' }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ mt: 9, bgcolor: '#f7fafc', minHeight: 'calc(100vh - 72px)', overflow: 'hidden' }}>
            <Container
              maxWidth={false}
              sx={{
                py: { xs: 2, md: 4 },
                maxWidth: 1,
                height: 'calc(100vh - 72px)',
                overflow: 'auto',
              }}
            >
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <Button
                variant="contained"
                onClick={() => navigate('/campaign-create')}
                sx={{
                  bgcolor: '#667eea',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 16,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#5568d3' }
                }}
              >
                Buat Baru
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                Daftar Campaign
              </Typography>
            </Stack>
            {/* Search & Filter */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4} flexWrap="wrap">
              <Box sx={{ flex: '1 1 auto', minWidth: 250 }}>
                <TextField
                  fullWidth
                  placeholder="Cari campaign..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.textSecondary, opacity: 0.6 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#fff',
                    boxShadow: 1,
                    fontSize: 15,
                  }}
                />
              </Box>
              <Box sx={{ flex: '0 0 auto', minWidth: 150 }}>
                <Select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  fullWidth
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#fff',
                    fontSize: 16,
                    boxShadow: 1,
                  }}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="admin_review">Ditinjau Admin</MenuItem>
                  <MenuItem value="pending_payment">Menunggu Pembayaran</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="completed">Selesai</MenuItem>
                  <MenuItem value="cancelled">Dibatalkan</MenuItem>
                  <MenuItem value="archived">Diarsipkan</MenuItem>
                </Select>
              </Box>
            </Stack>
            {/* Campaign Cards */}
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 16 }}>
                  Memuat campaign...
                </Typography>
              </Box>
            ) : campaigns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 16 }}>
                  Tidak ada campaign ditemukan
                </Typography>
              </Box>
            ) : campaigns.map(campaign => (
              <Card
                key={campaign.campaign_id}
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  width: 1,
                  boxSizing: 'border-box',
                  borderRadius: 3,
                  boxShadow: 1
                }}
              >
                {/* Image/Icon */}
                <Box
                  onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                  sx={{
                    width: { xs: 20, sm: 30 }, height: { xs: 20, sm: 30 },
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: 3, mr: 3, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', boxShadow: 2, cursor: 'pointer', flexShrink: 0
                  }}
                >
                  {campaign.banner_image ? (
                    <Box component="img" src={campaign.banner_image} alt={campaign.title} sx={{ width: 1, height: 1, objectFit: 'cover', borderRadius: 2.5 }} />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#fff' }}>
                      <Box sx={{ mb: 0.5, opacity: 0.9 }}>
                        {React.createElement(getCategoryIcon(campaign.campaign_category), {
                          sx: { fontSize: 20, color: '#fff' }
                        })}
                      </Box>
                      <Typography sx={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>
                        {(campaign.campaign_category || '').split(' ')[0]}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {/* Card Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5, color: COLORS.textPrimary, lineHeight: 1.3 }}>
                        {campaign.title}
                      </Typography>
                      <Typography sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 500 }}>
                        {campaign.campaign_category || 'Tanpa Kategori'}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{
                        background: getStatusConfig(campaign.status, campaign.sub_status).badge.bg,
                        color: getStatusConfig(campaign.status, campaign.sub_status).badge.color,
                        boxShadow: getStatusConfig(campaign.status, campaign.sub_status).badge.shadow,
                        px: 2, py: 0.5, borderRadius: 5, fontSize: 12,
                        fontWeight: 600, letterSpacing: '0.5px', alignSelf: 'flex-start'
                      }}>
                        {getStatusConfig(campaign.status, campaign.sub_status).text}
                      </Box>
                      {(campaign.sub_status === 'payout_success' || campaign.status?.toLowerCase() === 'completed') && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, campaign.campaign_id);
                          }}
                          sx={{ color: COLORS.textSecondary }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                  <Box
                    onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PeopleIcon sx={{ fontSize: 13, color: COLORS.textSecondary }} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>
                        {campaign.influencer_count || 0} influencers
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>
                        Rp {parseInt(campaign.price_per_post || 0).toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BarChart3 size={13} color={COLORS.textSecondary} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>
                        {campaign.min_followers ? `${parseInt(campaign.min_followers).toLocaleString('id-ID')}+ followers` : 'Tanpa min followers'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Status Alert - Reusable component */}
                  <StatusAlert 
                    status={campaign.status} 
                    subStatus={campaign.sub_status}
                    cancellationReason={campaign.cancellation_reason} 
                    campaign={campaign}
                  />
                  
                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1.5} mt={1} pt={1.5} sx={{ borderTop: 1, borderColor: COLORS.border }}> 
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                      sx={{
                        borderColor: COLORS.primary,
                        color: COLORS.primary,
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: 14,
                        flex: 1,
                        '&:hover': { bgcolor: COLORS.primaryLight, borderColor: COLORS.primary }
                      }}
                    >
                      {campaign.status?.toLowerCase() === 'draft' ? 'Edit Campaign' : 'Lihat Detail'}
                    </Button>
                    {campaign.status && campaign.status.toLowerCase() === 'pending_payment' && (
                      <Button
                        variant="contained"
                        startIcon={<CreditCardIcon />}
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/campaign/${campaign.campaign_id}/payment`);
                        }}
                        sx={{
                          bgcolor: '#10b981',
                          color: '#fff',
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: 16,
                          boxShadow: 'none',
                          flex: 1,
                          '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        Bayar Sekarang
                      </Button>
                    )}
                    {campaign.status && campaign.status.toLowerCase() === 'active' && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<GroupIcon />}
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/campaign/${campaign.campaign_id}/applicants`);
                          }}
                          sx={{
                            bgcolor: '#667eea',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: 14,
                            boxShadow: 'none',
                            flex: 1,
                            '&:hover': { bgcolor: '#5568d3' }
                          }}
                        >
                          Pelamar
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<RateReviewIcon />}
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/campaign/${campaign.campaign_id}/review-submissions`);
                          }}
                          sx={{
                            bgcolor: '#10b981',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: 14,
                            boxShadow: 'none',
                            flex: 1,
                            '&:hover': { bgcolor: '#059669' }
                          }}
                        >
                          Review Hasil Kerja
                        </Button>
                      </>
                    )}
                    {campaign.status && campaign.status.toLowerCase() === 'completed' && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<CreditCardIcon />}
                          onClick={e => {
                            e.stopPropagation();
                            handleDistributePayment(campaign.campaign_id);
                          }}
                          sx={{
                            bgcolor: '#059669',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: 14,
                            boxShadow: 'none',
                            flex: 1,
                            '&:hover': { bgcolor: '#047857' }
                          }}
                        >
                          Distribute Payment
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<AssessmentIcon />}
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/campaign/${campaign.campaign_id}/report`);
                          }}
                          sx={{
                            bgcolor: '#8b5cf6',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: 14,
                            boxShadow: 'none',
                            flex: 1,
                            '&:hover': { bgcolor: '#7c3aed' }
                          }}
                        >
                          Lihat Laporan
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>
              </Card>
            ))}
            
            {/* Pagination Controls */}
            {!isLoading && pagination.total > 0 && (
              <Box sx={{ mt: 4 }}>
                {/* Page Numbers */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                  {/* Previous Button */}
                  <Button
                    variant="outlined"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 90,
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': { borderColor: '#5568d3', bgcolor: 'rgba(102, 126, 234, 0.05)' },
                      '&:disabled': { opacity: 0.3, borderColor: '#ccc', color: '#999' }
                    }}
                  >
                    Sebelumnya
                  </Button>
                  
                  {/* Page Number Buttons */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {(() => {
                      const totalPages = pagination.totalPages;
                      const current = currentPage;
                      const pages = [];
                      
                      // Always show first page
                      pages.push(1);
                      
                      // Show ellipsis if needed
                      if (current > 3) {
                        pages.push('...');
                      }
                      
                      // Show pages around current page
                      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }
                      
                      // Show ellipsis if needed
                      if (current < totalPages - 2) {
                        pages.push('...');
                      }
                      
                      // Always show last page if more than 1 page
                      if (totalPages > 1 && !pages.includes(totalPages)) {
                        pages.push(totalPages);
                      }
                      
                      return pages.map((page, index) => {
                        if (page === '...') {
                          return (
                            <Typography key={`ellipsis-${index}`} sx={{ px: 1, color: COLORS.textSecondary, fontSize: 16 }}>
                              ...
                            </Typography>
                          );
                        }
                        
                        return (
                          <Button
                            key={page}
                            variant={current === page ? 'contained' : 'outlined'}
                            onClick={() => setCurrentPage(page)}
                            sx={{
                              minWidth: 40,
                              height: 40,
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize: 14,
                              bgcolor: current === page ? '#667eea' : 'transparent',
                              color: current === page ? '#fff' : '#667eea',
                              borderColor: current === page ? '#667eea' : '#e0e0e0',
                              '&:hover': {
                                bgcolor: current === page ? '#5568d3' : 'rgba(102, 126, 234, 0.1)',
                                borderColor: '#667eea'
                              }
                            }}
                          >
                            {page}
                          </Button>
                        );
                      });
                    })()}
                  </Stack>
                  
                  {/* Next Button */}
                  <Button
                    variant="outlined"
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 90,
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': { borderColor: '#5568d3', bgcolor: 'rgba(102, 126, 234, 0.05)' },
                      '&:disabled': { opacity: 0.3, borderColor: '#ccc', color: '#999' }
                    }}
                  >
                    Berikutnya
                  </Button>
                </Box>
                
                {/* Pagination Info */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 13 }}>
                    Menampilkan halaman {currentPage} dari {pagination.totalPages} ({pagination.total} total campaign)
                  </Typography>
                </Box>
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      {/* More Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleArchiveClick(campaigns.find(c => c.campaign_id === menuCampaignId))}>
          <ArchiveIcon sx={{ fontSize: 20, mr: 1.5, color: '#616161' }} />
          Arsipkan Campaign
        </MenuItem>
      </Menu>

      {/* Archive Confirmation Modal */}
      <Dialog 
        open={showArchiveModal} 
        onClose={() => setShowArchiveModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Arsipkan Campaign?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: COLORS.textSecondary, lineHeight: 1.6 }}>
            Campaign "{selectedCampaign?.title}" akan dipindahkan ke arsip. Campaign yang diarsipkan tidak akan muncul di daftar utama.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowArchiveModal(false)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleArchiveConfirm}
            variant="contained"
            startIcon={<ArchiveIcon />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              bgcolor: '#616161',
              '&:hover': { bgcolor: '#424242' }
            }}
          >
            Arsipkan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CampaignList;
