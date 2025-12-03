import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Stack, Grid, Card, CardContent, Typography, Button, TextField, Select, MenuItem, InputAdornment, Paper } from '@mui/material';
import StatCard from '../../components/common/StatCard';
import ApplicantCard from '../../components/common/ApplicantCard';
import Modal from '../../components/common/Modal';
import SelectionConfirmModal from '../../components/common/SelectionConfirmModal';
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
import { toast } from 'react-toastify';

function ViewApplicants() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, selected: 0 });
  
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

  // New modal states for selection and detail
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    // Load campaign details from API
    try {
      if (!campaignId) {
        console.error('❌ No campaignId provided!');
        setTimeout(() => navigate('/campaigns'), 100);
        return;
      }
      
      // Fetch campaign from API
      const response = await campaignService.getCampaignById(campaignId);
      // Handle different response structures
      let campaignData = response?.data?.data || response?.data || response;
      if (campaignData && campaignData.campaign_id) {
        setCampaign(campaignData);
      } else {
        console.error('❌ Campaign not found with ID:', campaignId);
        toast.error('Campaign tidak ditemukan');
        setTimeout(() => navigate('/campaigns'), 100);
        return;
      }

      // Load applicants for this campaign from localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      // Use the found campaign's ID for filtering
      const actualCampaignId = campaignData.campaign_id;
      const applicantsData = allApplicants.filter(a => 
        a.campaignId === actualCampaignId || 
        String(a.campaignId) === String(actualCampaignId) ||
        parseInt(a.campaignId) === parseInt(actualCampaignId)
      );
      setApplicants(applicantsData);

      // Calculate statistics
      const total = applicantsData.length;
      const pending = applicantsData.filter(a => a.status === 'Pending').length;
      const accepted = applicantsData.filter(a => a.status === 'Accepted').length;
      const rejected = applicantsData.filter(a => a.status === 'Rejected').length;
      const selected = applicantsData.filter(a => a.isSelected === true).length;
      setStats({ total, pending, accepted, rejected, selected });
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      setTimeout(() => navigate('/campaigns'), 100);
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

  const confirmAccept = (applicantId) => {
    try {
      // Update applicant status in localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updatedApplicants = allApplicants.map(a => 
        a.id === applicantId ? { ...a, status: 'Accepted' } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to accept applicant:', error);
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

  const confirmReject = (applicantId) => {
    try {
      // Update applicant status in localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updatedApplicants = allApplicants.map(a => 
        a.id === applicantId ? { ...a, status: 'Rejected' } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to reject applicant:', error);
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

  const confirmCancel = (applicantId) => {
    try {
      // Update applicant status in localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updatedApplicants = allApplicants.map(a => 
        a.id === applicantId ? { ...a, status: 'Pending' } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to revert applicant status:', error);
    }
  };

  // Handle Toggle Selection
  const handleToggleSelection = (applicant) => {
    setSelectedApplicant(applicant);
    setShowSelectionModal(true);
  };

  const confirmToggleSelection = () => {
    if (selectedApplicant) {
      const newSelectionState = !selectedApplicant.isSelected;
      applicantStorageHelper.toggleSelection(selectedApplicant.id, newSelectionState);
      loadData();
      setShowSelectionModal(false);
      setSelectedApplicant(null);
    }
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
      
      const matchesFilter = filter ? a.status === filter : true;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort priority: Pending > Accepted > Rejected
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
            <Box sx={{ display: 'flex', gap: 2, mb: 4, width: '100%' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <StatCard title="Total Applicants" value={stats.total} IconComponent={PeopleIcon} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <StatCard title="Selected" value={stats.selected} IconComponent={StarIcon} gradient="linear-gradient(135deg, #f6d365 0%, #fda085 100%)" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <StatCard title="Pending Review" value={stats.pending} IconComponent={HourglassEmptyIcon} gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <StatCard title="Accepted" value={stats.accepted} IconComponent={CheckCircleIcon} gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <StatCard title="Rejected" value={stats.rejected} IconComponent={CancelIcon} gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" />
              </Box>
            </Box>
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
                  <MenuItem value="Accepted">
                    <CheckCircleIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: COLORS.textSecondary }} />
                    Selected
                  </MenuItem>
                  <MenuItem value="Rejected">
                    <CancelIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1, color: COLORS.textSecondary }} />
                    Rejected
                  </MenuItem>
                </Select>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/campaign/${campaignId}/select-applicants`)}
                startIcon={<CheckCircleIcon />}
                sx={{ borderRadius: 2, fontWeight: 600, minWidth: 25, textTransform: 'none', fontSize: 16, bgcolor: '#667eea', color: '#fff', '&:hover': { bgcolor: '#5568d3' } }}
              >
                Select Applicants
              </Button>
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
                    onToggleSelection={handleToggleSelection}
                    onChat={handleChat}
                    onShowDetail={handleShowDetail}
                    showActions={true}
                    showSelection={true}
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
            {/* Selection Confirmation Modal */}
            <SelectionConfirmModal
              isOpen={showSelectionModal}
              onClose={() => {
                setShowSelectionModal(false);
                setSelectedApplicant(null);
              }}
              applicantName={selectedApplicant?.fullName}
              influencerName={selectedApplicant?.influencerName}
              currentSelection={selectedApplicant?.isSelected || false}
              onConfirm={confirmToggleSelection}
            />
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
