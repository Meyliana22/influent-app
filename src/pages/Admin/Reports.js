import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors';
import PaymentIcon from '@mui/icons-material/Payment';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { PieChart, LineChart, BarChart } from '@mui/x-charts';
import { Box, Typography } from '@mui/material';
import { Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';

function Reports() {
  const [campaigns, setCampaigns] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    activeCampaigns: 0,
    totalInfluencers: 0,
    successRate: 0
  });

  useEffect(() => {
    loadData();
    generateMockReports();
  }, []);

  const loadData = () => {
    const campaignsData = JSON.parse(localStorage.getItem('campaigns') || '[]');
    const applicantsData = JSON.parse(localStorage.getItem('applicants') || '[]');
    
    setCampaigns(campaignsData);

    // Calculate analytics
    const totalRevenue = campaignsData.reduce((sum, c) => sum + (c.total_budget || 0), 0);
    const activeCampaigns = campaignsData.filter(c => c.status === 'Active').length;
    const uniqueInfluencers = new Set(applicantsData.map(a => a.name)).size;
    const completedCampaigns = campaignsData.filter(c => c.status === 'Completed').length;
    const successRate = campaignsData.length > 0 ? (completedCampaigns / campaignsData.length * 100).toFixed(1) : 0;

    setAnalytics({
      totalRevenue,
      activeCampaigns,
      totalInfluencers: uniqueInfluencers,
      successRate
    });
  };

  const generateMockReports = () => {
    const mockReports = [
      {
        id: 1,
        campaignName: 'Summer Beauty Campaign',
        reportedBy: 'Sarah Johnson',
        reason: 'Influencer tidak memposting konten',
        status: 'Tertunda',
        date: '2024-01-15'
      },
      {
        id: 2,
        campaignName: 'Gaming Gear Promo',
        reportedBy: 'Mike Chen',
        reason: 'Masalah pembayaran',
        status: 'Selesai',
        date: '2024-01-14'
      },
      {
        id: 3,
        campaignName: 'Food Festival Event',
        reportedBy: 'Jessica Lee',
        reason: 'Persyaratan kampanye tidak jelas',
        status: 'Sedang Ditinjau',
        date: '2024-01-13'
      },
      {
        id: 4,
        campaignName: 'Tech Launch Event',
        reportedBy: 'Admin User',
        reason: 'Aplikasi spam terdeteksi',
        status: 'Selesai',
        date: '2024-01-12'
      }
    ];
    setReports(mockReports);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selesai':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'Tertunda':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'Sedang Ditinjau':
        return { bg: '#dbeafe', color: '#1e40af' };
      default:
        return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  const filteredReports = filterStatus === 'All' 
    ? reports 
    : reports.filter(r => r.status === filterStatus);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1000);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1000;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box sx={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ 
          marginLeft: !isMobile ? '260px' : 0, 
          width: !isMobile ? 'calc(100% - 260px)' : '100%',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
      }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ mt: 9, p: 4 }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontFamily: "'Inter', sans-serif", fontSize: 32 }}>
              Laporan & Analitik
            </Typography>
            <Typography sx={{ fontSize: 16, color: '#6c757d', fontFamily: "'Inter', sans-serif" }}>
              Pantau performa platform dan tinjau laporan masalah
            </Typography>
          </Box>

          {/* Stats Overview */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(25ch, 1fr))',
            gap: 2.5,
            mb: 4
          }}>
            {[
              {
                title: 'Total Pendapatan',
                value: `Rp ${analytics.totalRevenue.toLocaleString('id-ID')}`,
                IconComponent: PaymentIcon,
                color: '#10b981',
                bgColor: '#d1fae5'
              },
              {
                title: 'Kampanye Aktif',
                value: analytics.activeCampaigns,
                IconComponent: CampaignIcon,
                color: '#3b82f6',
                bgColor: '#dbeafe'
              },
              {
                title: 'Total Influencer',
                value: analytics.totalInfluencers,
                IconComponent: PeopleIcon,
                color: '#8b5cf6',
                bgColor: '#ede9fe'
              },
              {
                title: 'Tingkat Keberhasilan',
                value: `${analytics.successRate}%`,
                IconComponent: TrendingUpIcon,
                color: '#f59e0b',
                bgColor: '#fef3c7'
              }
            ].map((card, index) => (
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
                  minWidth: 48,
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: card.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <card.IconComponent sx={{ fontSize: 28, color: card.color }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, color: '#6c757d', mb: '4px', fontFamily: "'Inter', sans-serif" }}>
                    {card.title}
                  </Typography>
                  <Typography sx={{ fontSize: 25, fontWeight: 700, color: '#1a1f36', fontFamily: "'Inter', sans-serif" }}>
                    {card.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Chart 1: Campaigns per Month */}
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              p: 3,
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1f36',
                mb: 2.5,
                fontFamily: "'Inter', sans-serif"
              }}>
                Kampanye per Bulan
              </Typography>
              <BarChart
                xAxis={[{
                  id: 'months',
                  data: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                  scaleType: 'band',
                  label: 'Bulan',
                }]}
                series={[{
                  data: [65, 80, 45, 90, 75, 100],
                  // color: COLORS.gradientPrimary ? undefined : '#6E00BE',
                  color: '#6E00BE',
                  label: 'Kampanye',
                }]}
                height={220}
                sx={{
                  mb: 1,
                  '--ChartsLegend-rootOffsetY': '8px',
                  '--ChartsLegend-rootOffsetX': '8px',
                  '--ChartsAxis-labelFontSize': '12px',
                  '--ChartsAxis-tickLabelFontSize': '12px',
                  '--ChartsLegend-labelFontSize': '13px',
                  fontFamily: 'Inter, sans-serif',
                  pr: 4.5
                }}
                margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                grid={{ horizontal: true }}
              />
            </Box>

            {/* Chart 2: User Growth */}
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              p: 3,
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1f36',
                mb: 2.5,
                fontFamily: "'Inter', sans-serif"
              }}>
                Pengguna Baru per Minggu
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f7fafc', borderRadius: 3, p: 2.5 }}>
                <LineChart
                  height={200}
                  width={320}
                  series={[{ data: [15, 30, 45, 35, 60, 80], color: '#6E00BE', label: 'Pengguna' }]}
                  xAxis={[{ scaleType: 'point', data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'] }]}
                  sx={{ pr: 3.5 }}
                />
              </Box>
            </Box>

            {/* Chart 3: Campaign Status Distribution */}
            <Box sx={{
              background: '#fff',
              borderRadius: 4,
              p: 3,
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1f36',
                mb: 2.5,
                fontFamily: "'Inter', sans-serif"
              }}>
                Status Kampanye
              </Typography>
              <Box sx={{
                height: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <PieChart
                  series={[{
                    data: [
                      { id: 0, value: 50, label: 'Aktif', color: '#10b981' },
                      { id: 1, value: 25, label: 'Tertunda', color: '#f59e0b' },
                      { id: 2, value: 25, label: 'Selesai', color: '#3b82f6' }
                    ],
                    innerRadius: 60,
                    outerRadius: 80,
                    paddingAngle: 2,
                    cornerRadius: 6,
                  }]
                  }
                  width={180}
                  height={180}
                  legend={{ hidden: true }}
                />
                <Box sx={{
                  position: 'absolute',
                  textAlign: 'center',
                  left: 0,
                  right: 100,
                  mx: 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}>
                  <Typography sx={{ fontSize: 25, fontWeight: 700, color: '#1a1f36' }}>
                    {campaigns.length}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#6c757d' }}>
                    Total
                  </Typography>
                </Box>
              </Box>
            </Box>
          </div>

          {/* Problem Reports Table */}
          <Box sx={{
            background: '#fff',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <Box sx={{
              p: 3,
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700, color: '#1a1f36', fontFamily: "'Inter', sans-serif" }}>
                Laporan Masalah
              </Typography>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                variant="outlined"
                sx={{ minWidth: 140, fontFamily: "'Inter', sans-serif", fontSize: 14, borderRadius: 2 }}
              >
                <MenuItem value="All">Semua Status</MenuItem>
                <MenuItem value="Pending">Tertunda</MenuItem>
                <MenuItem value="In Review">Sedang Ditinjau</MenuItem>
                <MenuItem value="Resolved">Selesai</MenuItem>
              </Select>
            </Box>
            <Table sx={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
              <TableHead>
                <TableRow sx={{ background: '#f7fafc' }}>
                  <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>ID</TableCell>
                  <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Kampanye</TableCell>
                  <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Dilaporkan Oleh</TableCell>
                  <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Alasan</TableCell>
                  <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Status</TableCell>
                  <TableCell sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Tanggal</TableCell>
                  <TableCell sx={{ px: 3, py: 2, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => {
                  const statusStyle = getStatusColor(report.status);
                  return (
                    <TableRow key={report.id} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                      <TableCell sx={{ px: 3, py: 2, fontSize: 14, color: '#2d3748' }}>#{report.id}</TableCell>
                      <TableCell sx={{ px: 3, py: 2, fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>{report.campaignName}</TableCell>
                      <TableCell sx={{ px: 3, py: 2, fontSize: 14, color: '#6c757d' }}>{report.reportedBy}</TableCell>
                      <TableCell sx={{ px: 3, py: 2, fontSize: 14, color: '#6c757d' }}>{report.reason}</TableCell>
                      <TableCell sx={{ px: 3, py: 2 }}>
                        <Box component="span" sx={{
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          fontSize: 13,
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          display: 'inline-block'
                        }}>
                          {report.status}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: 3, py: 2, fontSize: 14, color: '#6c757d' }}>{report.date}</TableCell>
                      <TableCell sx={{ px: 3, py: 2, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          sx={{
                            px: 2,
                            py: 0.5,
                            bgcolor: '#6E00BE',
                            borderRadius: 2.5,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#5a009e' }
                          }}
                        >
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Reports;
