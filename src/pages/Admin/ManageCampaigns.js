import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  Card, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  useTheme,
  useMediaQuery,
  Divider,
  Grid,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  CheckCircle as CompletedIcon,
  HourglassEmpty as OngoingIcon,
  People as ApplicantIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Payment as TransactionsIcon,
  Receipt as ReceiptIcon,
  CalendarToday,
  AccessTime,
  Group,
  MonetizationOn,
  Description,
  Assignment,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Sidebar, Topbar } from '../../components/common';
import adminService from '../../services/adminService';

function ManageCampaigns() {
  const theme = useTheme();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const limit = 10;

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  // Edit form data
  const [editFormData, setEditFormData] = useState({
    title: '',
    campaign_category: '',
    influencer_category: [],
    has_product: false,
    product_name: '',
    product_value: '',
    product_desc: '',
    startDate: '',
    endDate: '',
    submission_deadline: '',
    content_guidelines: '',
    caption_guidelines: '',
    influencer_count: 0,
    price_per_post: '',
    min_followers: 0,
    selected_gender: '',
    selected_age: '',
    criteria_desc: '',
    status: ''
  });



  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [page, filterStatus, searchQuery]);

  const fetchStats = async () => {
    try {
      const [totalRes, activeRes, completedRes, reviewRes, paymentRes] = await Promise.all([
        adminService.campaigns.getAllCampaigns({ limit: 1 }),
        adminService.campaigns.getAllCampaigns({ limit: 1, status: 'active' }),
        adminService.campaigns.getAllCampaigns({ limit: 1, status: 'completed' }),
        adminService.campaigns.getAllCampaigns({ limit: 1, status: 'admin_review' }),
        adminService.campaigns.getAllCampaigns({ limit: 1, status: 'pending_payment' })
      ]);

      const getCount = (res) => (res && typeof res.total === 'number') ? res.total : (Array.isArray(res?.campaigns) ? res.campaigns.length : (Array.isArray(res?.data) ? res.data.length : 0));

      const pendingCount = getCount(reviewRes) + getCount(paymentRes);

      setStatsData({
        total: getCount(totalRes),
        active: getCount(activeRes),
        completed: getCount(completedRes),
        pending: pendingCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }; 


  const isCampaingEditable = (campaign) => {
      return campaign.status !== 'rejected' && campaign.status !== 'completed';
  };

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuSelectedCampaign, setMenuSelectedCampaign] = useState(null);

  const handleMenuOpen = (event, campaign) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuSelectedCampaign(null);
  };

  const handleMenuAction = (action) => {
    if (menuSelectedCampaign) {
      action(menuSelectedCampaign);
    }
    handleMenuClose();
  };
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.campaigns.getAllCampaigns({
        page,
        limit,
        status: filterStatus || undefined,
        search: searchQuery || undefined
      });

      const campaignsList = response?.data || response?.campaigns || [];
      setCampaigns(Array.isArray(campaignsList) ? campaignsList : []);
      setTotalCampaigns(response?.total || campaignsList.length);
      setTotalPages(response?.totalPages || Math.ceil(campaignsList.length / limit));
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setError('Gagal memuat kampanye');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleViewDetail = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  const handleEditClick = (campaign) => {
    setSelectedCampaign(campaign);
    
    // Parse influencer_category if it's a JSON string
    let influencerCategories = [];
    if (campaign.influencer_category) {
      try {
        influencerCategories = typeof campaign.influencer_category === 'string' 
          ? JSON.parse(campaign.influencer_category)
          : campaign.influencer_category;
      } catch (e) {
        console.error('Error parsing influencer_category:', e);
        influencerCategories = [];
      }
    }
    
    setEditFormData({
      title: campaign.title || '',
      campaign_category: campaign.campaign_category || '',
      influencer_category: influencerCategories,
      has_product: campaign.has_product || false,
      product_name: campaign.product_name || '',
      product_value: campaign.product_value || '',
      product_desc: campaign.product_desc || '',
      startDate: campaign.start_date ? campaign.start_date.split('T')[0] : '',
      endDate: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      submission_deadline: campaign.submission_deadline ? campaign.submission_deadline.split('T')[0] : '',
      content_guidelines: campaign.content_guidelines || '',
      caption_guidelines: campaign.caption_guidelines || '',
      influencer_count: campaign.influencer_count || 0,
      price_per_post: campaign.price_per_post || '',
      min_followers: campaign.min_followers || 0,
      selected_gender: campaign.selected_gender || '',
      selected_age: campaign.selected_age || '',
      criteria_desc: campaign.criteria_desc || '',
      status: campaign.status || 'draft'
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!editFormData.title || !editFormData.price_per_post) {
        setError('Judul dan harga per post wajib diisi');
        return;
      }

      // Map form data to API structure
      const updateData = {
        title: editFormData.title,
        campaign_category: editFormData.campaign_category,
        influencer_category: editFormData.influencer_category,
        has_product: editFormData.has_product,
        product_name: editFormData.product_name,
        product_value: editFormData.product_value,
        product_desc: editFormData.product_desc,
        start_date: editFormData.startDate,
        end_date: editFormData.endDate,
        submission_deadline: editFormData.submission_deadline,
        content_guidelines: editFormData.content_guidelines,
        caption_guidelines: editFormData.caption_guidelines,
        influencer_count: editFormData.influencer_count,
        price_per_post: editFormData.price_per_post,
        min_followers: editFormData.min_followers,
        selected_gender: editFormData.selected_gender,
        selected_age: editFormData.selected_age,
        criteria_desc: editFormData.criteria_desc,
        status: editFormData.status
      };

      await adminService.campaigns.updateCampaign(selectedCampaign.campaign_id, updateData);
      setSuccessMessage('Kampanye berhasil diperbarui');
      setShowEditModal(false);
      loadCampaigns();
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err.message || 'Gagal memperbarui kampanye');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await adminService.transactions.getAllTransactions({ limit: 100 });
      const txList = Array.isArray(response) ? response : (response.transactions || response.data || []);
      setTransactions(txList);
      setShowTransactionsModal(true);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'Gagal memuat transaksi');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleUpdateStatus = async (campaignId, newStatus) => {
    try {
      setSubmitting(true);
      
      if (newStatus === 'pending_payment') {
        // Approve campaign
        await adminService.campaigns.approveCampaign(campaignId);
        setSuccessMessage('Campaign berhasil disetujui! Status berubah menjadi Pending Payment.');
      } else {
        // Other status updates (if any) still use generic update or specific endpoints if available
        // For now, mapping back to generic update for non-approval status changes if they exist
        const statusMap = {
          'active': 'active',
          'cancelled': 'cancelled',
          'pending_payment': 'pending_payment',
          'rejected': 'rejected'
        };
        
        const updateData = { 
          status: statusMap[newStatus] || newStatus 
        };
  
        await adminService.campaigns.updateCampaign(campaignId, updateData);
        setSuccessMessage('Status campaign berhasil diupdate!');
      }
      
      setShowDetailModal(false);
      loadCampaigns();
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err.message || 'Gagal memperbarui kampanye');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if campaign is active but expired
  const isCampaignExpired = (campaign) => {
    if (!campaign || !campaign.status || !campaign.end_date) return false;
    
    // Check status case-insensitive
    if (campaign.status.toLowerCase() !== 'active') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(campaign.end_date);
    
    // Debug log
    // console.log(`Checking expiry for ${campaign.title}: End=${endDate}, Today=${today}, Expired=${endDate < today}`);
    
    return endDate < today;
  };

  const handleCompleteCampaign = async (campaignId) => {
    try {
      setSubmitting(true);
      await adminService.campaigns.completeCampaign(campaignId);
      setSuccessMessage('Campaign berhasil diselesaikan!');
      setShowDetailModal(false);
      loadCampaigns();
    } catch (err) {
      console.error('Error completing campaign:', err);
      setError(err.message || 'Gagal menyelesaikan kampanye');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDistributePayment = async (campaignId) => {
     if (!window.confirm('Apakah Anda yakin ingin mendistribusikan pembayaran ke semua influencer?')) return;
     
    try {
      setSubmitting(true);
      await adminService.campaigns.distributePayment(campaignId);
      setSuccessMessage('Pembayaran berhasil didistribusikan ke semua influencer!');
      setShowDetailModal(false);
      loadCampaigns();
    } catch (err) {
      console.error('Error distributing payment:', err);
      setError(err.message || 'Gagal mendistribusikan pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectCampaign = async () => {
    if (!cancellationReason && !customReason) {
      setError('Harap pilih atau tulis alasan pembatalan');
      return;
    }

    try {
      setSubmitting(true);
      const finalReason = cancellationReason === 'other' ? customReason : cancellationReason;
      
      // Use specific reject endpoint
      await adminService.campaigns.rejectCampaign(selectedCampaign.campaign_id, finalReason);
      
      setSuccessMessage('Campaign berhasil dibatalkan.');
      setShowRejectDialog(false);
      setShowDetailModal(false);
      setCancellationReason('');
      setCustomReason('');
      loadCampaigns();
    } catch (err) {
      console.error('Error cancelling campaign:', err);
      setError(err.message || 'Gagal membatalkan kampanye');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setSubmitting(true);
      await adminService.campaigns.deleteCampaign(campaignToDelete.campaign_id);
      setSuccessMessage('Kampanye berhasil dihapus');
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
      loadCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError(err.message || 'Gagal menghapus kampanye');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'admin_review':
        return { bg: '#fff3cd', color: '#856404' };
      case 'pending_payment':
        return { bg: '#cfe2ff', color: '#084298' };
      case 'completed':
        return { bg: '#e0d4ff', color: '#5b21b6' };
      case 'cancelled':
        return { bg: '#ffe5e5', color: '#c41e3a' };
      default:
        return { bg: '#e5e7eb', color: '#374151' };
    }
  };

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Aktif';
      case 'admin_review': return 'Ditinjau Admin';
      case 'pending_payment': return 'Menunggu Pembayaran';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      case 'rejected': return 'Ditolak';
      default: return status?.replace('_', ' ') || 'Draft';
    }
  };

  const stats = statsData;

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        sx={{
          marginLeft: isDesktop && sidebarOpen ? '260px' : 0,
          width: isDesktop && sidebarOpen ? 'calc(100% - 260px)' : '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          transition: 'margin-left 0.3s, width 0.3s'
        }}
      >
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ mt: 9, p: 4, backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 72px)' }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontSize: 32 }}>
                Kelola Kampanye
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#6c757d' }}>
                Pantau dan kelola semua kampanye di platform
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadCampaigns}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#6E00BE',
                  color: '#6E00BE',
                  '&:hover': {
                    borderColor: '#5a009e',
                    backgroundColor: 'rgba(110, 0, 190, 0.04)'
                  }
                }}
              >
                Muat Ulang
              </Button>
              <Button
                variant="contained"
                startIcon={<TransactionsIcon />}
                onClick={handleViewTransactions}
                disabled={loadingTransactions}
                sx={{
                  bgcolor: '#10b981', // Keep independent green for transactions or make primary? Keeping green to distinguish.
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#059669', boxShadow: 'none' }
                }}
              >
                {loadingTransactions ? <CircularProgress size={20} /> : 'Lihat Transaksi'}
              </Button>
            </Stack>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Stats Overview */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 3,
            mb: 4
          }}>
            {[
              { label: 'Total Kampanye', value: stats.total, IconComponent: CampaignIcon, bgColor: '#F3E5F5', iconColor: '#6E00BE' }, // Primary
              { label: 'Aktif', value: stats.active, IconComponent: OngoingIcon, bgColor: '#d1fae5', iconColor: '#059669' },
              { label: 'Selesai', value: stats.completed, IconComponent: CompletedIcon, bgColor: '#dbeafe', iconColor: '#1e40af' },
              { label: 'Tertunda', value: stats.pending, IconComponent: ApplicantIcon, bgColor: '#fef3c7', iconColor: '#d97706' }
            ].map((stat, index) => (
              <Box
                key={index}
                sx={{
                  background: '#fff',
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#cbd5e0',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.IconComponent sx={{ fontSize: 28, color: stat.iconColor }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1a1f36' }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Filters */}
          <Box sx={{
            background: '#fff',
            borderRadius: 3,
            p: 3,
            mb: 3,
            border: '1px solid #e2e8f0'
          }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Cari kampanye..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6c757d' }} />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  bgcolor: '#6E00BE', // Flat Primary
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 100,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#5a009e', boxShadow: 'none' }
                }}
              >
                Cari
              </Button>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                size="small"
                displayEmpty
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">Semua</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="admin_review">Ditinjau Admin</MenuItem>
                <MenuItem value="pending_payment">Menunggu Pembayaran</MenuItem>
                <MenuItem value="completed">Selesai</MenuItem>
                <MenuItem value="cancelled">Dibatalkan</MenuItem>
                <MenuItem value="rejected">Ditolak</MenuItem>
              </Select>
            </Stack>
          </Box>

          {/* Campaigns Table */}
          <Box sx={{
            background: '#fff',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (() => {
              // Filter campaigns
              const filteredCampaigns = campaigns.filter(campaign => {
                const matchesStatus = !filterStatus || campaign.status?.toLowerCase() === filterStatus.toLowerCase();
                const matchesSearch = !searchQuery || 
                  campaign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  campaign.campaign_category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  campaign.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesStatus && matchesSearch;
              });

              // Frontend pagination
              const paginatedCampaigns = filteredCampaigns.slice((page - 1) * limit, page * limit);
              const calculatedTotalPages = Math.ceil(filteredCampaigns.length / limit);

              return filteredCampaigns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CampaignIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                <Typography sx={{ fontSize: 18, color: '#6c757d', fontWeight: 500 }}>
                  Tidak ada kampanye ditemukan
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#a0aec0', mt: 1 }}>
                  {searchQuery || filterStatus ? 'Coba sesuaikan filter Anda' : 'Kampanye akan muncul di sini setelah dibuat'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f7fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Kampanye</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Perusahaan</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Anggaran</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Dibuat</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14, textAlign: 'center' }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCampaigns.map((campaign) => {
                        const statusColors = getStatusColor(campaign.status);
                        return (
                          <TableRow
                            key={campaign.campaign_id}
                            sx={{
                              '&:hover': { bgcolor: '#f7fafc' },
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, color: '#1a1f36', fontSize: 14 }}>
                                {campaign.title || 'Tanpa Judul'}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#6c757d' }}>
                                {campaign.campaign_category || 'Tanpa kategori'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                                {campaign.user?.name || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, color: '#1a1f36', fontSize: 14 }}>
                                Rp {((campaign.price_per_post * campaign.influencer_count) || 0).toLocaleString('id-ID')}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: '#6c757d' }}>
                                {campaign.influencer_count} influencer
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={translateStatus(campaign.status)}
                                size="small"
                                sx={{
                                  bgcolor: statusColors.bg,
                                  color: statusColors.color,
                                  fontSize: 12,
                                  textTransform: 'capitalize',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                                {new Date(campaign.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                                  <Stack direction="row" spacing={1} justifyContent="center">
                                  {campaign.status === 'admin_review' && (
                                    <>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleUpdateStatus(campaign.campaign_id, 'pending_payment')}
                                        sx={{
                                          color: '#10b981',
                                          '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
                                        }}
                                        title="Setujui Kampanye"
                                      >
                                        <ApproveIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setSelectedCampaign(campaign);
                                          setShowRejectDialog(true);
                                        }}
                                        sx={{
                                          color: '#ef4444',
                                          '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                        }}
                                        title="Tolak Kampanye"
                                      >
                                        <RejectIcon fontSize="small" />
                                      </IconButton>
                                    </>
                                  )}
                                    {/* Action: Complete Campaign (If Active & Expired) */}
                                    {campaign.status?.toLowerCase() === 'active' && isCampaignExpired(campaign) && (
                                       <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => handleCompleteCampaign(campaign.campaign_id)}
                                          startIcon={<CompletedIcon />}
                                          sx={{
                                             bgcolor: '#5b21b6',
                                             color: '#fff',
                                             textTransform: 'none',
                                             fontSize: 12,
                                             fontWeight: 600,
                                             minWidth: 'auto',
                                             px: 1,
                                             '&:hover': { bgcolor: '#4c1d95' }
                                          }}
                                       >
                                          Selesai
                                       </Button>
                                    )}

                                    {/* Action: Distribute Payment (If Completed) */}
                                    {campaign.status === 'completed' && (
                                       <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => handleDistributePayment(campaign.campaign_id)}
                                          startIcon={<MonetizationOn />}
                                          sx={{
                                             bgcolor: '#059669',
                                             color: '#fff',
                                             textTransform: 'none',
                                             fontSize: 12,
                                             fontWeight: 600,
                                             minWidth: 'auto',
                                             px: 1,
                                             '&:hover': { bgcolor: '#047857' }
                                          }}
                                       >
                                          Bayar
                                       </Button>
                                    )}
                               
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, campaign)}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Pagination
                    count={calculatedTotalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              </>
            );
            })()}
          </Box>

          {/* Campaign Detail Modal */}
          <Dialog
            open={showDetailModal}
            onClose={() => !submitting && setShowDetailModal(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Detail Kampanye
              <IconButton onClick={() => setShowDetailModal(false)} disabled={submitting}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3, bgcolor: '#f8f9fa' }}>
              {selectedCampaign && (
                <Stack spacing={3}>
                  {/* Section A: Ringkasan Campaign */}
                  <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {/* Header info */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Chip 
                            label={translateStatus(selectedCampaign.status)}
                            size="small"
                            sx={{ ...getStatusColor(selectedCampaign.status), fontWeight: 600, fontSize: 12 }}
                          />
                        </Stack>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36', mb: 1, lineHeight: 1.3 }}>
                          {selectedCampaign.title}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: '#6c757d' }}>
                          Oleh <strong>{selectedCampaign.user?.name}</strong> • {selectedCampaign.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: '#64748b', mb: 0.5, fontWeight: 700, letterSpacing: '0.5px' }}>KATEGORI CAMPAIGN</Typography>
                            <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{selectedCampaign.campaign_category || '-'}</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: '#64748b', mb: 0.5, fontWeight: 700, letterSpacing: '0.5px' }}>KATEGORI INFLUENCER</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(() => {
                                try {
                                  const categories = typeof selectedCampaign.influencer_category === 'string' 
                                    ? JSON.parse(selectedCampaign.influencer_category)
                                    : selectedCampaign.influencer_category;
                                  return Array.isArray(categories) 
                                    ? categories.map((cat, idx) => (
                                        <Chip key={idx} label={cat} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 600, height: 24 }} />
                                      ))
                                    : <Typography sx={{ fontSize: 14, color: '#6c757d' }}>-</Typography>;
                                } catch (e) {
                                  return <Typography sx={{ fontSize: 14, color: '#6c757d' }}>-</Typography>;
                                }
                              })()}
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: '#64748b', mb: 0.5, fontWeight: 700, letterSpacing: '0.5px' }}>JUMLAH INFLUENCER & FEE</Typography>
                            <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {selectedCampaign.influencer_count || 0} Influencer × Rp {(selectedCampaign.price_per_post || 0).toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: '#64748b', mb: 0.5, fontWeight: 700, letterSpacing: '0.5px' }}>ESTIMASI TOTAL ANGGARAN</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#6E00BE' }}>
                              Rp {((selectedCampaign.price_per_post || 0) * (selectedCampaign.influencer_count || 0)).toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Section B: Informasi Produk */}
                  {selectedCampaign.has_product && (
                    <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                      <Box sx={{ bgcolor: '#f8fafc', px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Informasi Produk</Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', mb: 0.5 }}>NAMA PRODUK</Typography>
                              <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{selectedCampaign.product_name}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', mb: 0.5 }}>NILAI PRODUK</Typography>
                              <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Rp {(selectedCampaign.product_value || 0).toLocaleString('id-ID')}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', mb: 0.5 }}>DESKRIPSI LENGKAP</Typography>
                              <Typography sx={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-wrap', bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                                {selectedCampaign.product_desc || '-'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Card>
                  )}

                  {/* Section C: Kriteria Influencer */}
                  <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Box sx={{ bgcolor: '#f8fafc', px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Kriteria Influencer</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={6} md={4}>
                          <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>MINIMAL FOLLOWERS</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 0.5, color: '#0f172a' }}>
                            <Group sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom', color: '#64748b' }} />
                            {(selectedCampaign.min_followers || 0).toLocaleString()}+
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>TARGET GENDER</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 0.5, textTransform: 'capitalize', color: '#0f172a' }}>
                            {selectedCampaign.selected_gender === 'all' ? 'Semua Gender' : selectedCampaign.selected_gender}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>TARGET USIA</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 0.5, color: '#0f172a' }}>
                            {selectedCampaign.selected_age || 'Semua Usia'}
                          </Typography>
                        </Grid>
                      </Grid>
                      {selectedCampaign.criteria_desc && (
                        <Box>
                          <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', mb: 0.5 }}>KRITERIA TAMBAHAN</Typography>
                          <Typography sx={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-wrap', bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                            {selectedCampaign.criteria_desc}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>

                  {/* Section D: Konten & Anggaran */}
                  <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Box sx={{ bgcolor: '#f8fafc', px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Konten & Anggaran</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#334155', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assignment fontSize="small" sx={{ color: '#64748b' }} /> Detail Konten
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>TIPE KONTEN</Typography>
                              <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>Instagram Feed / Story / Reels</Typography> 
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>JUMLAH POST</Typography>
                              <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>1 Post per Influencer</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 0 }} />
                        <Grid item xs={12} md={5}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#334155', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MonetizationOn fontSize="small" sx={{ color: '#64748b' }} /> Rincian Anggaran
                          </Typography>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography sx={{ fontSize: 13, color: '#64748b' }}>Jumlah Influencer</Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{selectedCampaign.influencer_count || 0}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography sx={{ fontSize: 13, color: '#64748b' }}>Fee per Influencer</Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Rp {(selectedCampaign.price_per_post || 0).toLocaleString('id-ID')}</Typography>
                            </Box>
                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Total Anggaran</Typography>
                              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                                Rp {((selectedCampaign.price_per_post || 0) * (selectedCampaign.influencer_count || 0)).toLocaleString('id-ID')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>

                  {/* Section E: Timeline Campaign */}
                  <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Box sx={{ bgcolor: '#f8fafc', px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Timeline Campaign</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ p: 1, bgcolor: '#eff6ff', borderRadius: '50%', color: '#3b82f6' }}>
                              <AccessTime fontSize="small" />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>DEADLINE REGISTRASI</Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                {selectedCampaign.submission_deadline ? new Date(selectedCampaign.submission_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: '50%', color: '#22c55e' }}>
                              <CalendarToday fontSize="small" />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>TANGGAL MULAI</Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                {selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ p: 1, bgcolor: '#fff1f2', borderRadius: '50%', color: '#f43f5e' }}>
                              <CalendarToday fontSize="small" />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>TANGGAL SELESAI</Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                {selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>

                  {/* Section F: Brief & Guideline */}
                  <Card variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Box sx={{ bgcolor: '#f8fafc', px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Brief & Guideline</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', mb: 1 }}>GUIDELINE FOTO / VIDEO</Typography>
                          <Typography sx={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-wrap', bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                            {selectedCampaign.content_guidelines || 'Tidak ada panduan spesifik'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', mb: 1 }}>GUIDELINE CAPTION & HASHTAG</Typography>
                          <Typography sx={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-wrap', bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #f1f5f9' }}>
                            {selectedCampaign.caption_guidelines || 'Tidak ada panduan spesifik'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Card>

                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setShowDetailModal(false)}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Tutup
              </Button>
              {selectedCampaign?.status?.toLowerCase() === 'admin_review' && (
                <>
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRejectDialog(true);
                    }}
                    disabled={submitting}
                    startIcon={<RejectIcon />}
                    sx={{
                      textTransform: 'none',
                      color: '#ef4444',
                      bgcolor: '#fff5f5',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#fee2e2' }
                    }}
                  >
                    Tolak Campaign
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedCampaign.campaign_id, 'pending_payment')}
                    disabled={submitting}
                    variant="contained"
                    startIcon={<ApproveIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {submitting ? <CircularProgress size={20} /> : 'Setujui'}
                  </Button>
                </>
              )}
              
            </DialogActions>
          </Dialog>

          {/* Edit Campaign Dialog */}
          <Dialog
            open={showEditModal}
            onClose={() => !submitting && setShowEditModal(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
              Edit Kampanye
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3} sx={{ pt: 1 }}>
                <TextField
                  label="Judul Kampanye"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  fullWidth
                  required
                />
                <Select
                  value={editFormData.campaign_category}
                  onChange={(e) => setEditFormData({ ...editFormData, campaign_category: e.target.value })}
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="">Pilih Kategori</MenuItem>
                  <MenuItem value="Entertainment">Hiburan</MenuItem>
                  <MenuItem value="Fashion">Mode</MenuItem>
                  <MenuItem value="Beauty">Kecantikan</MenuItem>
                  <MenuItem value="Food & Beverage">Makanan & Minuman</MenuItem>
                  <MenuItem value="Health & Sport">Kesehatan & Olahraga</MenuItem>
                  <MenuItem value="Technology">Teknologi</MenuItem>
                  <MenuItem value="Travel">Perjalanan</MenuItem>
                  <MenuItem value="Lifestyle">Gaya Hidup</MenuItem>
                </Select>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Harga Per Post (Rp)"
                      type="number"
                      value={editFormData.price_per_post}
                      onChange={(e) => setEditFormData({ ...editFormData, price_per_post: e.target.value })}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Jumlah Influencer"
                      type="number"
                      value={editFormData.influencer_count}
                      onChange={(e) => setEditFormData({ ...editFormData, influencer_count: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Tanggal Mulai"
                      type="date"
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Tanggal Selesai"
                      type="date"
                      value={editFormData.endDate}
                      onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Batas Waktu"
                      type="date"
                      value={editFormData.submission_deadline}
                      onChange={(e) => setEditFormData({ ...editFormData, submission_deadline: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Min Pengikut"
                      type="number"
                      value={editFormData.min_followers}
                      onChange={(e) => setEditFormData({ ...editFormData, min_followers: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Select
                      value={editFormData.selected_gender}
                      onChange={(e) => setEditFormData({ ...editFormData, selected_gender: e.target.value })}
                      fullWidth
                      displayEmpty
                    >
                      <MenuItem value="">Jenis Kelamin</MenuItem>
                      <MenuItem value="male">Laki-laki</MenuItem>
                      <MenuItem value="female">Perempuan</MenuItem>
                      <MenuItem value="all">Semua</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={4}>
                    <Select
                      value={editFormData.selected_age}
                      onChange={(e) => setEditFormData({ ...editFormData, selected_age: e.target.value })}
                      fullWidth
                      displayEmpty
                    >
                      <MenuItem value="">Rentang Usia</MenuItem>
                      <MenuItem value="13-17 tahun">13-17 tahun</MenuItem>
                      <MenuItem value="18-24 tahun">18-24 tahun</MenuItem>
                      <MenuItem value="25-34 tahun">25-34 tahun</MenuItem>
                      <MenuItem value="35+ tahun">35+ tahun</MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                <Divider />
                
                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>Informasi Produk (Opsional)</Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Nama Produk"
                      value={editFormData.product_name}
                      onChange={(e) => setEditFormData({ ...editFormData, product_name: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Nilai Produk (Rp)"
                      type="number"
                      value={editFormData.product_value}
                      onChange={(e) => setEditFormData({ ...editFormData, product_value: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Deskripsi Produk"
                      value={editFormData.product_desc}
                      onChange={(e) => setEditFormData({ ...editFormData, product_desc: e.target.value })}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Stack>
                </Box>

                <TextField
                  label="Panduan Konten"
                  value={editFormData.content_guidelines}
                  onChange={(e) => setEditFormData({ ...editFormData, content_guidelines: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
                <TextField
                  label="Panduan Caption"
                  value={editFormData.caption_guidelines}
                  onChange={(e) => setEditFormData({ ...editFormData, caption_guidelines: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Deskripsi Kriteria"
                  value={editFormData.criteria_desc}
                  onChange={(e) => setEditFormData({ ...editFormData, criteria_desc: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
                
                <Select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="admin_review">Tinjauan Admin</MenuItem>
                  <MenuItem value="pending_payment">Menunggu Pembayaran</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="completed">Selesai</MenuItem>
                  <MenuItem value="cancelled">Dibatalkan</MenuItem>
                </Select>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setShowEditModal(false)}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                variant="contained"
                disabled={submitting}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Simpan Perubahan'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Transactions Modal */}
          <Dialog
            open={showTransactionsModal}
            onClose={() => setShowTransactionsModal(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Semua Transaksi
              <IconButton onClick={() => setShowTransactionsModal(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {transactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ReceiptIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                  <Typography sx={{ fontSize: 18, color: '#6c757d' }}>Tidak ada transaksi ditemukan</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f7fafc' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Tanggal</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pengguna</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Tipe</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Jumlah</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Deskripsi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx._id} sx={{ '&:hover': { bgcolor: '#f7fafc' } }}>
                          <TableCell>
                            <Typography sx={{ fontSize: 14 }}>
                              {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                              {tx.userId?.name || 'Tidak Diketahui'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tx.type || '-'}
                              size="small"
                              sx={{
                                bgcolor: tx.type === 'credit' ? '#d1fae5' : '#fee2e2',
                                color: tx.type === 'credit' ? '#065f46' : '#991b1b',
                                textTransform: 'capitalize'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                              Rp {(tx.amount || 0).toLocaleString('id-ID')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tx.status || 'completed'}
                              size="small"
                              sx={{
                                textTransform: 'capitalize',
                                ...getStatusColor(tx.status)
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 14, color: '#6c757d' }}>
                              {tx.description || tx.category || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setShowTransactionsModal(false)} sx={{ textTransform: 'none' }}>
                Tutup
              </Button>
            </DialogActions>
          </Dialog>

          {/* Reject Campaign Dialog */}
          <Dialog
            open={showRejectDialog}
            onClose={() => !submitting && setShowRejectDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ color: '#ef4444' }} />
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Tolak Campaign</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Typography sx={{ color: '#6c757d', fontSize: 15, mb: 3 }}>
                Pilih alasan pembatalan campaign <strong>{selectedCampaign?.title}</strong>:
              </Typography>
              
              <Stack spacing={2}>
                <Box 
                  onClick={() => setCancellationReason('Konten campaign tidak sesuai dengan panduan komunitas')}
                  sx={{
                    p: 2,
                    border: cancellationReason === 'Konten campaign tidak sesuai dengan panduan komunitas' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: cancellationReason === 'Konten campaign tidak sesuai dengan panduan komunitas' ? '#fff5f5' : '#fff',
                    '&:hover': { bgcolor: '#f7fafc' }
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Konten tidak sesuai panduan</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6c757d' }}>Campaign melanggar panduan komunitas</Typography>
                </Box>

                <Box 
                  onClick={() => setCancellationReason('Informasi campaign tidak lengkap atau tidak jelas')}
                  sx={{
                    p: 2,
                    border: cancellationReason === 'Informasi campaign tidak lengkap atau tidak jelas' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: cancellationReason === 'Informasi campaign tidak lengkap atau tidak jelas' ? '#fff5f5' : '#fff',
                    '&:hover': { bgcolor: '#f7fafc' }
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Informasi tidak lengkap</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6c757d' }}>Detail campaign kurang jelas atau tidak memadai</Typography>
                </Box>

                <Box 
                  onClick={() => setCancellationReason('Budget atau kompensasi tidak sesuai standar')}
                  sx={{
                    p: 2,
                    border: cancellationReason === 'Budget atau kompensasi tidak sesuai standar' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: cancellationReason === 'Budget atau kompensasi tidak sesuai standar' ? '#fff5f5' : '#fff',
                    '&:hover': { bgcolor: '#f7fafc' }
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Budget tidak sesuai</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6c757d' }}>Kompensasi tidak memenuhi standar minimum</Typography>
                </Box>

                <Box 
                  onClick={() => setCancellationReason('Produk atau layanan melanggar ketentuan')}
                  sx={{
                    p: 2,
                    border: cancellationReason === 'Produk atau layanan melanggar ketentuan' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: cancellationReason === 'Produk atau layanan melanggar ketentuan' ? '#fff5f5' : '#fff',
                    '&:hover': { bgcolor: '#f7fafc' }
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Produk melanggar ketentuan</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6c757d' }}>Produk/layanan yang dipromosikan tidak diizinkan</Typography>
                </Box>

                <Box 
                  onClick={() => setCancellationReason('other')}
                  sx={{
                    p: 2,
                    border: cancellationReason === 'other' ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: cancellationReason === 'other' ? '#fff5f5' : '#fff',
                    '&:hover': { bgcolor: '#f7fafc' }
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Alasan lainnya</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6c757d' }}>Tulis alasan pembatalan sendiri</Typography>
                </Box>

                {cancellationReason === 'other' && (
                  <TextField
                    label="Alasan Pembatalan"
                    multiline
                    rows={4}
                    fullWidth
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Tulis alasan pembatalan campaign..."
                    sx={{ mt: 2 }}
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => {
                  setShowRejectDialog(false);
                  setCancellationReason('');
                  setCustomReason('');
                }}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Batal
              </Button>
              <Button
                onClick={handleRejectCampaign}
                variant="contained"
                disabled={submitting || !cancellationReason || (cancellationReason === 'other' && !customReason)}
                sx={{
                  bgcolor: '#ef4444',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#dc2626' }
                }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Batalkan Campaign'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={showDeleteDialog}
            onClose={() => !submitting && setShowDeleteDialog(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ color: '#ef4444' }} />
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Konfirmasi Hapus</Typography>
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: '#6c757d', fontSize: 15 }}>
                Apakah Anda yakin ingin menghapus kampanye <strong>{campaignToDelete?.title || campaignToDelete?.campaign_title}</strong>? 
                Tindakan ini tidak dapat dibatalkan.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setShowDeleteDialog(false)}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: '#ef4444',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#dc2626' }
                }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Hapus'}
              </Button>
            </DialogActions>
          </Dialog>
            {/* Campaign Actions Menu */}
           <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
           >
            <MenuItem onClick={() => handleMenuAction(handleViewDetail)}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Lihat Detail</ListItemText>
            </MenuItem>
            
            {menuSelectedCampaign && isCampaingEditable(menuSelectedCampaign) && (
              <MenuItem onClick={() => handleMenuAction(handleEditClick)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
            )}

            <MenuItem onClick={() => handleMenuAction(handleDeleteClick)}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Hapus</ListItemText>
            </MenuItem>
           </Menu>
        </Box>
      </Box>
    </Box>
  );
}

export default ManageCampaigns;
