import React, { useState, useEffect } from 'react';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors.js';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import OngoingIcon from '@mui/icons-material/HourglassEmpty';
import CompletedIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import campaignService from '../../services/campaignService';
import { BarChart3 } from 'lucide-react';

// Get status badge style
const getStatusStyle = (status) => {
  const styles = {
    'admin_review': {
      background: '#fff3cd',
      color: '#856404',
      boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
    },
    'pending_payment': {
      background: '#cfe2ff',
      color: '#084298',
      boxShadow: '0 2px 8px rgba(13, 110, 253, 0.3)'
    },
    'cancelled': {
      background: '#ffe5e5',
      color: '#c41e3a',
      boxShadow: '0 2px 8px rgba(196, 30, 58, 0.3)'
    },
    'draft': {
      background: '#e2e8f0',
      color: '#6c757d',
      boxShadow: '0 2px 8px rgba(143, 143, 143, 0.3)'
    },
    'active': { 
      background: '#d1fae5', 
      color: '#155724',
      boxShadow: '0 2px 8px rgba(132, 250, 176, 0.3)'
    },
    'completed': {
      background: '#e0d4ff',
      color: '#5b21b6',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
    }
  };
  return styles[status?.toLowerCase()] || styles['draft'];
};

// Get status display text (Bahasa Indonesia)
const getStatusText = (status) => {
  const statusTexts = {
    'admin_review': 'Ditinjau Admin',
    'pending_payment': 'Menunggu Pembayaran',
    'cancelled': 'Dibatalkan',
    'draft': 'Draft',
    'active': 'Aktif',
    'completed': 'Selesai'
  };
  return statusTexts[status?.toLowerCase()] || status || 'Tidak Diketahui';
};

function UMKMDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [stats, setStats] = useState({
    ongoingCampaigns: 0,
    totalSpendThisMonth: 0,
    influencersEngaged: 0,
    completedCampaigns: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  useEffect(() => {
    // Load dashboard data once on mount
    loadDashboardData();
    
    // Handle window resize for responsive layout
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps array - only run once on mount to avoid double API calls

  const loadDashboardData = async () => {
    try {
      // Fetch dashboard stats from API
      // Best practice: Use dedicated dashboard endpoint that returns aggregated stats
      const statsResponse = await campaignService.getDashboardStats();
      
        if (statsResponse?.data) {
          setStats({
            ongoingCampaigns: statsResponse.data.ongoing_campaigns || 0,
            totalSpendThisMonth: statsResponse.data.total_spend_this_month || 0,
            influencersEngaged: statsResponse.data.influencers_engaged || 0,
            completedCampaigns: statsResponse.data.completed_campaigns || 0
          });
        }      // Fetch campaigns from API for recent campaigns list - sorted by newest first
      const response = await campaignService.getCampaigns({ 
        limit: 3, 
        sort: 'campaign_id',
        order: 'DESC'
      });
      // Handle different response structures
      let campaigns = [];
      if (Array.isArray(response)) {
        campaigns = response;
      } else if (response?.data && Array.isArray(response.data)) {
        campaigns = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        campaigns = response.data.data;
      }
      
      setRecentCampaigns(campaigns.slice(0, 3));


    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      // Fallback to empty state
      setStats({
        ongoingCampaigns: 0,
        totalSpendThisMonth: 0,
        influencersEngaged: 0,
        completedCampaigns: 0
      });
      setRecentCampaigns([]);
    }
  };

  const statCards = [
    {
      title: 'Total Pengeluaran',
      value: `Rp ${stats.totalSpendThisMonth.toLocaleString('id-ID')}`,
      IconComponent: PaymentIcon,
      bgColor: '#d1fae5',
      iconColor: '#059669',
      description: 'Budget bulan ini',
      filterPath: '/transactions',
      filterType: 'expense'
    },
    {
      title: 'Campaign Sedang Berjalan',
      value: stats.ongoingCampaigns,
      IconComponent: OngoingIcon,
      bgColor: '#ffebebff',
      iconColor: '#dc2626',
      description: 'Sedang aktif',
      filterPath: '/umkm/campaigns',
      filterType: 'active'
    },
    {
      title: 'Influencer Terlibat',
      value: stats.influencersEngaged,
      IconComponent: PersonIcon,
      bgColor: '#f9e9ffff',
      iconColor: '#6f3ec5ff',
      description: 'Kolaborasi aktif',
      filterPath: '/umkm/campaigns',
      filterType: 'active'
    },
    {
      title: 'Campaign Selesai',
      value: stats.completedCampaigns,
      IconComponent: CompletedIcon,
      bgColor: '#fcffd1ff',
      iconColor: '#bdaa33ff',
      description: 'Berhasil diselesaikan',
      filterPath: '/umkm/campaigns',
      filterType: 'completed'
    }
  ];

  const recentActivities = [
    {
      IconComponent: CompletedIcon,
      title: 'Campaign Created',
      description: 'New campaign has been published',
      time: '2 hours ago',
      color: '#10b981'
    },
    {
      IconComponent: PersonIcon,
      title: 'New Applicant',
      description: 'Influencer applied to your campaign',
      time: '5 hours ago',
      color: '#3b82f6'
    },
    {
      IconComponent: AttachMoneyIcon,
      title: 'Payment Successful',
      description: 'Campaign payment processed',
      time: '1 day ago',
      color: '#f59e0b'
    },
    {
      IconComponent: BarChartIcon,
      title: 'Campaign Approved',
      description: 'Your campaign has been verified',
      time: '2 days ago',
      color: '#8b5cf6'
    }
  ];

  return (
    <Box sx={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box sx={{ 
        marginLeft: !isMobile ? '260px' : '0',
        width: !isMobile ? 'calc(100% - 260px)' : '100%',
        transition: 'all 0.3s ease'
      }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <Container
          maxWidth={false}
          sx={{
            marginTop: '72px',
            padding: '32px',
            maxWidth: '100%',
            height: 'calc(100vh - 72px)',
            overflow: 'auto',
          }}
        >
          {/* Page Header */}
          <Box sx={{ marginBottom: '32px' }}>
            <Typography variant="h4" sx={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1a1f36',
              margin: '0px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              Selamat Datang, {userName}!
            </Typography>
            <Typography sx={{
              fontSize: '0.95rem',
              color: '#6c757d'
            }}>
              Berikut aktivitas campaign Anda hari ini.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 5,
                    p: 2,
                    pr: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    width: '100%'
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      height: '100%',
                      p: 0,
                      '&:last-child': {
                        p: 0
                      }
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 48,
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: card.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <card.IconComponent sx={{ fontSize: 24, color: card.iconColor }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.8rem',
                          color: '#6c757d',
                          fontWeight: 500,
                          display: 'block'
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: '#1a1f36',
                          lineHeight: 1.2
                        }}
                      >
                        {card.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: '#a0aec0',
                          display: 'block'
                        }}
                      >
                        {card.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Recent Campaigns */}
          <Paper sx={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}>
              <Typography variant="h6" sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1a1f36'
              }}>
                Campaign Terbaru
              </Typography>
              <Button
                onClick={() => navigate('/campaigns')}
                variant="outlined"
                sx={{
                  padding: '0.5rem 1rem',
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: '#667eea',
                    color: '#fff'
                  }
                }}
              >
                Lihat Semua
              </Button>
            </Box>

            {recentCampaigns.length === 0 ? (
              <Box sx={{
                padding: '2.5rem 1.25rem',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                <CampaignIcon sx={{ fontSize: '4rem', color: '#9ca3af', mb: 1, display: 'block', mx: 'auto' }} />
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Belum ada campaign
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Buat campaign pertama Anda untuk memulai
                </Typography>
                <Button
                  onClick={() => navigate('/campaign-create')}
                  variant="contained"
                  sx={{
                    background: COLORS.primary,
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  Buat Campaign
                </Button>
              </Box>
            ) : (
              <Stack spacing={1}>
                {recentCampaigns.map((campaign, index) => (
                  <Paper
                    key={campaign.campaign_id || index}
                    onClick={() => navigate(`/campaign/${campaign.campaign_id}/detail`)}
                    sx={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: '#f7fafc',
                        borderColor: '#667eea'
                      },
                      background: '#fff'
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '0.5rem'
                    }}>
                      <Typography sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1a1f36'
                      }}>
                        {campaign.title || 'Campaign Tanpa Judul'}
                      </Typography>
                      <Box sx={{
                        ...getStatusStyle(campaign.status),
                        px: 2,
                        py: 0.5,
                        borderRadius: 5,
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                      }}>
                        {getStatusText(campaign.status)}
                      </Box>
                    </Box>
                    <Typography sx={{
                      fontSize: '0.85rem',
                      color: '#6c757d',
                      marginBottom: '0.5rem'
                    }}>
                      {campaign.product_desc?.substring(0, 80) || 'Tidak ada deskripsi'}...
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      alignItems: 'center'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <PersonIcon sx={{ fontSize: '1rem' }} /> 
                        {campaign.influencer_count || 0} influencer
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Rp {(campaign.price_per_post || 0).toLocaleString('id-ID')}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <BarChart3 size={13} color={COLORS.textSecondary} />
                        {campaign.min_followers ? `${parseInt(campaign.min_followers).toLocaleString('id-ID')}+ followers` : 'No min'}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default UMKMDashboard;
