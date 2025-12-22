import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Stack, Grid, Typography, Button, TextField, Select, MenuItem, InputAdornment, Paper } from '@mui/material';
import ApplicantCard from '../../components/common/ApplicantCard';
import Modal from '../../components/common/Modal';
import ApplicantDetailModal from '../../components/common/ApplicantDetailModal';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { COLORS } from '../../constants/colors';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import applicantStorageHelper from '../../utils/applicantStorageHelper';
import campaignService from '../../services/campaignService';
import applicantService from '../../services/applicantService';
import chatService from '../../services/chatService';
import { toast } from 'react-toastify';

function ViewApplicants() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, selected: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: null,
    variant: 'default'
  });

  // Modal states for detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (!campaignId) {
        console.error('❌ No campaignId provided!');
        toast.error('Campaign ID tidak valid');
        setTimeout(() => navigate('/campaigns/list'), 100);
        return;
      }
      
      // Fetch campaign from API
      const response = await campaignService.getCampaignById(campaignId);
      // Handle the nested data structure { success: true, data: { ... } }
      let campaignData = response?.data?.data || response?.data || response;
      
      // Additional check if the object is directly the campaign or wrapped
      if (campaignData && campaignData.campaign_id) {
        // Parse JSON strings if necessary
        try {
           if (typeof campaignData.influencer_category === 'string' && campaignData.influencer_category.startsWith('[')) {
             campaignData.influencer_category = JSON.parse(campaignData.influencer_category);
           }
           if (typeof campaignData.selected_age === 'string' && campaignData.selected_age.startsWith('[')) {
             campaignData.selected_age = JSON.parse(campaignData.selected_age);
           }
           if (typeof campaignData.reference_images === 'string' && campaignData.reference_images.startsWith('"')) {
              // Handle double encoded JSON string from the example
              campaignData.reference_images = JSON.parse(JSON.parse(campaignData.reference_images));
           } else if (typeof campaignData.reference_images === 'string' && campaignData.reference_images.startsWith('[')) {
              campaignData.reference_images = JSON.parse(campaignData.reference_images);
           }
        } catch (e) {
          console.warn('Error evaluating JSON fields:', e);
        }
        setCampaign(campaignData);
      } else {
        console.error('❌ Campaign not found with ID:', campaignId);
        toast.error('Campaign tidak ditemukan');
        setTimeout(() => navigate('/campaigns/list'), 100);
        return;
      }

      // Load applicants from API
      let applicantsResponse = await applicantService.getCampaignApplicants(campaignId);
      // Handle response structure { success: true, data: [...] }
      let applicantsData = Array.isArray(applicantsResponse) ? applicantsResponse : 
                           (applicantsResponse?.data && Array.isArray(applicantsResponse.data) ? applicantsResponse.data : []);
      
      // Transform API data to match frontend format
      const transformedApplicants = applicantsData.map(app => {
        // Extract user data from the 'user' field in the response
        const userData = app.user || {};
        
        // Note: The provided API response doesn't seem to have nested 'student' details 
        // (like followers, engagement, niche). We'll try to use what's available or default.
        const studentData = app.student || userData.student || {}; 
        
        return {
          id: app.id,
          userId: userData.user_id || app.student_id,
          campaignId: app.campaign_id,
          influencerName: userData.name || 'Unknown',
          fullName: userData.name || 'Unknown',
          // Defaulting missing fields that aren't in the basic user object
          location: studentData.location || userData.location || '-',
          age: studentData.age || userData.age || 0,
          gender: studentData.gender || userData.gender || '-',
          followers: studentData.follower_count || userData.follower_count || 0,
          engagementRate: studentData.engagement_rate || userData.engagement_rate || 0,
          status: app.application_status ? 
                  (app.application_status.toLowerCase() === 'pending' ? 'Pending' : 
                   (app.application_status.toLowerCase() === 'accepted' || app.application_status.toLowerCase() === 'approved') ? 'Accepted' : 
                   (app.application_status.toLowerCase() === 'rejected') ? 'Rejected' : 
                   app.application_status) : 'Pending',
          appliedDate: app.applied_at || app.created_at || new Date().toISOString(),
          bio: studentData.bio || userData.bio || '',
          instagram: studentData.instagram_username || userData.instagram_username || '',
          email: userData.email || '',
          phone: studentData.phone || userData.phone || '',
          niche: [], // Niche category not present in basic user object
          notes: app.application_notes || '',
          profileImage: userData.profile_image || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
          previousBrands: [],
          isSelected: applicantStorageHelper.isSelected(app.id)
        };
      });

      // Sync with localStorage selection state
      transformedApplicants.forEach(app => {
        const stored = applicantStorageHelper.getApplicantById(app.id);
        if (!stored) {
          applicantStorageHelper.addApplicant(app);
        }
      });
      
      setApplicants(transformedApplicants);

      // Calculate statistics
      const total = transformedApplicants.length;
      const pending = transformedApplicants.filter(a => a.status === 'Pending').length;
      const accepted = transformedApplicants.filter(a => a.status === 'Accepted').length;
      const rejected = transformedApplicants.filter(a => a.status === 'Rejected').length;
      const selected = transformedApplicants.filter(a => a.isSelected === true).length;
      setStats({ total, pending, accepted, rejected, selected });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data applicants');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Accept applicant
  const handleAccept = (applicantId) => {
    const applicant = applicants.find(a => a.id === applicantId);
    setModalConfig({
      title: 'Accept Applicant',
      message: `Are you sure you want to accept ${applicant.fullName} (${applicant.influencerName}) for this campaign?`,
      action: () => confirmAccept(applicantId),
      variant: 'success'
    });
    setShowModal(true);
  };

  const confirmAccept = async (applicantId) => {
    try {
      setIsLoading(true);
      await applicantService.acceptApplicant(applicantId, 'Applicant has been accepted');
      toast.success('Applicant berhasil diterima!');
      await loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to accept applicant:', error);
      toast.error('Gagal menerima applicant');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reject applicant
  const handleReject = (applicantId) => {
    const applicant = applicants.find(a => a.id === applicantId);
    setModalConfig({
      title: 'Reject Applicant',
      message: `Are you sure you want to reject ${applicant.fullName} (${applicant.influencerName})? This action can be reversed later.`,
      action: () => confirmReject(applicantId),
      variant: 'danger'
    });
    setShowModal(true);
  };

  const confirmReject = async (applicantId) => {
    try {
      setIsLoading(true);
      await applicantService.rejectApplicant(applicantId, 'Thank you for your interest');
      toast.success('Applicant berhasil ditolak');
      await loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to reject applicant:', error);
      toast.error('Gagal menolak applicant');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Cancel (revert to Pending)
  const handleCancel = (applicantId) => {
    const applicant = applicants.find(a => a.id === applicantId);
    setModalConfig({
      title: 'Revert to Pending',
      message: `Do you want to move ${applicant.fullName} (${applicant.influencerName}) back to pending status?`,
      action: () => confirmCancel(applicantId),
      variant: 'default'
    });
    setShowModal(true);
  };

  const confirmCancel = async (applicantId) => {
    try {
      setIsLoading(true);
      await applicantService.reconsiderApplicant(applicantId);
      toast.success('Applicant berhasil dikembalikan ke status pending');
      await loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to reconsider applicant:', error);
      toast.error('Gagal mengubah status applicant');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Toggle Selection - Direct toggle without popup
  const handleToggleSelection = (applicant) => {
    const newSelectionState = !applicant.isSelected;
    applicantStorageHelper.toggleSelection(applicant.id, newSelectionState);
    loadData();
    toast.success(newSelectionState ? `${applicant.fullName} ditandai sebagai favorit` : `${applicant.fullName} dihapus dari favorit`);
  };

  // Handle Show Detail
  const handleShowDetail = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailModal(true);
  };

  // Get current user ID from token
  const [currentUserId, setCurrentUserId] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const [, payloadBase64] = token.split(".");
        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
        if (payload?.sub) setCurrentUserId(Number(payload.sub));
      } catch (e) {
        console.error("Invalid token:", e);
      }
    }
  }, []);

  // Handle Chat - Create Chat Room
  const handleChat = async (applicant) => {
    try {
      if (!applicant.userId) {
        toast.error('User ID tidak ditemukan pada applicant ini');
        return;
      }
      if (!currentUserId) {
        toast.error('Sesi anda tidak valid, silakan login ulang');
        return;
      }
      
      setIsLoading(true);
      
      // 1. Create Private Chat Room with participants
      // name is optional for private chats usually, but we can set one for clarity
      const roomName = `${campaign.title} - ${applicant.fullName}`.substring(0, 50);
      
      const payload = {
        name: roomName,
        type: "private",
        participants: [applicant.userId, currentUserId]
      };

      await chatService.createChatRoom(payload);

      toast.success('Chat started! Redirecting...');
      
      // 2. Navigate to Chat Page
      navigate('/chat');
      
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Gagal memulai chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter applicants
  const filteredApplicants = applicants
    .filter(a => {
      const matchesSearch = 
        a.influencerName.toLowerCase().includes(search.toLowerCase()) ||
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase());
      
      // Handle "Selected" filter separately (based on isSelected flag)
      const matchesFilter = filter 
        ? (filter === 'Selected' ? a.isSelected === true : a.status === filter)
        : true;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort priority: Selected > Pending > Accepted > Rejected
      const statusPriority = { 'Pending': 1, 'Accepted': 2, 'Rejected': 3 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      // Then sort by applied date (newest first)
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    });

  if (!campaign) {
    return (
      <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: isMobile ? 0 : 32.5, flex: 1 }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box sx={{ mt: 9, bgcolor: '#f7fafc', minHeight: 'calc(100vh - 72px)', py: { xs: 2, md: 4 } }}>
          <Container maxWidth="lg">
            {/* Back Button */}
            <Button
              onClick={() => navigate('/campaigns/list')}
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              sx={{ 
                mb: 3, 
                fontWeight: 600, 
                textTransform: 'none',
                color: '#64748b',
                '&:hover': { bgcolor: '#f1f5f9', color: '#1e293b' }
              }}
            >
              Kembali ke Kampanye
            </Button>
            {/* Campaign Header */}
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                p: { xs: 2, md: 4 }, 
                mb: 4, 
                position: 'relative', 
                overflow: 'hidden', 
                border: '1px solid #e2e8f0',
                bgcolor: '#fff'
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={3}>
                <Box sx={{ 
                  width: { xs: '100%', md: 120 }, 
                  height: { xs: 200, md: 120 }, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {campaign.banner_image ? (
                    <Box 
                      component="img" 
                      src={campaign.banner_image} 
                      alt={campaign.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <AssignmentIcon sx={{ fontSize: 48, color: '#94a3b8' }} />
                  )}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {campaign.title}
                    </Typography>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        px: 1.5, py: 0.5, 
                        bgcolor: campaign.status?.toLowerCase() === 'active' ? '#ecfdf5' : '#f1f5f9',
                        color: campaign.status?.toLowerCase() === 'active' ? '#059669' : '#64748b',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: campaign.status?.toLowerCase() === 'active' ? '#059669' : '#cbd5e1'
                      }}
                    >
                      {campaign.status}
                    </Paper>
                  </Stack>
                  
                  {campaign.user && (
                     <Typography sx={{ fontSize: 14, color: '#64748b', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                       Oleh <Box component="span" sx={{ fontWeight: 600, color: '#6E00BE' }}>{campaign.user.name}</Box>
                     </Typography>
                  )}

                  <Stack direction="row" flexWrap="wrap" gap={3} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 14, color: '#64748b' }}>
                       <strong>Harga:</strong> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(campaign.price_per_post || 0)} / posting
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 14, color: '#64748b' }}>
                       <strong>Batas Waktu:</strong> {campaign.submission_deadline ? new Date(campaign.submission_deadline).toLocaleDateString('id-ID') : '-'}
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {Array.isArray(campaign.influencer_category) && campaign.influencer_category.map((cat, idx) => (
                      <Paper 
                        key={idx} 
                        elevation={0}
                        sx={{ 
                          px: 1.5, py: 0.5, 
                          bgcolor: '#f8fafc', 
                          fontSize: 12, 
                          borderRadius: 4,
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          fontWeight: 500
                        }}
                      >
                        {cat}
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Statistics Cards */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2, mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={4} md={2.4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      bgcolor: '#f0f9ff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <PeopleIcon sx={{ fontSize: 24, color: '#6E00BE' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                        Total
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      bgcolor: '#fff7ed', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <StarIcon sx={{ fontSize: 24, color: '#6E00BE' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                        {stats.selected}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                        Terpilih
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      bgcolor: '#f1f5f9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <HourglassEmptyIcon sx={{ fontSize: 24, color: '#64748b' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                        {stats.pending}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                        Menunggu
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      bgcolor: '#ecfdf5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 24, color: '#10b981' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                        {stats.accepted}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                        Diterima
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      bgcolor: '#fef2f2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <CancelIcon sx={{ fontSize: 24, color: '#ef4444' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                        {stats.rejected}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                        Ditolak
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Search & Filter */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4} flexWrap="wrap">
              <Box sx={{ flex: '1 1 400px', position: 'relative' }}>
                <TextField
                  fullWidth
                  placeholder="Cari nama, username, atau lokasi..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    bgcolor: '#fff',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: '#cbd5e1' },
                    }
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <Select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  fullWidth
                  displayEmpty
                  sx={{ 
                    bgcolor: '#fff', 
                    borderRadius: 2, 
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' }
                  }}
                >
                  <MenuItem value="">Semua Status</MenuItem>
                  <MenuItem value="Pending">
                    <HourglassEmptyIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: '#64748b' }} />
                    Menunggu
                  </MenuItem>
                  <MenuItem value="Selected">
                    <StarIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: '#f59e0b' }} />
                    Terpilih
                  </MenuItem>
                  <MenuItem value="Accepted">
                    <CheckCircleIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: '#10b981' }} />
                    Diterima
                  </MenuItem>
                  <MenuItem value="Rejected">
                    <CancelIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: '#ef4444' }} />
                    Ditolak
                  </MenuItem>
                </Select>
              </Box>
            </Stack>
            
            {/* Results Count */}
            <Typography sx={{ mb: 2, fontSize: 15, color: '#64748b', fontWeight: 600 }}>
              Menampilkan {filteredApplicants.length} dari {applicants.length} pendaftar
            </Typography>

            {/* Applicants List */}
            {filteredApplicants.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: '#fff', 
                  borderRadius: 2, 
                  py: 8, 
                  px: 4, 
                  textAlign: 'center', 
                  border: '1px solid #e2e8f0'
                }}
              >
                <SentimentDissatisfiedIcon sx={{ fontSize: 56, mb: 2, color: '#cbd5e1' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                  Tidak Ada Pendaftar Ditemukan
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: 15 }}>
                  {search || filter ? 'Coba sesuaikan kriteria pencarian atau filter Anda' : 'Belum ada yang mendaftar untuk kampanye ini'}
                </Typography>
              </Paper>
            ) : (
              <Box>
                {filteredApplicants.map(applicant => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onCancel={handleCancel}
                    onToggleFavorite={handleToggleSelection}
                    onChat={handleChat}
                    onShowDetail={handleShowDetail}
                    showActions={true}
                    canSelectApplicants={true}
                  />
                ))}
              </Box>
            )}
            {/* Confirmation Modal */}
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={modalConfig.title}
              onConfirm={modalConfig.action}
              confirmText="Confirm"
              cancelText="Cancel"
              variant={modalConfig.variant}
            >
              <Typography sx={{ fontSize: 16, lineHeight: 1.6, color: COLORS.textSecondary }}>
                {modalConfig.message}
              </Typography>
            </Modal>
            {/* Applicant Detail Modal */}
            <ApplicantDetailModal
              isOpen={showDetailModal}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedApplicant(null);
              }}
              applicant={selectedApplicant}
            />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default ViewApplicants;
