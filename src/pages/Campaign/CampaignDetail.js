import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import campaignService from '../../services/campaignService';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BarChartIcon from '@mui/icons-material/BarChart';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { toast } from 'react-toastify';

function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [stats, setStats] = useState({
    totalSelected: 0,
    completed: 0,
    pending: 0,
    progressPercentage: 0
  });

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

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Load campaign from API
      const response = await campaignService.getCampaignById(id);
      const campaignData = response.data || response;

      if (!campaignData) {
        navigate('/campaigns/list');
        return;
      }
      setCampaign(campaignData);

      // Load selected influencers from localStorage (akan diubah ke API nanti)
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const campaignApplicants = applicants.filter(a => 
        a.campaignId === parseInt(id) && a.status === 'Accepted'
      );
      setSelectedInfluencers(campaignApplicants);

      // Calculate stats
      const totalSelected = campaignApplicants.length;
      const completed = campaignApplicants.filter(a => a.proofUploaded).length;
      const pending = totalSelected - completed;
      const progressPercentage = totalSelected > 0 ? (completed / totalSelected) * 100 : 0;

      setStats({
        totalSelected,
        completed,
        pending,
        progressPercentage
      });
    } catch (error) {
      console.error('Error loading campaign:', error);
      navigate('/campaigns/list');
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!campaign || !campaign.end_date) return null;
    const today = new Date();
    const end = new Date(campaign.end_date);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine campaign phase based on status and dates
  const getCampaignPhase = () => {
    if (!campaign) return 'unknown';
    
    const today = new Date();
    // Parse dates from API format (YYYY-MM-DD)
    const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
    
    // If status is null or not set, treat as inactive (unpaid)
    if (!campaign.status) return 'inactive';
    
    // If status is explicitly set
    const status = campaign.status.toLowerCase();
    if (status === 'closed') return 'closed';
    if (status === 'inactive') return 'inactive'; // Unpaid campaigns
    
    // If status is active (paid)
    if (status === 'active') {
      // Check if influencers are selected
      if (!campaign.influencer_count || campaign.influencer_count === 0) {
        return 'active'; // Active but no influencers selected yet
      }
      
      // Campaign is ongoing
      if (startDate && endDate) {
        if (today < startDate) return 'scheduled';
        if (today >= startDate && today <= endDate) return 'ongoing';
        if (today > endDate) {
          // Campaign ended, check if payouts are done
          if (campaign.payoutCompleted) return 'closed';
          return 'completed';
        }
      }
      
      return 'ongoing';
    }
    
    return 'inactive'; // Default to inactive (unpaid)
  };

  const phase = getCampaignPhase();
  const daysRemaining = getDaysRemaining();

  if (!campaign) {
    return (
      <Box sx={{
        background: COLORS.background,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <LinearProgress sx={{ width: 60, height: 6, borderRadius: 3 }} />
          </Box>
          <Typography color={COLORS.textSecondary} fontSize={18} fontWeight={500}>
            Loading campaign details...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Render based on phase
  const renderPhaseContent = () => {
    switch (phase) {
      case 'inactive':
        return (
          <Card sx={{ p: 4, textAlign: 'center', mt: 3 }}>
            <CreditCardIcon sx={{ fontSize: 56, color: COLORS.primary, mb: 2 }} />
            <Typography variant="h5" fontWeight={600} mb={1.5}>
              Menunggu Pembayaran
            </Typography>
            <Typography color={COLORS.textSecondary} mb={3}>
              Selesaikan pembayaran untuk mengaktifkan campaign Anda
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/campaign/${id}/payment`)}
              sx={{ py: 1.5, px: 5, fontSize: 16, fontWeight: 700 }}
            >
              Bayar Sekarang
            </Button>
          </Card>
        );

      case 'active':
        return (
          <Card sx={{ p: 4, mt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <CheckCircleIcon sx={{ fontSize: 48, color: COLORS.success }} />
              <Box>
                <Typography variant="h6" fontWeight={600} mb={0.5}>
                  Campaign Active
                </Typography>
                <Typography color={COLORS.textSecondary}>
                  Menunggu influencer mendaftar
                </Typography>
              </Box>
            </Stack>
            <Paper sx={{ p: 2.5, background: COLORS.backgroundLight, borderRadius: 2, mb: 3 }} elevation={0}>
              <Typography fontSize={15} color={COLORS.textSecondary} mb={1}>
                <b>Campaign Period:</b> {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
              </Typography>
              <Typography fontSize={15} color={COLORS.textSecondary}>
                <b>Target Influencer:</b> {campaign.influencer_count || 0}
              </Typography>
              
               {/* Display Required Content Types */}
               {(campaign.content_types || (campaign.contentTypes && campaign.contentTypes.length > 0)) && (
                  <Box mt={2}>
                    <Typography fontSize={14} fontWeight={600} color={COLORS.textPrimary} mb={1}>
                       Required Content:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                       {(() => {
                          try {
                             const ctypes = typeof campaign.content_types === 'string' 
                                ? JSON.parse(campaign.content_types) 
                                : (campaign.content_types || campaign.contentTypes || []);
                             
                             return Array.isArray(ctypes) ? ctypes.map((item, idx) => (
                                <Chip 
                                   key={idx}
                                   label={`${item.post_count || 1}x ${item.content_type === 'foto' ? 'Feed' : (item.content_type || 'Post').replace('_', ' ')}`}
                                   size="small"
                                   sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', textTransform: 'capitalize' }}
                                />
                             )) : null;
                          } catch (e) { return null; }
                       })()}
                    </Stack>
                  </Box>
               )}
            </Paper>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/campaign/${id}/applicants`)}
                sx={{ flex: 1, py: 1.5, fontWeight: 700 }}
              >
                View Applicants
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate(`/campaign/${id}/review-submissions`)}
                sx={{ flex: 1, py: 1.5, fontWeight: 700, color: 'white' }}
                startIcon={<RateReviewIcon />}
              >
                Review Submissions
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/campaign-edit/${id}`)}
                sx={{ flex: 1, py: 1.5, fontWeight: 700 }}
              >
                Edit Campaign
              </Button>
              <Button
                variant="outlined"
                color="info"
                onClick={() => navigate(`/campaign/${id}/transactions`)}
                sx={{ flex: 1, py: 1.5, fontWeight: 700 }}
                startIcon={<CreditCardIcon />}
              >
                Transactions
              </Button>
            </Stack>
          </Card>
        );

      case 'ongoing':
        return (
          <Box mt={3}>
            {/* Status Card */}
            <Card sx={{ p: 4, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <RocketLaunchIcon sx={{ fontSize: 48, color: COLORS.primary }} />
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600} mb={0.5}>
                    Campaign Ongoing
                  </Typography>
                  <Typography color={COLORS.textSecondary}>
                    {daysRemaining !== null && daysRemaining >= 0
                      ? `${daysRemaining} hari lagi sampai deadline`
                      : 'Campaign deadline sudah lewat'}
                  </Typography>
                </Box>
                <Box textAlign="right" px={3} py={2} sx={{ background: COLORS.primaryLight, borderRadius: 2 }}>
                  <Typography fontSize={28} fontWeight={700} color={COLORS.primary}>
                    {Math.round(stats.progressPercentage)}%
                  </Typography>
                  <Typography fontSize={12} color={COLORS.textSecondary}>
                    Progress
                  </Typography>
                </Box>
              </Stack>
              {/* Progress Bar */}
              <Box mb={3}>
                <Stack direction="row" justifyContent="space-between" mb={1} fontSize={14} color={COLORS.textSecondary}>
                  <span>Content Submission Progress</span>
                  <span>{stats.completed} / {stats.totalSelected} completed</span>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={stats.progressPercentage}
                  sx={{ height: 12, borderRadius: 2, background: COLORS.backgroundLight, '& .MuiLinearProgress-bar': { background: COLORS.primary } }}
                />
              </Box>
              {/* Campaign Info */}
              <Grid container spacing={2} sx={{ p: 3, background: COLORS.backgroundLight, borderRadius: 2, mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Typography fontSize={12} color={COLORS.textSecondary} mb={0.5}>
                    DEADLINE CAMPAIGN
                  </Typography>
                  <Typography fontWeight={600} color={COLORS.textPrimary}>
                    {formatDate(campaign.end_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography fontSize={12} color={COLORS.textSecondary} mb={0.5}>
                    INFLUENCER AKTIF
                  </Typography>
                  <Typography fontWeight={600} color={COLORS.textPrimary}>
                    {stats.totalSelected} influencers
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography fontSize={12} color={COLORS.textSecondary} mb={0.5}>
                    TOTAL BUDGET
                  </Typography>
                  <Typography fontWeight={600} color={COLORS.textPrimary}>
                    {formatCurrency(campaign.price_per_post * stats.totalSelected)}
                  </Typography>
                </Grid>
              </Grid>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/campaign/${id}/applicants`)}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Lihat Applicants
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => navigate(`/campaign/${id}/review-submissions`)}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 700, color: 'white' }}
                  startIcon={<RateReviewIcon />}
                >
                  Review Submissions
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  onClick={() => navigate(`/campaign/${id}/transactions`)}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 700 }}
                  startIcon={<CreditCardIcon />}
                >
                  View Transactions
                </Button>
              </Stack>
            </Card>
            {/* Influencer Status */}
            {selectedInfluencers.length > 0 && (
              <Card sx={{ p: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                  Status Influencer
                </Typography>
                <Stack spacing={1.5}>
                  {selectedInfluencers.map(influencer => (
                    <Paper key={influencer.id} sx={{ p: 2, background: COLORS.backgroundLight, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} elevation={0}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: COLORS.gradient, width: 40, height: 40 }}>
                          <PersonIcon sx={{ color: '#fff' }} />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} fontSize={15}>{influencer.fullName}</Typography>
                          <Typography fontSize={13} color={COLORS.textSecondary}>@{influencer.influencerName}</Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={influencer.proofUploaded ? 'Sudah Upload' : 'Belum Upload'}
                        icon={influencer.proofUploaded ? <DoneAllIcon sx={{ color: '#fff' }} /> : <InfoOutlinedIcon sx={{ color: '#fff' }} />}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#fff',
                          background: influencer.proofUploaded
                            ? '#10b981'
                            : '#ffc107',
                        }}
                      />
                    </Paper>
                  ))}
                </Stack>
              </Card>
            )}
          </Box>
        );

      case 'completed':
        return (
          <Card sx={{ p: 4, mt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <AccessTimeIcon sx={{ fontSize: 48, color: COLORS.warning }} />
              <Box>
                <Typography variant="h6" fontWeight={600} mb={0.5}>
                  Selesai, Menunggu Pembayaran ke Influencer
                </Typography>
                <Typography color={COLORS.textSecondary}>
                  Campaign telah selesai dan sedang dalam proses verifikasi
                </Typography>
              </Box>
            </Stack>
            {/* Info Box */}
            <Paper sx={{ p: 3, background: '#fff3cd', borderRadius: 2, border: '1px solid #ffc107', mb: 3 }} elevation={0}>
              <Typography fontWeight={600} fontSize={15} color="#856404" mb={1}>
                <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} /> Informasi Penting
              </Typography>
              <Typography fontSize={14} color="#856404">
                Dana akan dicairkan ke influencer dalam <b>7 hari kerja</b> setelah verifikasi konten selesai.
              </Typography>
            </Paper>
            {/* Influencer List with Upload Status */}
            {selectedInfluencers.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Status Upload Konten
                </Typography>
                <Stack spacing={1.5}>
                  {selectedInfluencers.map(influencer => (
                    <Paper key={influencer.id} sx={{ p: 2, background: COLORS.backgroundLight, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} elevation={0}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: COLORS.gradient, width: 40, height: 40 }}>
                          <PersonIcon sx={{ color: '#fff' }} />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} fontSize={15}>{influencer.fullName}</Typography>
                          <Typography fontSize={13} color={COLORS.textSecondary}>@{influencer.influencerName}</Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={influencer.proofUploaded ? 'Sudah Upload' : 'Belum Upload'}
                        icon={influencer.proofUploaded ? <DoneAllIcon sx={{ color: '#fff' }} /> : <InfoOutlinedIcon sx={{ color: '#fff' }} />}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#fff',
                          background: influencer.proofUploaded
                            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                            : '#dc3545',
                        }}
                      />
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
            {/* Summary */}
            <Paper sx={{ p: 3, background: COLORS.primaryLight, borderRadius: 2 }} elevation={0}>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography color={COLORS.textSecondary}>Total Influencer:</Typography>
                <Typography fontWeight={600}>{stats.totalSelected}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography color={COLORS.textSecondary}>Sudah Upload:</Typography>
                <Typography fontWeight={600} color={COLORS.success}>{stats.completed}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography color={COLORS.textSecondary}>Belum Upload:</Typography>
                <Typography fontWeight={600} color={COLORS.danger}>{stats.pending}</Typography>
              </Stack>
              
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate(`/campaign/${id}/review-submissions`)}
                fullWidth
                sx={{ mt: 2, fontWeight: 700, color: 'white' }}
                startIcon={<RateReviewIcon />}
              >
                Review Submissions
              </Button>
            </Paper>
          </Card>
        );

      case 'closed':
        return (
          <Card sx={{ p: 4, mt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <CheckCircleIcon sx={{ fontSize: 48, color: COLORS.success }} />
              <Box>
                <Typography variant="h6" fontWeight={600} mb={0.5}>
                  Campaign Closed
                </Typography>
                <Typography color={COLORS.textSecondary}>
                  Campaign telah selesai dan semua pembayaran sudah cair
                </Typography>
              </Box>
            </Stack>
            {/* Campaign Summary */}
            <Paper sx={{ p: 3, background: COLORS.backgroundLight, borderRadius: 2, mb: 3 }} elevation={0}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Ringkasan Campaign
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography fontSize={12} color={COLORS.textSecondary} mb={0.5}>
                    TOTAL INFLUENCER
                  </Typography>
                  <Typography fontSize={24} fontWeight={700} color={COLORS.primary}>
                    {stats.totalSelected}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography fontSize={12} color={COLORS.textSecondary} mb={0.5}>
                    TOTAL ENGAGEMENT
                  </Typography>
                  <Typography fontSize={24} fontWeight={700} color={COLORS.success}>
                    {selectedInfluencers.reduce((sum, inf) => sum + (inf.engagement || 0), 0).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography fontSize={12} color={COLORS.textSecondary} mb={0.5}>
                    TOTAL BIAYA
                  </Typography>
                  <Typography fontSize={24} fontWeight={700} color={COLORS.textPrimary}>
                    {formatCurrency(campaign.price_per_post * stats.totalSelected)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography fontSize={12} color={COLORS.textSecondary} mb={0.5}>
                    PERIODE CAMPAIGN
                  </Typography>
                  <Typography fontSize={16} fontWeight={600} color={COLORS.textPrimary}>
                    {formatDate(campaign.start_date)}<br />{formatDate(campaign.end_date)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            {/* Success Message */}
            <Paper sx={{ p: 3, background: '#d1fae5', borderRadius: 2, border: '1px solid #10b981', textAlign: 'center', mb: 2 }} elevation={0}>
              <Typography fontSize={16} color={COLORS.success} fontWeight={600}>
                <CheckCircleIcon sx={{ fontSize: 20, color: COLORS.success, mr: 1, verticalAlign: 'middle' }} /> Semua pembayaran sudah cair. Terima kasih telah menggunakan Influent!
              </Typography>
            </Paper>
            {/* Optional: View Report Button */}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {/* Navigate to report */}}
              fullWidth
              sx={{ mt: 2, py: 1.5, fontWeight: 600, fontSize: 16 }}
              startIcon={<BarChartIcon />}
            >
              Lihat Laporan Lengkap
            </Button>
          </Card>
        );

      default:
        return (
          <Card sx={{ p: 4, mt: 3, textAlign: 'center' }}>
            <BarChartIcon sx={{ fontSize: 48, color: COLORS.primary, mb: 2 }} />
            <Typography variant="h6" mb={1.5}>Campaign Details</Typography>
            <Typography color={COLORS.textSecondary}>
              Status: {campaign.status || 'Unknown'}
            </Typography>
          </Card>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: !isMobile ? 32.5 : 0, flex: 1 }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box sx={{ mt: 9, background: '#f7fafc', minHeight: 'calc(100vh - 72px)', p: { xs: 2, md: 4 } }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* Back Button */}
            <Button
              color="primary"
              onClick={() => navigate('/campaigns/list')}
              sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, textTransform: 'none', fontSize: 16 }}
              startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
            >
              Back to Campaigns
            </Button>
            {/* Campaign Header */}
            <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {campaign.banner_image ? (
                 <Box 
                   component="img" 
                   src={campaign.banner_image.startsWith('http') || campaign.banner_image.startsWith('data:') ? campaign.banner_image : `http://localhost:8000/api/uploads/${campaign.banner_image}`}
                   alt={campaign.title}
                   sx={{ width: '100%', height: 240, objectFit: 'cover' }}
                 />
              ) : (
                 <Box sx={{ height: 120, background: COLORS.gradient }} />
              )}
              <Box sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight={700} color={COLORS.textPrimary} mb={1.5}>
                {campaign.title}
              </Typography>
              <Typography fontSize={15} color={COLORS.textSecondary} mb={2}>
                {campaign.campaign_category || 'No Category'}
              </Typography>
              <Chip
                label={phase === 'closed' ? 'Selesai' :
                  phase === 'ongoing' ? 'Sedang Berjalan' :
                  phase === 'awaiting-payout' ? 'Menunggu Pembayaran' :
                  phase === 'active' ? 'Aktif' :
                  campaign.status}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: phase === 'closed' ? '#10b981' :
                    phase === 'ongoing' ? '#6E00BE' :
                    phase === 'awaiting-payout' ? '#f59e0b' :
                    '#3b82f6',
                  color: '#fff',
                }}
              />
              </Box>
            </Card>

            {/* Cancellation Reason Alert */}
            {campaign.status === 'cancelled' && campaign.cancellation_reason && (
              <Card sx={{ 
                p: 3, 
                mb: 3, 
                background: '#fee2e2', 
                border: '2px solid #ef4444',
                borderRadius: 2
              }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ 
                    fontSize: '32px', 
                    lineHeight: 1,
                    mt: -0.5
                  }}>
                    ⚠️
                  </Box>
                  <Box flex={1}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      color="#dc2626" 
                      mb={1}
                    >
                      Campaign Dibatalkan
                    </Typography>
                    <Typography 
                      fontSize={15} 
                      color="#7f1d1d" 
                      lineHeight={1.6}
                    >
                      <strong>Alasan:</strong> {campaign.cancellation_reason}
                    </Typography>
                    <Typography 
                      fontSize={14} 
                      color="#991b1b" 
                      mt={2}
                      fontStyle="italic"
                    >
                      💡 Anda dapat membuat campaign baru dengan memperbaiki masalah di atas.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Pending Review Info */}
            {campaign.status === 'pending_review' && (
              <Card sx={{ 
                p: 3, 
                mb: 3, 
                background: '#fff3cd', 
                border: '2px solid #ffc107',
                borderRadius: 2
              }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ fontSize: '28px' }}>⏳</Box>
                  <Box flex={1}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      color="#856404" 
                      mb={0.5}
                    >
                      Campaign Dalam Review
                    </Typography>
                    <Typography fontSize={15} color="#856404">
                      Campaign Anda sedang ditinjau oleh tim admin. Mohon tunggu konfirmasi.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Pending Payment Success */}
            {campaign.status === 'pending_payment' && (
              <Card sx={{ 
                p: 3, 
                mb: 3, 
                background: '#d1fae5', 
                border: '2px solid #10b981',
                borderRadius: 2
              }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ fontSize: '28px' }}>✅</Box>
                  <Box flex={1}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      color="#065f46" 
                      mb={0.5}
                    >
                      Campaign Disetujui!
                    </Typography>
                    <Typography fontSize={15} color="#065f46">
                      Selamat! Campaign Anda telah disetujui. Silakan lakukan pembayaran untuk mengaktifkan campaign.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Phase-specific Content */}
            
            {renderPhaseContent()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CampaignDetail;
