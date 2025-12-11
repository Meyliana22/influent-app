import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from '../../components/common';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Divider,
  Grid
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
  Receipt as ReceiptIcon
} from '@mui/icons-material';
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

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.campaigns.getAllCampaigns();
      console.log('Fetched campaigns:', response);

      // Handle different response structures
      let allCampaigns = [];
      if (Array.isArray(response)) {
        allCampaigns = response;
      } else if (response.campaigns && Array.isArray(response.campaigns)) {
        allCampaigns = response.campaigns;
      } else if (response.data && Array.isArray(response.data)) {
        allCampaigns = response.data;
      }

      setCampaigns(allCampaigns);
      setTotalCampaigns(allCampaigns.length);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to load campaigns');
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
        setError('Title and price per post are required');
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
      setSuccessMessage('Campaign updated successfully');
      setShowEditModal(false);
      loadCampaigns();
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err.message || 'Failed to update campaign');
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
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleUpdateStatus = async (campaignId, newStatus) => {
    try {
      setSubmitting(true);
      // Map status names for API
      const statusMap = {
        'active': 'active',
        'rejected': 'rejected',
        'approved': 'active'
      };
      await adminService.campaigns.updateCampaign(campaignId, { status: statusMap[newStatus] || newStatus });
      setSuccessMessage(`Campaign ${newStatus} successfully`);
      setShowDetailModal(false);
      loadCampaigns();
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err.message || 'Failed to update campaign');
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
      setSuccessMessage('Campaign deleted successfully');
      setShowDeleteDialog(false);
      setCampaignToDelete(null);
      loadCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError(err.message || 'Failed to delete campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'draft':
        return { bg: '#e5e7eb', color: '#374151' };
      case 'admin_review':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'pending_payment':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'completed':
        return { bg: '#c7d2fe', color: '#3730a3' };
      case 'rejected':
      case 'canceled':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#e5e7eb', color: '#374151' };
    }
  };

  const stats = {
    total: totalCampaigns,
    active: campaigns.filter(c => c.status?.toLowerCase() === 'active').length,
    completed: campaigns.filter(c => c.status?.toLowerCase() === 'completed').length,
    pending: campaigns.filter(c => ['draft', 'admin_review', 'pending_payment'].includes(c.status?.toLowerCase())).length
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        sx={{
          marginLeft: isDesktop && sidebarOpen ? 32.5 : 0,
          width: isDesktop && sidebarOpen ? 'calc(100% - 260px)' : '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <Topbar />
        <Box sx={{ mt: 9, p: 4, backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 72px)' }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontSize: 32 }}>
                Manage Campaigns
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#6c757d' }}>
                Monitor and manage all campaigns on the platform
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
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5568d3',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                  }
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<TransactionsIcon />}
                onClick={handleViewTransactions}
                disabled={loadingTransactions}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {loadingTransactions ? <CircularProgress size={20} /> : 'View Transactions'}
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
              { label: 'Total Campaigns', value: stats.total, IconComponent: CampaignIcon, bgColor: '#e0e7ff', iconColor: '#4338ca' },
              { label: 'Active', value: stats.active, IconComponent: OngoingIcon, bgColor: '#d1fae5', iconColor: '#059669' },
              { label: 'Completed', value: stats.completed, IconComponent: CompletedIcon, bgColor: '#dbeafe', iconColor: '#1e40af' },
              { label: 'Pending', value: stats.pending, IconComponent: ApplicantIcon, bgColor: '#fef3c7', iconColor: '#d97706' }
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
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transform: 'translateY(-4px)'
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
                placeholder="Search campaigns..."
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 100
                }}
              >
                Search
              </Button>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                size="small"
                displayEmpty
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="admin_review">Admin Review</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="pending_payment">Pending Payment</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
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
                  No campaigns found
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#a0aec0', mt: 1 }}>
                  {searchQuery || filterStatus ? 'Try adjusting your filters' : 'Campaigns will appear here once created'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f7fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Campaign</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Company</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Budget</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14, textAlign: 'center' }}>Actions</TableCell>
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
                                {campaign.title || 'Untitled'}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#6c757d' }}>
                                {campaign.campaign_category || 'No category'}
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
                                {campaign.influencer_count} influencers
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={campaign.status?.replace('_', ' ') || 'draft'}
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
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetail(campaign)}
                                  sx={{
                                    color: '#667eea',
                                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                                  }}
                                  title="View Details"
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditClick(campaign)}
                                  sx={{
                                    color: '#10b981',
                                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
                                  }}
                                  title="Edit Campaign"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(campaign)}
                                  sx={{
                                    color: '#ef4444',
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                  }}
                                  title="Delete Campaign"
                                >
                                  <DeleteIcon fontSize="small" />
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
              Campaign Details
              <IconButton onClick={() => setShowDetailModal(false)} disabled={submitting}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {selectedCampaign && (
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                      Campaign Title
                    </Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1f36' }}>
                      {selectedCampaign.title}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Campaign Category
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36' }}>
                        {selectedCampaign.campaign_category || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Company
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                        {selectedCampaign.user?.name || 'N/A'}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                        {selectedCampaign.user?.email || ''}
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedCampaign.influencer_category && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Influencer Categories
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {(() => {
                          try {
                            const categories = typeof selectedCampaign.influencer_category === 'string' 
                              ? JSON.parse(selectedCampaign.influencer_category)
                              : selectedCampaign.influencer_category;
                            return Array.isArray(categories) 
                              ? categories.map((cat, idx) => (
                                  <Chip key={idx} label={cat} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }} />
                                ))
                              : null;
                          } catch (e) {
                            return <Typography sx={{ fontSize: 14, color: '#6c757d' }}>N/A</Typography>;
                          }
                        })()}
                      </Box>
                    </Box>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Price Per Post
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                        Rp {(selectedCampaign.price_per_post || 0).toLocaleString('id-ID')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Influencer Count
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                        {selectedCampaign.influencer_count || 0}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Start Date
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36' }}>
                        {selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        End Date
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36' }}>
                        {selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Deadline
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36' }}>
                        {selectedCampaign.submission_deadline ? new Date(selectedCampaign.submission_deadline).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Min Followers
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36' }}>
                        {(selectedCampaign.min_followers || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Target Demographics
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36' }}>
                        {selectedCampaign.selected_gender} • {selectedCampaign.selected_age}
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedCampaign.has_product && (
                    <Box sx={{ bgcolor: '#f7fafc', p: 2, borderRadius: 2 }}>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                        Product Information
                      </Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                        {selectedCampaign.product_name}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: '#6c757d' }}>
                        Value: Rp {(selectedCampaign.product_value || 0).toLocaleString('id-ID')}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: '#6c757d', mt: 0.5 }}>
                        {selectedCampaign.product_desc}
                      </Typography>
                    </Box>
                  )}

                  {selectedCampaign.content_guidelines && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Content Guidelines
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36', whiteSpace: 'pre-wrap' }}>
                        {selectedCampaign.content_guidelines}
                      </Typography>
                    </Box>
                  )}

                  {selectedCampaign.caption_guidelines && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Caption Guidelines
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36', whiteSpace: 'pre-wrap' }}>
                        {selectedCampaign.caption_guidelines}
                      </Typography>
                    </Box>
                  )}

                  {selectedCampaign.criteria_desc && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                        Criteria Description
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1a1f36' }}>
                        {selectedCampaign.criteria_desc}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#6c757d', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                      Status
                    </Typography>
                    <Chip
                      label={selectedCampaign.status?.replace('_', ' ')}
                      sx={{
                        ...getStatusColor(selectedCampaign.status),
                        fontSize: 13,
                        textTransform: 'capitalize',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setShowDetailModal(false)}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Close
              </Button>
              {selectedCampaign?.status?.toLowerCase() === 'pending' && (
                <>
                  <Button
                    onClick={() => handleUpdateStatus(selectedCampaign._id, 'rejected')}
                    disabled={submitting}
                    startIcon={<RejectIcon />}
                    sx={{
                      textTransform: 'none',
                      color: '#ef4444',
                      '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                    }}
                  >
                    {submitting ? <CircularProgress size={20} /> : 'Reject'}
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedCampaign._id, 'active')}
                    disabled={submitting}
                    variant="contained"
                    startIcon={<ApproveIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {submitting ? <CircularProgress size={20} /> : 'Approve'}
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
              Edit Campaign
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3} sx={{ pt: 1 }}>
                <TextField
                  label="Campaign Title"
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
                  <MenuItem value="">Select Category</MenuItem>
                  <MenuItem value="Entertainment">Entertainment</MenuItem>
                  <MenuItem value="Fashion">Fashion</MenuItem>
                  <MenuItem value="Beauty">Beauty</MenuItem>
                  <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                  <MenuItem value="Health & Sport">Health & Sport</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Lifestyle">Lifestyle</MenuItem>
                </Select>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Price Per Post (Rp)"
                      type="number"
                      value={editFormData.price_per_post}
                      onChange={(e) => setEditFormData({ ...editFormData, price_per_post: e.target.value })}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Influencer Count"
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
                      label="Start Date"
                      type="date"
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={editFormData.endDate}
                      onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Submission Deadline"
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
                      label="Min Followers"
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
                      <MenuItem value="">Gender</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="all">All</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={4}>
                    <Select
                      value={editFormData.selected_age}
                      onChange={(e) => setEditFormData({ ...editFormData, selected_age: e.target.value })}
                      fullWidth
                      displayEmpty
                    >
                      <MenuItem value="">Age Range</MenuItem>
                      <MenuItem value="13-17 tahun">13-17 years</MenuItem>
                      <MenuItem value="18-24 tahun">18-24 years</MenuItem>
                      <MenuItem value="25-34 tahun">25-34 years</MenuItem>
                      <MenuItem value="35+ tahun">35+ years</MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                <Divider />
                
                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>Product Information (Optional)</Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Product Name"
                      value={editFormData.product_name}
                      onChange={(e) => setEditFormData({ ...editFormData, product_name: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Product Value (Rp)"
                      type="number"
                      value={editFormData.product_value}
                      onChange={(e) => setEditFormData({ ...editFormData, product_value: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Product Description"
                      value={editFormData.product_desc}
                      onChange={(e) => setEditFormData({ ...editFormData, product_desc: e.target.value })}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Stack>
                </Box>

                <TextField
                  label="Content Guidelines"
                  value={editFormData.content_guidelines}
                  onChange={(e) => setEditFormData({ ...editFormData, content_guidelines: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
                <TextField
                  label="Caption Guidelines"
                  value={editFormData.caption_guidelines}
                  onChange={(e) => setEditFormData({ ...editFormData, caption_guidelines: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Criteria Description"
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
                  <MenuItem value="pending_review">Pending Review</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
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
                {submitting ? <CircularProgress size={24} /> : 'Save Changes'}
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
              All Transactions
              <IconButton onClick={() => setShowTransactionsModal(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {transactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ReceiptIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                  <Typography sx={{ fontSize: 18, color: '#6c757d' }}>No transactions found</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f7fafc' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
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
                              {tx.userId?.name || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tx.type || 'N/A'}
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
                              {tx.description || tx.category || 'N/A'}
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
                Close
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
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Confirm Delete</Typography>
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: '#6c757d', fontSize: 15 }}>
                Are you sure you want to delete campaign <strong>{campaignToDelete?.title || campaignToDelete?.campaign_title}</strong>? 
                This action cannot be undone.
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
                {submitting ? <CircularProgress size={24} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}

export default ManageCampaigns;
