import React, { useState, useEffect } from 'react';
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
import ApplicantIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import campaignService from '../../services/campaignService';

function UMKMDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    ongoingCampaigns: 0,
    completedCampaigns: 0,
    totalApplicants: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  useEffect(() => {
    loadDashboardData();
    
    // Handle window resize for responsive layout
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch campaigns from API
      const response = await campaignService.getCampaigns();
      // Handle different response structures
      let campaigns = [];
      if (Array.isArray(response)) {
        campaigns = response;
      } else if (response?.data && Array.isArray(response.data)) {
        campaigns = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        campaigns = response.data.data;
      }
      const applicants = []; // TODO: Load from applicants API when available

      // Calculate stats
      const total = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      const completedCampaigns = campaigns.filter(c => c.status === 'completed');
      const ongoing = activeCampaigns.length;
      const completed = completedCampaigns.length;
      const totalApplicants = applicants.length;
      setStats({
        totalCampaigns: total,
        ongoingCampaigns: ongoing,
        completedCampaigns: completed,
        totalApplicants
      });

      // Get recent 3 campaigns - sort by created_at descending
      const sortedCampaigns = [...campaigns].sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA; // Most recent first
      });
      
      const recentThree = sortedCampaigns.slice(0, 3);
      setRecentCampaigns(recentThree);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      // Fallback to empty state
      setStats({
        totalCampaigns: 0,
        ongoingCampaigns: 0,
        completedCampaigns: 0,
        totalApplicants: 0
      });
      setRecentCampaigns([]);
    }
  };

  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats.totalCampaigns,
      IconComponent: CampaignIcon,
      bgColor: '#e0e7ff',
      iconColor: '#4c51bf', // Darker indigo to match light indigo background
      description: 'All time campaigns'
    },
    {
      title: 'Ongoing Campaigns',
      value: stats.ongoingCampaigns,
      IconComponent: OngoingIcon,
      bgColor: '#ffebebff',
      iconColor: '#dc2626', // Darker red to match light red background
      description: 'Currently active'
    },
    {
      title: 'Completed Campaigns',
      value: stats.completedCampaigns,
      IconComponent: CompletedIcon,
      color: '#fce1e1ff',
      bgColor: '#fcffd1ff',
      iconColor: '#bdaa33ff', // Darker yellow to match light yellow background
      description: 'Successfully finished'
    },
    {
      title: 'Total Applicants',
      value: stats.totalApplicants,
      IconComponent: ApplicantIcon,
      bgColor: '#f9e9ffff',
      iconColor: '#6f3ec5ff', // Darker purple to match light purple background
      description: 'All time applicants'
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

        <Container maxWidth={false} sx={{ marginTop: '72px', padding: '32px', maxWidth: '100%' }}>
          {/* Page Header */}
          <Box sx={{ marginBottom: '32px' }}>
            <Typography variant="h4" sx={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1a1f36',
              margin: '0px'
            }}>
              Welcome, {userName}! 👋
            </Typography>
            <Typography sx={{
              fontSize: '0.95rem',
              color: '#6c757d'
            }}>
              Here's what's happening with your campaigns today.
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
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    width: '100%',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
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
                Recent Campaigns
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
                View All
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
                  No campaigns yet
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Create your first campaign to get started
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
                  Create Campaign
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
                        {campaign.title || 'Untitled Campaign'}
                      </Typography>
                      <Box sx={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: campaign.status === 'active' ? '#d1fae5' : campaign.status === 'inactive' ? '#e2e8f0' : '#fff',
                        color: campaign.status === 'active' ? '#065f46' : campaign.status === 'inactive' ? '#6c757d' : '#000'
                      }}>
                        {campaign.status === 'active' ? 'Active' : campaign.status === 'inactive' ? 'Inactive' : campaign.status}
                      </Box>
                    </Box>
                    <Typography sx={{
                      fontSize: '0.85rem',
                      color: '#6c757d',
                      marginBottom: '0.5rem'
                    }}>
                      {campaign.product_desc?.substring(0, 80) || 'No description'}...
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      alignItems: 'center'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AttachMoneyIcon sx={{ fontSize: '1rem' }} /> 
                        Rp {(campaign.price_per_post || 0).toLocaleString('id-ID')}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ApplicantIcon sx={{ fontSize: '1rem' }} /> 
                        {campaign.influencer_count || 0} influencers
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
