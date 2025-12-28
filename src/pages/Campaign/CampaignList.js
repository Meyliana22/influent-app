import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Stack, Card, Typography, Button, TextField, Select, MenuItem, InputAdornment, IconButton, Menu, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Paper } from '@mui/material';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
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
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { toast } from 'react-toastify';

function CampaignList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]); // Stores ALL campaigns (raw data)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 1. Filter and Search (Frontend)
  const filteredCampaigns = campaigns.filter(campaign => {
    console.log(campaign.status)
    const matchesStatus = filter ? campaign.status === filter : true;
    const matchesSearch = search ? campaign.title.toLowerCase().includes(search.toLowerCase()) : true;
    return matchesStatus && matchesSearch;
  });

  // 2. Pagination (Frontend)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);

  // Removed unused pagination state
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

  // Confirmation Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState(() => {});

  const handleConfirmAction = () => {
    onConfirm();
    setShowConfirmDialog(false);
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
      loadData(); 
    } catch (error) {
      console.error('Error archiving campaign:', error);
      toast.error('Gagal mengarsipkan campaign');
    }
  };

  const handleDeleteCampaign = (campaignId) => {
     setConfirmTitle("Hapus Campaign");
     setConfirmMessage("Apakah Anda yakin ingin menghapus campaign draft ini? Tindakan ini tidak dapat dibatalkan.");
     setOnConfirm(() => async () => {
       try {
         await campaignService.deleteCampaign(campaignId);
         toast.success("Campaign berhasil dihapus");
         loadData();
       } catch (error) {
         console.error("Error deleting campaign:", error);
         toast.error("Gagal menghapus campaign");
       }
     });
     setShowConfirmDialog(true);
  };

  const handleDistributePayment = (campaignId) => {
    setConfirmTitle("Distribusi Pembayaran");
    setConfirmMessage("Apakah Anda yakin ingin mendistribusikan pembayaran kepada semua influencer yang memenuhi syarat untuk campaign ini?");
    setOnConfirm(() => async () => {
      try {
        await campaignService.distributePayment(campaignId);
        toast.success("Pembayaran berhasil didistribusikan!");
        loadData();
      } catch (error) {
        console.error("Payment distribution failed:", error);
        toast.error("Gagal mendistribusikan pembayaran");
      }
    });
    setShowConfirmDialog(true);
  };

  const handleCompleteCampaign = (campaignId) => {
    setConfirmTitle("Selesaikan Campaign");
    setConfirmMessage("Apakah Anda yakin ingin menyelesaikan campaign ini? Pastikan semua deliverables sudah diterima.");
    setOnConfirm(() => async () => {
       try {
          await campaignService.updateCampaignStatus(campaignId, 'completed');
          toast.success("Campaign berhasil diselesaikan!");
          loadData();
       } catch (error) {
          console.error("Error completing campaign:", error);
          toast.error("Gagal menyelesaikan campaign");
       }
    });
    setShowConfirmDialog(true);
  };

  const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch ALL data without filters for true frontend handling
        // Use a high limit to ensure we get everything if backend paginates by default
        const params = { limit: 1000, sort: 'updated_at', order: 'DESC' };   
        
        const response = await campaignService.getCampaigns(params);
        setCampaigns(response.data || []);
      } catch (err) {
        console.error('Error loading campaigns:', err);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reload data only when Filters/Search change (not page)
  useEffect(() => {
    loadData();
    setCurrentPage(1); // Reset page on filter/search change
  }, [filter, search]);

  useEffect(() => {
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [filter, search]);

  // Consolidated status configuration - FLAT DESIGN
  const STATUS_CONFIG = {
    admin_review: {
      badge: { bg: '#fff7ed', color: '#c2410c' }, // Orange
      text: 'Ditinjau Admin',
      alert: { bg: '#fff7ed', border: '#fdba74', color: '#c2410c', icon: HourglassEmptyIcon,
        title: 'Menunggu Review Admin', 
        message: 'Campaign Anda sedang direview oleh tim admin. Anda akan dinotifikasi setelah disetujui.' }
    },
    pending_payment: {
      badge: { bg: '#eff6ff', color: '#1d4ed8' }, // Blue
      text: 'Menunggu Pembayaran',
      alert: { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8', icon: CreditCardIcon,
        title: 'Campaign Disetujui! Selesaikan Pembayaran', 
        message: 'Campaign Anda telah disetujui admin. Klik "Bayar Sekarang" untuk mengaktifkan campaign.' }
    },
    cancelled: {
      badge: { bg: '#fef2f2', color: '#b91c1c' }, // Red
      text: 'Dibatalkan',
      alert: { bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c', icon: CancelIcon,
        title: 'Campaign Dibatalkan', 
        message: 'Campaign dibatalkan.' }
    },
    active: {
      badge: { bg: '#f0fdf4', color: '#15803d' }, // Green
      text: 'Aktif',
      alert: { bg: '#f0fdf4', border: '#86efac', color: '#15803d', icon: RocketLaunchIcon,
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
          bg: '#faf5ff', // Purple
          border: '#d8b4fe',
          color: '#7e22ce',
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
      badge: { bg: '#faf5ff', color: '#7e22ce' }, // Purple
      text: 'Selesai',
      alert: { bg: '#faf5ff', border: '#d8b4fe', color: '#7e22ce', icon: CheckCircleIcon,
        title: 'Campaign Selesai', 
        message: (campaign) => `Campaign ${campaign.title} telah resmi selesai. Terima kasih telah mempercayakan kolaborasi Anda kepada InfluEnt.` }
    },
    paid: {
      badge: { bg: '#f0fdf4', color: '#16a34a' }, // Green-600
      text: 'Terbayar',
      alert: { bg: '#f0fdf4', border: '#86efac', color: '#16a34a', icon: CheckCircleIcon,
        title: 'Pembayaran Selesai', 
        message: (campaign) => `Pembayaran untuk campaign ${campaign.title} telah berhasil didistribusikan kepada semua influencer.` }
    },
    draft: {
      badge: { bg: '#f1f5f9', color: '#475569' }, // Slate
      text: 'Draft',
      alert: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', icon: CampaignIcon,
        title: 'Campaign Draft', 
        message: 'Campaign ini masih dalam status draft. Silakan lengkapi pembayaran atau publish untuk memulai.' }
    },
    archived: {
      badge: { bg: '#f8fafc', color: '#64748b' }, // Gray
      text: '🗂️ Diarsipkan',
      alert: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', icon: ArchiveIcon,
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
        mt: 2, p: 2, bgcolor: alert.bg, borderRadius: 2, 
        border: `1px solid ${alert.border}`, display: 'flex', 
        gap: 1.5, alignItems: 'flex-start' 
      }}>
        <Icon sx={{ fontSize: 20, color: alert.color, mt: 0.3 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ 
            fontSize: 14, color: alert.color, fontWeight: 700, 
            mb: 0.5
          }}>
            {alert.title}
          </Typography>
          <Typography sx={{ 
            fontSize: 13, color: alert.color, 
            lineHeight: 1.5, opacity: 0.9
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

  // Helper to format banner URL
  const getBannerUrl = (image) => {
     if (!image) return null;
     if (image.startsWith('http') || image.startsWith('data:')) return image;
     return `http://localhost:8000/api/uploads/${image}`;
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, ml: isMobile ? 0 : 32.5, overflow: 'hidden' }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ mt: 9, minHeight: 'calc(100vh - 72px)', overflow: 'hidden' }}>
            <Container
              maxWidth="lg"
              sx={{
                py: { xs: 2, md: 4 },
                height: 'calc(100vh - 72px)',
                overflow: 'auto',
              }}
            >
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
               <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
                     Daftar Campaign
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                     Kelola semua campaign aktif dan draft anda disini
                  </Typography>
               </Box>
               
              <Button
                variant="contained"
                onClick={() => navigate('/campaign-create')}
                sx={{
                  bgcolor: '#6E00BE',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 15,
                  px: 3,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#5a009e', boxShadow: 'none' }
                }}
              >
                + Buat Campaign
              </Button>
            </Stack>

            {/* Search & Filter */}
            <Paper elevation={0} sx={{ p: 2, mb: 4, border: '1px solid #e2e8f0', borderRadius: 3 }}>
               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                     fullWidth
                     placeholder="Cari berdasarkan judul campaign..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     size="small"
                     InputProps={{
                        startAdornment: (
                           <InputAdornment position="start">
                              <SearchIcon sx={{ color: '#94a3b8' }} />
                           </InputAdornment>
                        ),
                     }}
                     sx={{
                        '& .MuiOutlinedInput-root': {
                           bgcolor: '#fff',
                           '& fieldset': { borderColor: '#e2e8f0' },
                           '&:hover fieldset': { borderColor: '#cbd5e1' },
                           '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                        }
                     }}
                  />
                  <Select
                     value={filter}
                     onChange={e => setFilter(e.target.value)}
                     displayEmpty
                     size="small"
                     sx={{
                        minWidth: 200,
                        bgcolor: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6E00BE' },
                     }}
                  >
                     <MenuItem value="">Semua Status</MenuItem>
                     <MenuItem value="active">Aktif</MenuItem>
                     <MenuItem value="admin_review">Ditinjau Admin</MenuItem>
                     <MenuItem value="pending_payment">Menunggu Pembayaran</MenuItem>
                     <MenuItem value="draft">Draft</MenuItem>
                     <MenuItem value="completed">Selesai</MenuItem>
                     <MenuItem value="paid">Terbayar</MenuItem>
                     <MenuItem value="cancelled">Dibatalkan</MenuItem>
                     <MenuItem value="archived">Diarsipkan</MenuItem>
                  </Select>
               </Stack>
            </Paper>

            {/* Campaign Cards */}
            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#94a3b8' }}>Memuat campaign...</Typography>
              </Box>
            ) : currentCampaigns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                 <Box sx={{ mb: 2, display: 'inline-flex', p: 2, bgcolor: '#f1f5f9', borderRadius: '50%' }}>
                     <CampaignIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
                 </Box>
                <Typography sx={{ color: '#1e293b', fontWeight: 600, fontSize: 16 }}>Belum ada campaign</Typography>
                <Typography sx={{ color: '#64748b', fontSize: 14 }}>Buat campaign pertama anda sekarang</Typography>
              </Box>
            ) : currentCampaigns.map(campaign => (
              <Card
                key={campaign.campaign_id}
                elevation={0}
                sx={{
                  p: 3,
                  mb: 2,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': {
                     borderColor: '#cbd5e1',
                     transform: 'translateY(-2px)'
                  }
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                   {/* Image Box - FLAT DESIGN */}
                   <Box
                     onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                     sx={{
                       width: { xs: '100%', md: 100 }, 
                       height: 100,
                       bgcolor: '#f1f5f9', // Solid gray
                       borderRadius: 2,
                       display: 'flex',
                       alignItems: 'center', 
                       justifyContent: 'center',
                       overflow: 'hidden',
                       cursor: 'pointer', 
                       flexShrink: 0,
                       border: '1px solid #e2e8f0'
                     }}
                   >
                     {campaign.banner_image ? (
                       <Box component="img" src={getBannerUrl(campaign.banner_image)} alt={campaign.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : (
                        <Stack alignItems="center">
                           {React.createElement(getCategoryIcon(campaign.campaign_category), {
                              sx: { fontSize: 28, color: '#94a3b8', mb: 0.5 }
                           })}
                           <Typography sx={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                              {(campaign.campaign_category || '').split(' ')[0]}
                           </Typography>
                        </Stack>
                     )}
                   </Box>

                   {/* Content */}
                   <Box sx={{ flex: 1, width: '100%' }}>
                     <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Box onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)} sx={{ cursor: 'pointer' }}>
                           <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#1e293b', mb: 0.5 }}>
                              {campaign.title}
                           </Typography>
                           <Typography sx={{ color: '#64748b', fontSize: 14 }}>
                              {campaign.campaign_category || 'Tanpa Kategori'}
                           </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                           <Chip 
                              label={getStatusConfig(campaign.status, campaign.sub_status).text}
                              size="small"
                              sx={{ 
                                 bgcolor: getStatusConfig(campaign.status, campaign.sub_status).badge.bg,
                                 color: getStatusConfig(campaign.status, campaign.sub_status).badge.color,
                                 fontWeight: 600,
                                 borderRadius: 2,
                                 height: 28
                              }}
                           />
                           {(campaign.sub_status === 'payout_success' || campaign.status?.toLowerCase() === 'completed') && (
                              <IconButton
                                 size="small"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleMenuOpen(e, campaign.campaign_id);
                                 }}
                              >
                                 <MoreVertIcon fontSize="small" />
                              </IconButton>
                           )}
                        </Stack>
                     </Stack>

                     {/* Stats - Flat Text Only */}
                     <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                           {campaign.influencer_count || 0} Influencer
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                              •
                           </Typography>
                            <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                               Rp {parseInt(campaign.price_per_post || 0).toLocaleString('id-ID')}
                            </Typography>
                         </Stack>
                         <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                               •
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                               {campaign.min_followers ? `${parseInt(campaign.min_followers).toLocaleString('id-ID')}+` : '0'} Followers
                            </Typography>
                         </Stack>
                      </Stack>
 
                      {/* Date Range */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                         <CalendarTodayIcon sx={{ fontSize: 14, color: '#64748b' }} />
                         <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                            {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'} 
                            {' — '}
                            {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                         </Typography>
                      </Stack>
 
                      {/* Status Alert */}
                      <StatusAlert 
                         status={campaign.status} 
                         subStatus={campaign.sub_status}
                         cancellationReason={campaign.cancellation_reason} 
                         campaign={campaign}
                      />
 
                      {/* Actions - Flat/Outlined Buttons */}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                         <Button
                            variant="outlined"
                            onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                            sx={{
                               flex: 1,
                               borderColor: '#e2e8f0',
                               color: '#475569',
                               textTransform: 'none',
                               fontWeight: 600,
                               borderRadius: 2,
                               '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                            }}
                         >
                            {campaign.status?.toLowerCase() === 'draft' ? 'Edit Campaign' : 'Lihat Detail'}
                         </Button>
 
                         {/* Specific Action Buttons based on status */}
                         {campaign.status && campaign.status.toLowerCase() === 'pending_payment' && (
                            <Button
                               variant="contained"
                               disableElevation
                               startIcon={<CreditCardIcon />}
                               onClick={e => { e.stopPropagation(); navigate(`/campaign/${campaign.campaign_id}/payment`); }}
                               sx={{ flex: 1, bgcolor: '#6E00BE', color: '#fff', fontWeight: 600, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#5a009e' } }}
                            >
                               Bayar Sekarang
                            </Button>
                         )}
                         {(campaign.status && campaign.status.toLowerCase() === 'active') || (campaign.status && campaign.status.toLowerCase() === 'paid') ? (
                            <>
                               <Button
                                  variant="outlined"
                                  startIcon={<GroupIcon />}
                                  onClick={e => { e.stopPropagation(); navigate(`/campaign/${campaign.campaign_id}/applicants`); }}
                                  sx={{ flex: 1, borderColor: '#6E00BE', color: '#6E00BE', fontWeight: 600, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#F3E5F5' } }}
                               >
                                  Pelamar
                               </Button>
                               <Button
                                  variant="contained"
                                  disableElevation
                                  startIcon={<RateReviewIcon />}
                                  onClick={e => { e.stopPropagation(); navigate(`/campaign/${campaign.campaign_id}/review-submissions`); }}
                                  sx={{ flex: 1, bgcolor: '#6E00BE', color: '#fff', fontWeight: 600, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#5a009e' } }}
                               >
                                  Review
                               </Button>
                               {(campaign.status.toLowerCase() === 'active' && campaign.end_date && new Date(campaign.end_date) < new Date()) && (
                                 <Button
                                    variant="outlined"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={e => { e.stopPropagation(); handleCompleteCampaign(campaign.campaign_id); }}
                                    sx={{ flex: 1, borderColor: '#10b981', color: '#10b981', fontWeight: 600, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#ecfdf5', borderColor: '#10b981' } }}
                                 >
                                    Selesai
                                 </Button>
                               )}
                            </>
                         ) : null}
                         {campaign.status && campaign.status.toLowerCase() === 'completed' && (
                            <Button
                               variant="contained"
                               disableElevation
                               startIcon={<CreditCardIcon />}
                               onClick={e => { e.stopPropagation(); handleDistributePayment(campaign.campaign_id); }}
                               sx={{ flex: 1, bgcolor: '#10b981', color: '#fff', fontWeight: 600, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#059669' } }}
                            >
                               Distribusi Pembayaran
                            </Button>
                         )}
                         {campaign.status && campaign.status.toLowerCase() === 'draft' && (
                            <Button
                               variant="outlined"
                               startIcon={<DeleteIcon />}
                               onClick={e => { e.stopPropagation(); handleDeleteCampaign(campaign.campaign_id); }}
                               sx={{ flex: 1, borderColor: '#ef4444', color: '#ef4444', fontWeight: 600, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' } }}
                            >
                               Hapus
                            </Button>
                         )}
                      </Stack>
                    </Box>
                 </Stack>
              </Card>
            ))}
            
             {/* Pagination controls - Frontend Pagination */}
             {!isLoading && filteredCampaigns.length > ITEMS_PER_PAGE && (
               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button variant="outlined" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} sx={{ borderColor: '#e2e8f0', color: '#475569', borderRadius: 2, textTransform: 'none' }}>Sebelumnya</Button>
                  <Typography sx={{ display: 'flex', alignItems: 'center', px: 2, color: '#475569' }}>
                     Halaman {currentPage} dari {totalPages}
                  </Typography>
                  <Button variant="outlined" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} sx={{ borderColor: '#e2e8f0', color: '#475569', borderRadius: 2, textTransform: 'none' }}>Berikutnya</Button>
               </Box>
             )}
           </Container>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ elevation: 2, sx: { borderRadius: 2, border: '1px solid #e2e8f0' } }}
      >
        <MenuItem onClick={() => handleArchiveClick(campaigns.find(c => c.campaign_id === menuCampaignId))} sx={{ fontSize: 14 }}>
          <ArchiveIcon sx={{ fontSize: 18, mr: 1.5, color: '#64748b' }} />
          Arsipkan Campaign
        </MenuItem>
      </Menu>

      <Dialog open={showArchiveModal} onClose={() => setShowArchiveModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>Arsipkan Campaign?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b' }}>
            Campaign "{selectedCampaign?.title}" akan dipindahkan ke arsip.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setShowArchiveModal(false)} sx={{ color: '#64748b', fontWeight: 600 }}>Batal</Button>
          <Button onClick={handleArchiveConfirm} variant="contained" disableElevation sx={{ bgcolor: '#d32f2f', fontWeight: 600, color: '#fff', '&:hover': { bgcolor: '#b71c1c' } }}>Arsipkan</Button>
        </DialogActions>
      </Dialog>

      {/* Generic Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b' }}>
            {confirmMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setShowConfirmDialog(false)} sx={{ color: '#64748b', fontWeight: 600 }}>Batal</Button>
          <Button onClick={handleConfirmAction} variant="contained" disableElevation sx={{ bgcolor: '#6E00BE', fontWeight: 600, color: '#fff', '&:hover': { bgcolor: '#5a009e' } }}>
            Konfirmasi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CampaignList;
