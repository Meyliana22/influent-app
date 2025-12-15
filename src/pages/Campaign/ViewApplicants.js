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
        setTimeout(() => navigate('/campaigns'), 100);
        return;
      }
      
      // Fetch campaign from API
      const response = await campaignService.getCampaignById(campaignId);
      let campaignData = response?.data?.data || response?.data || response;
      
      if (campaignData && campaignData.campaign_id) {
        setCampaign(campaignData);
      } else {
        console.error('❌ Campaign not found with ID:', campaignId);
        toast.error('Campaign tidak ditemukan');
        setTimeout(() => navigate('/campaigns'), 100);
        return;
      }

      // Load applicants from API
      let applicantsResponse = await applicantService.getCampaignApplicants(campaignId);
      let applicantsData = Array.isArray(applicantsResponse) ? applicantsResponse : [];
      
      // Transform API data to match frontend format
      const transformedApplicants = applicantsData.map(app => {
        // Safely parse niche_category
        let nicheArray = [];
        try {
          if (app.user?.student?.niche_category) {
            const parsed = JSON.parse(app.user.student.niche_category);
            nicheArray = Array.isArray(parsed) ? parsed : [];
          } else if (app.student?.category) {
            nicheArray = [app.student.category];
          }
        } catch (e) {
          nicheArray = [];
        }

        // Handle both API format and dummy format
        const studentData = app.user?.student || app.student || {};
        const userData = app.user || studentData.user || {};

        return {
          id: app.id,
          campaignId: app.campaign_id,
          influencerName: userData.name || 'Unknown',
          fullName: userData.name || 'Unknown',
          location: studentData.location || 'N/A',
          age: studentData.age || 0,
          gender: studentData.gender || 'N/A',
          followers: studentData.follower_count || 0,
          engagementRate: studentData.engagement_rate || 0,
          status: app.application_status ? 
                  (app.application_status === 'pending' ? 'Pending' : 
                   app.application_status === 'accepted' ? 'Accepted' : 'Rejected') :
                  (app.status === 'pending' ? 'Pending' :
                   app.status === 'selected' ? 'Pending' :
                   app.status === 'accepted' ? 'Accepted' : 'Rejected'),
          appliedDate: app.applied_at,
          bio: studentData.bio || '',
          instagram: studentData.instagram_username || '',
          email: userData.email || '',
          phone: studentData.phone || '',
          niche: nicheArray,
          notes: app.application_notes || app.notes || '',
          profileImage: userData.profile_image || 'https://i.pravatar.cc/150',
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

  // Handle Chat - Open WhatsApp
  const handleChat = (applicant) => {
    const phone = applicant.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const message = encodeURIComponent(
      `Halo ${applicant.fullName}, saya tertarik untuk berkolaborasi dengan Anda untuk campaign "${campaign.title}". Apakah Anda tersedia untuk diskusi lebih lanjut?`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
              onClick={() => navigate('/campaigns')}
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              sx={{ mb: 3, fontWeight: 600, textTransform: 'none' }}
            >
              Back to Campaigns
            </Button>
            {/* Campaign Header */}
            <Paper elevation={3} sx={{ borderRadius: 3, p: { xs: 2, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden', boxShadow: 6 }}>
              {/* Decorative gradient line */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: COLORS.gradient }} />
              <Stack direction="row" alignItems="center" spacing={3}>
                <Box sx={{ width: 100, height: 100, borderRadius: 2, background: COLORS.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
                  <AssignmentIcon sx={{ fontSize: 56, color: '#000' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                    View Applicants
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    {campaign.title}
                  </Typography>
                  <Typography sx={{ fontSize: 15, color: COLORS.textSecondary }}>
                    Campaign Status: <Box component="span" sx={{ fontWeight: 600, color: campaign.status === 'Active' ? '#28a745' : '#6c757d', display: 'inline' }}>{campaign.status}</Box>
                  </Typography>
                </Box>
              </Stack>
            </Paper>
            {/* Statistics Cards */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2, mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={4} md={2.4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      bgcolor: '#f5f7ff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <PeopleIcon sx={{ fontSize: 24, color: '#667eea' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 500 }}>
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
                      bgcolor: '#fff8f0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <StarIcon sx={{ fontSize: 24, color: '#ffa726' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                        {stats.selected}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 500 }}>
                        Selected
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
                      bgcolor: '#f5f7f9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <HourglassEmptyIcon sx={{ fontSize: 24, color: '#78909c' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                        {stats.pending}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 500 }}>
                        Pending
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
                      bgcolor: '#f1f8f4', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 24, color: '#66bb6a' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                        {stats.accepted}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 500 }}>
                        Accepted
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
                      bgcolor: '#fef5f5', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <CancelIcon sx={{ fontSize: 24, color: '#ef5350' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                        {stats.rejected}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 500 }}>
                        Rejected
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
                  placeholder="Search by name, username, or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.textSecondary, opacity: 0.6 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2, bgcolor: '#fff', fontSize: 16, boxShadow: 1 }}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <Select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  fullWidth
                  displayEmpty
                  sx={{ borderRadius: 2, bgcolor: '#fff', fontSize: 16, boxShadow: 1 }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Pending">
                    <HourglassEmptyIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: COLORS.textSecondary }} />
                    Pending
                  </MenuItem>
                  <MenuItem value="Selected">
                    <StarIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: '#ffa726' }} />
                    Selected
                  </MenuItem>
                  <MenuItem value="Accepted">
                    <CheckCircleIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: '#66bb6a' }} />
                    Accepted
                  </MenuItem>
                  <MenuItem value="Rejected">
                    <CancelIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: COLORS.textSecondary }} />
                    Rejected
                  </MenuItem>
                </Select>
              </Box>
            </Stack>
            {/* Results Count */}
            <Typography sx={{ mb: 2, fontSize: 15, color: COLORS.textSecondary, fontWeight: 600 }}>
              Showing {filteredApplicants.length} of {applicants.length} applicants
            </Typography>
            {/* Applicants List */}
            {filteredApplicants.length === 0 ? (
              <Paper elevation={2} sx={{ bgcolor: COLORS.white, borderRadius: 2, py: 8, px: 4, textAlign: 'center', boxShadow: 4 }}>
                <SentimentDissatisfiedIcon sx={{ fontSize: 56, mb: 2, color: COLORS.textSecondary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 1 }}>
                  No Applicants Found
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 15 }}>
                  {search || filter ? 'Try adjusting your search or filter criteria' : 'No one has applied to this campaign yet'}
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
