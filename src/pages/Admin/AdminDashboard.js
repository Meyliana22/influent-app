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
  PeopleAltOutlined as PeopleIcon,
  CampaignOutlined as CampaignIcon,
  AccountBalanceWalletOutlined as AccountBalanceIcon,
  PaidOutlined as AttachMoneyIcon,
  TrendingUpOutlined as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  SchoolOutlined as StudentIcon,
  BusinessOutlined as CompanyIcon,
  PersonOutline as PersonIcon,
  CheckCircleOutline as CheckCircleIcon,
  ReportProblemOutlined as WarningIcon,
  CreditCardOutlined as PaymentIcon
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

  const translateStatus = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Selesai';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      case 'draft': return 'Draf';
      case 'pending_payment': return 'Menunggu Pembayaran';
      case 'admin_review': return 'Ditinjau Admin';
      case 'cancelled': return 'Dibatalkan';
      case 'paid': return 'Dibayar';
      default: return status;
    }
  };

  const translateRole = (role) => {
    switch (role) {
      case 'student': return 'Mahasiswa';
      case 'company': return 'UMKM';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      subtitle: `${stats.totalStudents} Mahasiswa, ${stats.totalCompanies} UMKM`,
      IconComponent: PeopleIcon,
      color: '#6E00BE',
      bgColor: '#F3E5F5',
      path: '/admin/users'
    },
    {
      title: 'Total Kampanye',
      value: stats.totalCampaigns,
      subtitle: `${stats.activeCampaigns} Aktif, ${stats.completedCampaigns} Selesai`,
      IconComponent: CampaignIcon,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      path: '/admin/campaigns'
    },
    {
      title: 'Penarikan Tertunda',
      value: stats.pendingWithdrawals,
      subtitle: `${stats.totalWithdrawals} Total Permintaan`,
      IconComponent: AccountBalanceIcon,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      path: '/admin/manage-withdrawals'
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue?.toLocaleString('id-ID') || 0}`,
      subtitle: `${stats.totalTransactions} Transaksi`,
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
                Selamat Datang, {userName}!
              </Typography>
              <Typography sx={{
                fontSize: 16,
                color: '#6c757d'
              }}>
                Berikut adalah ringkasan platform Anda hari ini.
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
                borderColor: '#6E00BE',
                color: '#6E00BE',
                '&:hover': {
                  borderColor: '#5a009e',
                  backgroundColor: 'rgba(110, 0, 190, 0.04)'
                }
              }}
            >
              Muat Ulang
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Stats Cards */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 3,
                mb: 4
              }}>
                {statCards.map((stat, index) => {
                  const Icon = stat.IconComponent;
                  return (
                    <Box
                      key={index}
                      onClick={() => navigate(stat.path)}
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
                        <Icon sx={{ fontSize: 25, color: stat.color }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5, fontFamily: "'Inter', sans-serif" }}>
                          {stat.title}
                        </Typography>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36', fontFamily: "'Inter', sans-serif" }}>
                          {stat.value}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#a0aec0', fontFamily: "'Inter', sans-serif" }}>
                          {stat.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
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
                      Penarikan Tertunda
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
                        Tidak ada penarikan tertunda
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
                      Kampanye Terbaru
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/admin/campaigns')}
                      sx={{ textTransform: 'none', color: '#6E00BE' }}
                    >
                      Lihat Semua
                    </Button>
                  </Box>
                  {recentCampaigns.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CampaignIcon sx={{ fontSize: 48, color: '#cbd5e0', mb: 1 }} />
                      <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                        Belum ada kampanye
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
                              label={translateStatus(campaign.status)}
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
                            Anggaran: Rp {campaign.budget?.toLocaleString('id-ID')}
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
                      Pengguna Terbaru
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/admin/users')}
                      sx={{ textTransform: 'none', color: '#6E00BE' }}
                    >
                      Lihat Semua
                    </Button>
                  </Box>
                  {recentUsers.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <PeopleIcon sx={{ fontSize: 48, color: '#cbd5e0', mb: 1 }} />
                      <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                        Belum ada pengguna terdaftar
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
                            label={translateRole(user.role)}
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
                    Ringkasan Platform
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />
                        <Typography sx={{ fontSize: 14, color: '#6c757d' }}>
                          Pengguna Aktif
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
                          Kampanye Berjalan
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
                          Total Transaksi
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
                          Pendapatan Platform
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
