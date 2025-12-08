import React, { useEffect, useState } from 'react';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import { Sidebar, Topbar } from '../../components/common';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { COLORS } from '../../constants/colors';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function AdminDashboard() {
    const theme = useTheme();
    const isDesktop = useMediaQuery('(min-width:1000px)');
    const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

    // Keep sidebarOpen in sync with screen size
    useEffect(() => {
      setSidebarOpen(isDesktop);
    }, [isDesktop]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCampaigns: 0,
    pendingReview: 0,
    reportsFiled: 0
  });

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';

  useEffect(() => {
    // Load data from localStorage
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
    
    // Calculate stats
    const uniqueInfluencers = new Set(applicants.map(a => a.influencerName)).size;
    const totalUsers = uniqueInfluencers + 5; // + mock UMKM users
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const pendingReview = campaigns.filter(c => c.status === 'Draft').length;
    
    setStats({
      totalUsers,
      activeCampaigns,
      pendingReview,
      reportsFiled: 3 // Mock data
    });
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      IconComponent: PeopleIcon,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns,
      IconComponent: CampaignIcon,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      IconComponent: HourglassEmptyIcon,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: '3 new',
      changeType: 'neutral'
    },
    {
      title: 'Reports Filed',
      value: stats.reportsFiled,
      IconComponent: WarningIcon,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      change: '1 new',
      changeType: 'negative'
    }
  ];

  const recentActivities = [
    { action: 'New campaign created', user: 'Scarlett Beauty', time: '5 min ago', IconComponent: CampaignIcon, color: '#667eea' },
    { action: 'User registered', user: '@beautyguru', time: '15 min ago', IconComponent: PersonIcon, color: '#10b981' },
    { action: 'Campaign completed', user: 'Gaming Pro Campaign', time: '1 hour ago', IconComponent: CheckCircleIcon, color: '#10b981' },
    { action: 'Report submitted', user: 'Campaign #1234', time: '2 hours ago', IconComponent: WarningIcon, color: '#ef4444' },
    { action: 'Payment processed', user: 'Rp 5.000.000', time: '3 hours ago', IconComponent: AttachMoneyIcon, color: '#f59e0b' }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      fontFamily: "'Inter', sans-serif",
      width: '100vw',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        sx={{
          marginLeft: isDesktop && sidebarOpen ? '260px' : 0,
          width: isDesktop && sidebarOpen ? 'calc(100% - 260px)' : '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Topbar />
        
        <Box
          sx={{
            marginTop: 9,
            width: '100%',
            maxWidth: '100%',
            padding: 4,
            backgroundColor: '#f8f9fa',
            minHeight: 'calc(100vh - 72px)',
            boxSizing: 'border-box',
            overflowX: 'hidden'
          }}
        >
          {/* Page Header */}
          <Box sx={{ marginBottom: 4 }}>
            <Typography variant="h4" sx={{
              fontSize: 32,
              fontWeight: 700,
              color: '#1a1f36',
              marginBottom: 1
            }}>
                Welcome, {userName}!
                <WavingHandIcon sx={{ fontSize: 32, transform: 'scaleX(-1)', color: '#fbbf24', ml: 1 }} />
            </Typography>
            <Typography sx={{
              fontSize: 15, // 0.95rem ≈ 15px
              color: '#6c757d'
            }}>
              Here's what's happening with your platform today.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2.5,
            marginBottom: 4
          }}>
            {statCards.map((card, index) => (
              <Box
                key={index}
                sx={{
                  background: '#fff',
                  borderRadius: 5,
                  padding: 2.5,
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
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: card.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <card.IconComponent sx={{ fontSize: 28, color: card.color }} />
                </Box>
                <Box>
                  <Typography sx={{
                    fontSize: '0.85rem',
                    color: '#6c757d',
                    marginBottom: '4px',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1a1f36',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {card.value}
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.85rem',
                    color: '#a0aec0',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {card.change}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Recent Activities */}
          <Paper sx={{
            background: '#fff',
            borderRadius: 2,
            padding: 3,
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" sx={{
              fontSize: 20,
              fontWeight: 700,
              color: '#1a1f36',
              marginBottom: 2
            }}>
              Recent Activities
            </Typography>
            <Stack spacing={1}>
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    padding: 2,
                    background: '#f7fafc',
                    borderRadius: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: '#edf2f7'
                    }
                  }}
                >
                  <Box sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1,
                    background: activity.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <activity.IconComponent sx={{ fontSize: '1.375rem', color: activity.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#1a1f36',
                      marginBottom: 0.5
                    }}>
                      {activity.action}
                    </Typography>
                    <Typography sx={{
                      fontSize: 13,
                      color: '#6c757d'
                    }}>
                      {activity.user}
                    </Typography>
                  </Box>
                  <Typography sx={{
                    fontSize: 12,
                    color: '#6c757d',
                    whiteSpace: 'nowrap'
                  }}>
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
          {/* Quick Actions */}
          {/* <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1a1f36',
              marginBottom: '20px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Add New User', icon: '➕👤', color: COLORS.gradient },
                { label: 'Verify Campaign', icon: '✅', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                { label: 'View Reports', icon: '📊', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
                { label: 'Export Data', icon: '📥', color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
              ].map((action, index) => (
                <button
                  key={index}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: action.color,
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s',
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div> */}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
