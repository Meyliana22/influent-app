import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { COLORS } from '../../constants/colors';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
        reason: 'Influencer not posting content',
        status: 'Pending',
        date: '2024-01-15'
      },
      {
        id: 2,
        campaignName: 'Gaming Gear Promo',
        reportedBy: 'Mike Chen',
        reason: 'Payment issue',
        status: 'Resolved',
        date: '2024-01-14'
      },
      {
        id: 3,
        campaignName: 'Food Festival Event',
        reportedBy: 'Jessica Lee',
        reason: 'Campaign requirements unclear',
        status: 'In Review',
        date: '2024-01-13'
      },
      {
        id: 4,
        campaignName: 'Tech Launch Event',
        reportedBy: 'Admin User',
        reason: 'Spam application detected',
        status: 'Resolved',
        date: '2024-01-12'
      }
    ];
    setReports(mockReports);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'Pending':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'In Review':
        return { bg: '#dbeafe', color: '#1e40af' };
      default:
        return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  const filteredReports = filterStatus === 'All' 
    ? reports 
    : reports.filter(r => r.status === filterStatus);

  return (
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <AdminSidebar />
      
      <div style={{ marginLeft: '260px', width: 'calc(100% - 260px)' }}>
        <AdminTopbar />
        
        <div style={{ marginTop: '72px', padding: '32px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1a1f36',
              marginBottom: '8px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Reports & Analytics
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#6c757d',
              fontFamily: "'Inter', sans-serif"
            }}>
              Monitor platform performance and review problem reports
            </p>
          </div>

          {/* Analytics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {[
              {
                title: 'Total Revenue',
                value: `Rp ${analytics.totalRevenue.toLocaleString('id-ID')}`,
                IconComponent: AttachMoneyIcon,
                color: '#10b981',
                bgColor: '#d1fae5'
              },
              {
                title: 'Active Campaigns',
                value: analytics.activeCampaigns,
                IconComponent: CampaignIcon,
                color: '#3b82f6',
                bgColor: '#dbeafe'
              },
              {
                title: 'Total Influencers',
                value: analytics.totalInfluencers,
                IconComponent: PeopleIcon,
                color: '#8b5cf6',
                bgColor: '#ede9fe'
              },
              {
                title: 'Success Rate',
                value: `${analytics.successRate}%`,
                IconComponent: TrendingUpIcon,
                color: '#f59e0b',
                bgColor: '#fef3c7'
              }
            ].map((card, index) => (
              <div
                key={index}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    <card.IconComponent sx={{ fontSize: 28, color: card.color }} />
                  </div>
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1a1f36',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Chart 1: Campaigns per Month */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1a1f36',
                marginBottom: '20px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Campaigns per Month
              </h3>
              <div style={{
                height: '200px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '12px',
                padding: '20px 0'
              }}>
                {[65, 80, 45, 90, 75, 100].map((height, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      background: `linear-gradient(135deg, ${COLORS.gradient})`,
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#fff'
                    }}
                  >
                    {Math.floor(height / 10)}
                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
                fontSize: '0.75rem',
                color: '#6c757d',
                fontFamily: "'Inter', sans-serif"
              }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                  <div key={i}>{month}</div>
                ))}
              </div>
            </div>

            {/* Chart 2: User Growth */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1a1f36',
                marginBottom: '20px',
                fontFamily: "'Inter', sans-serif"
              }}>
                New Users per Week
              </h3>
              <div style={{
                height: '200px',
                background: '#f7fafc',
                borderRadius: '12px',
                padding: '20px',
                position: 'relative'
              }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <polyline
                    points="10,150 70,120 130,90 190,110 250,60 310,40"
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="3"
                  />
                  {[10, 70, 130, 190, 250, 310].map((x, i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={[150, 120, 90, 110, 60, 40][i]}
                      r="5"
                      fill="#667eea"
                    />
                  ))}
                </svg>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
                fontSize: '0.75rem',
                color: '#6c757d',
                fontFamily: "'Inter', sans-serif"
              }}>
                {['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((week, i) => (
                  <div key={i}>{week}</div>
                ))}
              </div>
            </div>

            {/* Chart 3: Campaign Status Distribution */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1a1f36',
                marginBottom: '20px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Campaign Status
              </h3>
              <div style={{
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Simple Donut Chart */}
                <svg width="160" height="160">
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="25"
                    strokeDasharray="188 377"
                    transform="rotate(-90 80 80)"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="25"
                    strokeDasharray="94 377"
                    strokeDashoffset="-188"
                    transform="rotate(-90 80 80)"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="25"
                    strokeDasharray="95 377"
                    strokeDashoffset="-282"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1a1f36'
                  }}>
                    {campaigns.length}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6c757d'
                  }}>
                    Total
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                {[
                  { label: 'Active', color: '#10b981', value: '50%' },
                  { label: 'Pending', color: '#f59e0b', value: '25%' },
                  { label: 'Completed', color: '#3b82f6', value: '25%' }
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '0.85rem',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: item.color
                      }} />
                      <span style={{ color: '#6c757d' }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#1a1f36' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Reports Table */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1a1f36',
                fontFamily: "'Inter', sans-serif"
              }}>
                Problem Reports
              </h3>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Inter', sans-serif"
            }}>
              <thead>
                <tr style={{ background: '#f7fafc' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Campaign</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Reported By</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Reason</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const statusStyle = getStatusColor(report.status);
                  return (
                    <tr
                      key={report.id}
                      style={{ borderBottom: '1px solid #e2e8f0' }}
                    >
                      <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#2d3748' }}>#{report.id}</td>
                      <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#1a1f36' }}>{report.campaignName}</td>
                      <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#6c757d' }}>{report.reportedBy}</td>
                      <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#6c757d' }}>{report.reason}</td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.color
                        }}>
                          {report.status}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#6c757d' }}>{report.date}</td>
                      <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                        <button
                          style={{
                            padding: '8px 16px',
                            background: '#667eea',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
