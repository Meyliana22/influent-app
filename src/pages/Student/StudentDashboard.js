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
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import CollaborationIcon from '@mui/icons-material/Handshake';
import EarningsIcon from '@mui/icons-material/AttachMoney';
import RatingIcon from '@mui/icons-material/Star';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import campaignService from '../../services/campaignService';

function StudentDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [stats, setStats] = useState({
    availableCampaigns: 0,
    myCollaborations: 0,
    totalEarnings: 0,
    averageRating: 0
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
      let campaigns = [];
      if (Array.isArray(response)) {
        campaigns = response;
      } else if (response?.data && Array.isArray(response.data)) {
        campaigns = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        campaigns = response.data.data;
      }

      // Calculate stats for student
      const availableCampaigns = campaigns.filter(c => c.status === 'active').length;
      const myCollaborations = 5; // TODO: Load from collaborations API
      const totalEarnings = 2500000; // TODO: Load from transactions API
      const averageRating = 4.8; // TODO: Load from reviews API

      setStats({
        availableCampaigns,
        myCollaborations,
        totalEarnings,
        averageRating
      });

      // Get recent 3 campaigns - sort by created_at descending
      const sortedCampaigns = [...campaigns].sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
      
      const recentThree = sortedCampaigns.slice(0, 3);
      setRecentCampaigns(recentThree);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats({
        availableCampaigns: 0,
        myCollaborations: 0,
        totalEarnings: 0,
        averageRating: 0
      });
      setRecentCampaigns([]);
    }
  };

  const statCards = [
    {
      title: 'Available Campaigns',
      value: stats.availableCampaigns,
      IconComponent: CampaignIcon,
      bgColor: '#e0e7ff',
      iconColor: '#4c51bf',
      description: 'Campaigns you can join'
    },
    {
      title: 'My Collaborations',
      value: stats.myCollaborations,
      IconComponent: CollaborationIcon,
      bgColor: '#dcfce7',
      iconColor: '#15803d',
      description: 'Active collaborations'
    },
    {
      title: 'Total Earnings',
      value: `Rp ${(stats.totalEarnings || 0).toLocaleString('id-ID')}`,
      IconComponent: EarningsIcon,
      bgColor: '#fef3c7',
      iconColor: '#b45309',
      description: 'From collaborations'
    },
    {
      title: 'Average Rating',
      value: `${stats.averageRating}`,
      IconComponent: RatingIcon,
      bgColor: '#fecdd3',
      iconColor: '#be123c',
      description: 'From collaborators'
    }
  ];

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <Box
        sx={{
          marginLeft: isMobile ? 0 : '260px',
          marginTop: '72px',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          padding: { xs: 2, md: 4 },
          backgroundColor: '#f8f9fa',
          minHeight: 'calc(100vh - 72px)'
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              Welcome, {userName}!
              <WavingHandIcon sx={{ fontSize: 32, transform: 'scaleX(-1)', color: '#fbbf24', ml: 1 }} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'text.secondary',
                m: 0
              }}
            >
              Discover exciting campaigns and grow your influence
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(25ch, 1fr))',
            gap: 2.5,
            mb: 4
          }}>
            {statCards.map((stat, index) => {
              const Icon = stat.IconComponent;
              return (
                <Box
                  key={index}
                  sx={{
                    background: '#fff',
                    borderRadius: 5,
                    p: 3,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    minWidth: 0,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    boxShadow: 0,
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{
                    width: 45,
                    height: 45,
                    borderRadius: 2,
                    bgcolor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon sx={{ fontSize: 25, color: stat.iconColor }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5, fontFamily: "'Inter', sans-serif" }}>
                      {stat.title}
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36', fontFamily: "'Inter', sans-serif" }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#a0aec0', fontFamily: "'Inter', sans-serif" }}>
                      {stat.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Recent Campaigns Section */}
          <Paper
            sx={{
              background: '#fff',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1a1f36',
                  margin: 0
                }}
              >
                Recent Campaigns
              </Typography>
              <Button
                onClick={() => navigate('/student/browse-campaigns')}
                variant="contained"
                sx={{
                  padding: '0.5rem 1rem',
                  background: '#6E00BE',
                  color: '#fff',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: '#5a009e'
                  },
                  borderRadius: 2.5
                }}
              >
                View All
              </Button>
            </Box>

            {recentCampaigns.length > 0 ? (
              <List sx={{ width: '100%', padding: 0 }}>
                {recentCampaigns.map((campaign, index) => (
                  <Box key={index}>
                    <ListItem
                      sx={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        background: '#f8f9fa',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: index < recentCampaigns.length - 1 ? '0.75rem' : 0,
                        '&:hover': {
                          background: '#f0f3ff',
                          borderColor: '#6E00BE'
                        }
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#1a1f36',
                            fontSize: '0.95rem'
                          }}
                        >
                          {campaign.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            marginTop: '0.25rem',
                            fontSize: '0.85rem',
                            color: '#6c757d',
                            display: 'block'
                          }}
                        >
                          {campaign.product_desc?.substring(0, 60) || 'No description'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', ml: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: '#6E00BE',
                            fontSize: '0.9rem'
                          }}
                        >
                          Rp {(campaign.price_per_post || 0).toLocaleString('id-ID')}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < recentCampaigns.length - 1 && <Divider sx={{ margin: 0 }} />}
                  </Box>
                ))}
              </List>
            ) : (
                            <Box sx={{ textAlign: 'center', paddingY: '2rem' }}>
                <CampaignIcon sx={{ fontSize: '3rem', color: '#cbd5e1', mb: 1 }} />
                <Typography sx={{ fontSize: '0.95rem', color: '#6c757d' }}>
                  No campaigns available yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default StudentDashboard;