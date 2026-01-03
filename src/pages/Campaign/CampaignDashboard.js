import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../../components/common';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import campaignService from '../../services/campaignService';
import { BarChart3, Clock, Users, DollarSign } from 'lucide-react';

// Enhanced Status Badge
const getStatusConfig = (status) => {
  const normalizedStatus = status?.toLowerCase() || 'draft';
  const configs = {
    'active': {
      label: 'Aktif',
      color: '#059669',
      bgColor: '#d1fae5',
      borderColor: '#34d399'
    },
    'completed': {
      label: 'Selesai',
      color: '#6E00BE', // Primary
      bgColor: '#F3E5F5',
      borderColor: '#d8b4fe'
    },
    'pending_payment': {
      label: 'Menunggu Pembayaran',
      color: '#2563eb',
      bgColor: '#dbeafe',
      borderColor: '#60a5fa'
    },
    'admin_review': {
      label: 'Review Admin',
      color: '#d97706',
      bgColor: '#fef3c7',
      borderColor: '#fcd34d'
    },
    'draft': {
      label: 'Draft',
      color: '#4b5563',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db'
    },
    'cancelled': {
      label: 'Dibatalkan',
      color: '#dc2626',
      bgColor: '#fee2e2',
      borderColor: '#f87171'
    }
  };
  return configs[normalizedStatus] || configs['draft'];
};

function CampaignDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
  const [stats, setStats] = useState({
    ongoingCampaigns: 0,
    totalSpendThisMonth: 0,
    influencersEngaged: 0,
    completedCampaigns: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user name
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Partner';

  useEffect(() => {
    loadDashboardData();
    const handleResize = () => setIsMobile(window.innerWidth <= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await campaignService.getCampaigns({ 
        limit: 100, 
        sort: 'created_at:desc' 
      });

      let campaigns = [];
      if (Array.isArray(response)) {
        campaigns = response;
      } else if (response?.data && Array.isArray(response.data)) {
        campaigns = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        campaigns = response.data.data;
      }

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const ongoing = campaigns.filter(c => c.status === 'active').length;
      const completed = campaigns.filter(c => c.status === 'completed').length;
      
      const engaged = campaigns.reduce((acc, c) => {
        if (['active', 'completed'].includes(c.status)) {
           return acc + (parseInt(c.influencer_count) || 0);
        }
        return acc;
      }, 0);

      const spend = campaigns.reduce((acc, c) => {
        const cDate = new Date(c.created_at);
        if (cDate.getMonth() === currentMonth && cDate.getFullYear() === currentYear) {
           const est = (parseInt(c.price_per_post) || 0) * (parseInt(c.influencer_count) || 0);
           return acc + est;
        }
        return acc;
      }, 0);

      setStats({
        ongoingCampaigns: ongoing,
        totalSpendThisMonth: spend,
        influencersEngaged: engaged,
        completedCampaigns: completed
      });

      setRecentCampaigns(campaigns.slice(0, 4));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Kampanye Berjalan',
      value: stats.ongoingCampaigns,
      IconComponent: TrendingUpIcon,
      color: '#6E00BE', // Primary
      bgColor: '#F3E5F5',
      description: 'Sedang aktif saat ini'
    },
    {
      title: 'Total Pengeluaran (Bln Ini)',
      value: `Rp ${stats.totalSpendThisMonth.toLocaleString('id-ID')}`,
      IconComponent: AttachMoneyIcon,
      color: '#059669', // Green
      bgColor: '#d1fae5',
      description: 'Estimasi budget bulan ini'
    },
    {
      title: 'Influencer Terlibat',
      value: stats.influencersEngaged,
      IconComponent: PeopleOutlineIcon,
      color: '#ea580c', // Orange
      bgColor: '#ffedd5',
      description: 'Total kolaborator'
    },
    {
      title: 'Kampanye Selesai',
      value: stats.completedCampaigns,
      IconComponent: CheckCircleOutlineIcon,
      color: '#2563eb', // Blue
      bgColor: '#dbeafe',
      description: 'Berhasil diselesaikan'
    }
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box sx={{ 
        marginLeft: !isMobile ? '260px' : '0',
        width: !isMobile ? 'calc(100% - 260px)' : '100%',
        transition: 'all 0.3s ease'
      }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <Container maxWidth="xl" sx={{ pt: '100px', pb: 4, px: { xs: 2, md: 4 } }}>
          
          {/* Welcome Section */}
          <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, letterSpacing: '-0.5px' }}>
                Halo, {userName} 👋
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Pantau performa kampanye dan kelola kolaborasi Anda hari ini.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/campaign-create')}
              sx={{
                bgcolor: '#6E00BE', // Solid Color
                color: '#fff',
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                   bgcolor: '#5a009e',
                   boxShadow: 'none'
                }
              }}
            >
              Buat Kampanye Baru
            </Button>
          </Box>

          {/* Stats Grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2.5,
            mb: 5
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
                      {stat.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Recent Campaigns Section */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Aktifitas Terbaru
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/campaigns')}
                sx={{ 
                  color: '#6366f1', 
                  textTransform: 'none', 
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#e0e7ff' }
                }}
              >
                Lihat Semua
              </Button>
            </Box>

            {loading ? (
               <Typography sx={{ textAlign: 'center', color: '#94a3b8', py: 4 }}>Memuat data...</Typography>
            ) : recentCampaigns.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '20px', border: '1px dashed #e2e8f0', bgcolor: '#f8fafc' }}>
                <Box sx={{ mb: 2, display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: '#e0e7ff', color: '#6366f1' }}>
                  <CampaignIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>Belum ada kampanye</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                  Mulai perjalanan Anda dengan membuat kampanye pertama.
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/campaign-create')} sx={{ borderRadius: '10px' }}>
                  Buat Kampanye
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {recentCampaigns.map((campaign) => {
                   const status = getStatusConfig(campaign.status);
                   return (
                    <Paper
                      key={campaign.campaign_id}
                      onClick={() => navigate(`/campaign/${campaign.campaign_id}/detail`)}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#667eea',
                          bgcolor: '#f8fafc'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={5}>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                variant="rounded" 
                                src={campaign.banner_image || ''}
                                sx={{ 
                                  width: 56, 
                                  height: 56, 
                                  bgcolor: status.bgColor,
                                  color: status.color 
                                }}
                              >
                                <CampaignIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2, mb: 0.5 }}>
                                  {campaign.title}
                                </Typography>
                                <Chip 
                                  label={status.label} 
                                  size="small"
                                  sx={{ 
                                    height: 24,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    bgcolor: status.bgColor,
                                    color: status.color,
                                    border: `1px solid ${status.borderColor}`
                                  }} 
                                />
                              </Box>
                           </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3} md={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                            <Users size={16} />
                            <Typography variant="body2" fontWeight={500}>
                              {campaign.influencer_count || 0} Infl.
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3} md={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                             <DollarSign size={16} />
                             <Typography variant="body2" fontWeight={500}>
                               Rp {(parseInt(campaign.price_per_post) || 0).toLocaleString('id-ID')}
                             </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
                           <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Clock size={14} /> 
                             {new Date(campaign.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                   );
                })}
              </Stack>
            )}
          </Box>

        </Container>
      </Box>
    </Box>
  );
}

export default CampaignDashboard;
