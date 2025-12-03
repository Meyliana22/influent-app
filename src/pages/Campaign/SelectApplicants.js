import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MuiButton from '@mui/material/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import campaignService from '../../services/campaignService';
import { toast } from 'react-toastify';

function SelectApplicants() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    try {
      // Load campaign details from API
      const response = await campaignService.getCampaignById(campaignId);
      let campaignData = response?.data?.data || response?.data || response;
      if (!campaignData || !campaignData.campaign_id) {
        setNotFound(true);
        return;
      }
      setCampaign(campaignData);

      // Load applicants from localStorage (will be changed to API later)
      const applicantsData = JSON.parse(localStorage.getItem('applicants') || '[]')
        .filter(a => a.campaignId === parseInt(campaignId) && (a.status === 'Pending' || a.status === 'Accepted'));
      setApplicants(applicantsData);

      // Pre-select already accepted applicants
      const alreadyAccepted = applicantsData
        .filter(a => a.status === 'Accepted')
        .map(a => a.id);
      setSelectedIds(alreadyAccepted);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load campaign data');
    }
  };

  // Toggle selection
  const toggleSelection = (applicantId) => {
    if (selectedIds.includes(applicantId)) {
      setSelectedIds(selectedIds.filter(id => id !== applicantId));
    } else {
      setSelectedIds([...selectedIds, applicantId]);
    }
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedIds.length === applicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applicants.map(a => a.id));
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select at least one influencer');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSelection = async () => {
    try {
      // Update status for all applicants in localStorage (will be changed to API later)
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updatedApplicants = allApplicants.map(applicant => {
        if (applicant.campaignId === parseInt(campaignId) && applicants.some(a => a.id === applicant.id)) {
          const newStatus = selectedIds.includes(applicant.id) ? 'Accepted' : 'Rejected';
          return { ...applicant, status: newStatus };
        }
        return applicant;
      });
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));

      // Update campaign via API - set to active (ongoing)
      await campaignService.updateCampaign(campaignId, {
        ...campaign,
        status: 'active', // API uses 'active' for paid/ongoing campaigns
        influencer_count: selectedIds.length,
        selectionDate: new Date().toISOString()
      });

      setShowConfirmModal(false);
      toast.success('Selection confirmed successfully!');
      navigate(`/campaigns`);
    } catch (error) {
      console.error('Error confirming selection:', error);
      toast.error('Failed to confirm selection. Please try again.');
    }
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (!campaign) {
    if (notFound) {
      return (
        <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Container maxWidth="sm">
            <Paper elevation={3} sx={{ borderRadius: 3, p: { xs: 3, md: 5 }, textAlign: 'center', boxShadow: 6 }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: COLORS.gradient }} />
              <SentimentDissatisfiedIcon sx={{ fontSize: 56, mb: 2, color: COLORS.textSecondary }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 2 }}>
                Page Not Found
              </Typography>
              <Typography sx={{ color: COLORS.textSecondary, fontSize: 16, mb: 2 }}>
                The campaign you are looking for does not exist or has been removed.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/campaigns')} sx={{ borderRadius: 2, fontWeight: 600, minWidth: 25, textTransform: 'none', fontSize: 16, bgcolor: '#667eea', color: '#fff', mt: 2 }}>
                Back to Campaigns
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }
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
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: isMobile ? 0 : 32.5, flex: 1 }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box sx={{ mt: 9, bgcolor: '#f7fafc', minHeight: 'calc(100vh - 72px)', py: 4 }}>
          <Container maxWidth="lg">
            {/* Back Button */}
            <MuiButton
              startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate(`/campaign/${campaignId}/applicants`)}
              sx={{ mb: 3, fontWeight: 600, textTransform: 'none' }}
            >
              Back to View Applicants
            </MuiButton>
            {/* Header */}
            <Paper elevation={3} sx={{ borderRadius: 3, p: 4, mb: 4, position: 'relative', overflow: 'hidden', boxShadow: 6 }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: COLORS.gradient }} />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                    Select Influencers
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primary, mb: 1 }}>
                    {campaign.title}
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 15 }}>
                    Select influencers you want to work with for this campaign
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', px: 3, py: 2, bgcolor: COLORS.primaryLight, borderRadius: 2 }}>
                  <Typography sx={{ fontSize: 40, fontWeight: 700, color: COLORS.primary }}>
                    {selectedIds.length}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 600 }}>
                    Selected
                  </Typography>
                </Box>
              </Stack>
            </Paper>
            {/* Action Bar */}
            <Paper elevation={2} sx={{ bgcolor: COLORS.white, borderRadius: 2, p: 3, mb: 3, boxShadow: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Checkbox
                  checked={selectedIds.length === applicants.length && applicants.length > 0}
                  onChange={handleSelectAll}
                  sx={{ color: COLORS.primary }}
                />
                <Typography sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                  {selectedIds.length === applicants.length && applicants.length > 0 ? 'Deselect All' : 'Select All'}
                </Typography>
              </Box>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={selectedIds.length === 0}
                sx={{ px: 4, py: 1.5, borderRadius: 2, fontSize: 16, fontWeight: 700, bgcolor: selectedIds.length === 0 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Confirm Selection ({selectedIds.length})
              </Button>
            </Paper>
            {/* Applicants Grid */}
            {applicants.length === 0 ? (
              <Paper elevation={2} sx={{ bgcolor: COLORS.white, borderRadius: 2, py: 8, px: 4, textAlign: 'center', boxShadow: 4 }}>
                <MailOutlineIcon sx={{ fontSize: 56, mb: 2, color: COLORS.textSecondary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 1 }}>
                  No Applicants Available
                </Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: 15 }}>
                  There are no pending applicants for this campaign
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {applicants.map(applicant => {
                  const isSelected = selectedIds.includes(applicant.id);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={applicant.id}>
                      <Card
                        onClick={() => toggleSelection(applicant.id)}
                        sx={{
                          bgcolor: COLORS.white,
                          borderRadius: 2,
                          boxShadow: isSelected ? 6 : 2,
                          border: isSelected ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleSelection(applicant.id)}
                              onClick={e => e.stopPropagation()}
                              sx={{ color: COLORS.primary }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              src={applicant.profileImage || undefined}
                              alt={applicant.fullName}
                              sx={{ width: 80, height: 80, mb: 2, bgcolor: COLORS.gradient, fontSize: 40 }}
                            >
                              {!applicant.profileImage && <SmartphoneIcon sx={{ fontSize: 40, color: '#fff' }} />}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary, textAlign: 'center', mb: 0.5 }}>
                              {applicant.fullName}
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', mb: 2 }}>
                              @{applicant.influencerName}
                            </Typography>
                          </Box>
                          <Stack direction="row" justifyContent="space-around" alignItems="center" sx={{ py: 2, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, mb: 2 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography sx={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
                                {formatNumber(applicant.followers)}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                                Followers
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography sx={{ fontSize: 18, fontWeight: 700, color: COLORS.success }}>
                                {applicant.engagement}%
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>
                                Engagement
                              </Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ fontSize: 13, color: COLORS.textSecondary, mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                              <SmartphoneIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                              <span>{applicant.platform || 'Instagram'}</span>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LocationOnIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                              <span>{applicant.location}</span>
                            </Stack>
                          </Box>
                          {applicant.status === 'Accepted' && (
                            <Box sx={{ mt: 1.5, px: 2, py: 1, bgcolor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', borderRadius: 2, fontSize: 12, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              ✓ Already Selected
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
            {/* Confirmation Modal */}
            <Modal
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              title="Confirm Selection"
              onConfirm={confirmSelection}
              confirmText="Confirm"
              cancelText="Cancel"
              variant="success"
            >
              <Box>
                <Typography sx={{ mb: 2, fontSize: 16, lineHeight: 1.6, color: COLORS.textSecondary }}>
                  You are about to select <strong>{selectedIds.length}</strong> influencer(s) for this campaign.
                </Typography>
                <Box sx={{ p: 2, bgcolor: COLORS.primaryLight, borderRadius: 2, mb: 2 }}>
                  <Typography sx={{ mb: 1, fontSize: 15, fontWeight: 600, color: COLORS.textPrimary }}>
                    What happens next:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.8 }}>
                    <li>Selected influencers will be notified</li>
                    <li>Campaign status will change to "Ongoing"</li>
                    <li>Posting deadline will be set based on campaign end date</li>
                    <li>Unselected applicants will be rejected</li>
                  </ul>
                </Box>
                <Typography sx={{ fontSize: 14, color: COLORS.textLight, fontStyle: 'italic' }}>
                  This action cannot be undone. Are you sure you want to proceed?
                </Typography>
              </Box>
            </Modal>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default SelectApplicants;
