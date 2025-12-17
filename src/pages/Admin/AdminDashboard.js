import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People as PeopleIcon,
  Campaign as CampaignIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  School as StudentIcon,
  Business as CompanyIcon,
  WavingHand as WavingHandIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { Sidebar, Topbar } from '../../components/common';
import adminService from '../../services/adminService';
import { COLORS } from '../../constants/colors';

function AdminDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  // Keep sidebarOpen in sync with screen size
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // State management
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCompanies: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    pendingCampaigns: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    completedWithdrawals: 0,
    totalTransactions: 0,
    totalRevenue: 0
  });
  
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Admin';

  // Ensure admin role is set correctly
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      if (userData.role !== 'admin') {
        // Update role to admin
        userData.role = 'admin';
        localStorage.setItem('user', JSON.stringify(userData));
        // Force re-render by reloading the page
        window.location.reload();
      }
    }
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats from analytics service
      const statsData = await adminService.analytics.getStats();
      setStats(statsData);

      // Fetch recent withdrawals (pending only)
      const withdrawalsData = await adminService.withdrawals.getAllWithdrawals({ 
        status: 'pending', 
        limit: 5 
      });
      console.log("Withdrawals Data : " , withdrawalsData);
      setRecentWithdrawals(
        Array.isArray(withdrawalsData.data.withdrawals) ? withdrawalsData.data.withdrawals : [])
      

      // Fetch recent campaigns
      const campaignsData = await adminService.campaigns.getAllCampaigns();
      const allCampaigns = Array.isArray(campaignsData.data) ? campaignsData.data : []
      setRecentCampaigns(allCampaigns.slice(0, 5));

      // Fetch recent users
      const usersData = await adminService.users.getAllUsers();
      const allUsers = Array.isArray(usersData.data) ? usersData.data : []
      setRecentUsers(allUsers.slice(0, 5));

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.totalStudents} Students, ${stats.totalCompanies} Companies`,
      IconComponent: PeopleIcon,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      path: '/admin/users'
    },
    {
      title: 'Total Campaigns',
      value: stats.totalCampaigns,
      subtitle: `${stats.activeCampaigns} Active, ${stats.completedCampaigns} Completed`,
      IconComponent: CampaignIcon,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      path: '/admin/campaigns'
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      subtitle: `${stats.totalWithdrawals} Total Requests`,
      IconComponent: AccountBalanceIcon,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      path: '/admin/reports'
    },
    {
      title: 'Total Revenue',
      value: `Rp ${stats.totalRevenue?.toLocaleString('id-ID') || 0}`,
      subtitle: `${stats.totalTransactions} Transactions`,
      IconComponent: AttachMoneyIcon,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      path: '/admin/reports'
    }
  ];

  const recentActivities = [
    { action: 'New campaign created', user: 'Scarlett Beauty', time: '5 min ago', IconComponent: CampaignIcon, color: '#667eea' },
    { action: 'User registered', user: '@beautyguru', time: '15 min ago', IconComponent: PersonIcon, color: '#10b981' },
    { action: 'Campaign completed', user: 'Gaming Pro Campaign', time: '1 hour ago', IconComponent: CheckCircleIcon, color: '#10b981' },
    { action: 'Report submitted', user: 'Campaign #1234', time: '2 hours ago', IconComponent: WarningIcon, color: '#ef4444' },
    { action: 'Payment processed', user: 'Rp 5.000.000', time: '3 hours ago', IconComponent: PaymentIcon, color: '#f59e0b' }
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
          marginLeft: isDesktop && sidebarOpen ? 32.5 : 0, // 260px / 8
          width: isDesktop && sidebarOpen ? 'calc(100% - 260px)' : '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Topbar />
        
        <Box
          sx={{
            mt: 9,
            width: '100%',
            maxWidth: '100%',
            p: 4,
            backgroundColor: '#f8f9fa',
            minHeight: 'calc(100vh - 9 * 8px)',
            boxSizing: 'border-box',
            overflowX: 'hidden'
          }}
        >
          {/* Page Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{
                fontSize: 32,
                fontWeight: 700,
                color: '#1a1f36',
                mb: 1
              }}>
                Welcome, {userName}!
                <WavingHandIcon sx={{ fontSize: 32, transform: 'scaleX(-1)', color: '#fbbf24', ml: 1 }} />
              </Typography>
              <Typography sx={{
                fontSize: 16,
                color: '#6c757d'
              }}>
                Here's what's happening with your platform today.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadDashboardData}
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
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              {/* Stats Cards */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 3,
                mb: 4
              }}>
                {statCards.map((card, index) => (
                  <Paper
                    key={index}
                    onClick={() => navigate(card.path)}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        transform: 'translateY(-4px)',
                        borderColor: card.color
                      }
                    }}
                  >
                    <Box sx={{
                      minWidth: 64,
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <card.IconComponent sx={{ fontSize: 32, color: card.color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5 }}>
                        {card.title}
                      </Typography>
                      <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1a1f36', mb: 0.5 }}>
                        {card.value}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#a0aec0' }}>
                        {card.subtitle}
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ color: '#cbd5e0' }} />
                  </Paper>
                ))}
              </Box>

              {/* Recent Activity Grid */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                gap: 3
              }}>
                {/* Pending Withdrawals */}
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, color: '#1a1f36' }}>
                      Pending Withdrawals
                    </Typography>
                    <Chip 
                      label={recentWithdrawals.length} 
                      size="small" 
                      sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600 }}
                    />
                  </Box>
                  {recentWithdrawals.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AccountBalanceIcon sx={{ fontSize: 48, color: '#cbd5e0', mb: 1 }} />
                      <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                        No pending withdrawals
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {recentWithdrawals.map((withdrawal) => (
                        <Box
                          key={withdrawal._id}
                          onClick={() => navigate('/admin/reports')}
                          sx={{
                            p: 2,
                            bgcolor: '#f7fafc',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#edf2f7',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                              {withdrawal.userId?.name || 'Unknown User'}
                            </Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                              Rp {withdrawal.amount?.toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 12, color: '#6c757d' }}>
                            {withdrawal.bankName} - {withdrawal.accountNumber}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>

                {/* Recent Campaigns */}
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, color: '#1a1f36' }}>
                      Recent Campaigns
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/admin/campaigns')}
                      sx={{ textTransform: 'none', color: '#667eea' }}
                    >
                      View All
                    </Button>
                  </Box>
                  {recentCampaigns.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CampaignIcon sx={{ fontSize: 48, color: '#cbd5e0', mb: 1 }} />
                      <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                        No campaigns yet
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {recentCampaigns.map((campaign) => (
                        <Box
                          key={campaign._id}
                          onClick={() => navigate('/admin/campaigns')}
                          sx={{
                            p: 2,
                            bgcolor: '#f7fafc',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: '#edf2f7',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1f36', flex: 1 }}>
                              {campaign.title}
                            </Typography>
                            <Chip
                              label={campaign.status}
                              size="small"
                              sx={{
                                fontSize: 11,
                                height: 20,
                                bgcolor: campaign.status === 'active' ? '#d1fae5' : '#fee2e2',
                                color: campaign.status === 'active' ? '#065f46' : '#991b1b'
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: 12, color: '#6c757d' }}>
                            Budget: Rp {campaign.budget?.toLocaleString('id-ID')}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>

                {/* Recent Users */}
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, color: '#1a1f36' }}>
                      Recent Users
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/admin/users')}
                      sx={{ textTransform: 'none', color: '#667eea' }}
                    >
                      View All
                    </Button>
                  </Box>
                  {recentUsers.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <PeopleIcon sx={{ fontSize: 48, color: '#cbd5e0', mb: 1 }} />
                      <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                        No users registered yet
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {recentUsers.map((user) => (
                        <Box
                          key={user._id}
                          onClick={() => navigate('/admin/users')}
                          sx={{
                            p: 2,
                            bgcolor: '#f7fafc',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': {
                              bgcolor: '#edf2f7',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: user.role === 'student' ? '#dbeafe' : '#fce7f3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {user.role === 'student' ? (
                              <StudentIcon sx={{ fontSize: 20, color: '#1e40af' }} />
                            ) : (
                              <CompanyIcon sx={{ fontSize: 20, color: '#9f1239' }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                              {user.name}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#6c757d' }}>
                              {user.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              fontSize: 11,
                              height: 20,
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>

                {/* Platform Overview */}
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, color: '#1a1f36', mb: 2 }}>
                    Platform Overview
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />
                        <Typography sx={{ fontSize: 14, color: '#6c757d' }}>
                          Active Users
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1f36' }}>
                        {stats.totalUsers}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CampaignIcon sx={{ fontSize: 20, color: '#667eea' }} />
                        <Typography sx={{ fontSize: 14, color: '#6c757d' }}>
                          Running Campaigns
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1f36' }}>
                        {stats.activeCampaigns}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                        <Typography sx={{ fontSize: 14, color: '#6c757d' }}>
                          Total Transactions
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1f36' }}>
                        {stats.totalTransactions}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                        <Typography sx={{ fontSize: 14, color: '#6c757d' }}>
                          Platform Revenue
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1f36' }}>
                        Rp {stats.totalRevenue?.toLocaleString('id-ID') || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
