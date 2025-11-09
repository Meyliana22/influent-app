import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors.js';
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
      iconColor: '#ca8a04', // Darker yellow to match light yellow background
      description: 'Successfully finished'
    },
    {
      title: 'Total Applicants',
      value: stats.totalApplicants,
      IconComponent: ApplicantIcon,
      bgColor: '#f9e9ffff',
      iconColor: '#7c3aed', // Darker purple to match light purple background
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
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <UMKMSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ 
        marginLeft: !isMobile ? '260px' : '0',
        width: !isMobile ? 'calc(100% - 260px)' : '100%',
        transition: 'all 0.3s ease'
      }}>
        <UMKMTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div style={{ marginTop: '72px', padding: '32px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1a1f36',
              margin: '0px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Dashboard Overview
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#6c757d',
              fontFamily: "'Inter', sans-serif"
            }}>
              Welcome back! Here's what's happening with your campaigns today.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {statCards.map((card, index) => (
              <div
                key={index}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
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
                    justifyContent: 'center'
                  }}>
                    <card.IconComponent 
                      sx={{ 
                        fontSize: 32,
                        color: card.iconColor
                      }} 
                    />
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
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#1a1f36',
                  marginBottom: '4px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {card.value}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6c757d',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {card.description}
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout - Responsive */}
          <div style={{
            // display: 'grid',
            // gridTemplateColumns: !isMobile ? '2fr 1fr' : '1fr',
            gap: '24px'
          }}>
            {/* Recent Campaigns */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1a1f36',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Recent Campaigns
                </h3>
                <button
                  onClick={() => navigate('/campaigns')}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '2px solid #667eea',
                    borderRadius: '10px',
                    color: '#667eea',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#667eea';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#667eea';
                  }}
                >
                  View All
                </button>
              </div>

              {recentCampaigns.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  <CampaignIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                    No campaigns yet
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                    Create your first campaign to get started
                  </div>
                  <button
                    onClick={() => navigate('/campaign-create')}
                    style={{
                      padding: '12px 24px',
                      background: COLORS.primary,
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    Create Campaign
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentCampaigns.map((campaign, index) => (
                    <div
                      key={campaign.campaign_id || index}
                      onClick={() => navigate(`/campaign/${campaign.campaign_id}/detail`)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f7fafc';
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#1a1f36',
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {campaign.title || 'Untitled Campaign'}
                        </div>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: campaign.status === 'active' ? '#d1fae5' : campaign.status === 'inactive' ? '#e2e8f0' : '#fff',
                          color: campaign.status === 'active' ? '#065f46' : campaign.status === 'inactive' ? '#6c757d' : '#000'
                        }}>
                          {campaign.status === 'active' ? 'Active' : campaign.status === 'inactive' ? 'Inactive' : campaign.status}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#6c757d',
                        marginBottom: '8px',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {campaign.product_desc?.substring(0, 80) || 'No description'}...
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '0.8rem',
                        color: '#6c757d',
                        alignItems: 'center',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AttachMoneyIcon sx={{ fontSize: 16, color: '#6c757d' }} /> 
                          Rp {(campaign.price_per_post || 0).toLocaleString('id-ID')}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ApplicantIcon sx={{ fontSize: 16, color: '#6c757d' }} /> 
                          {campaign.influencer_count || 0} influencers
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activities & Quick Actions */}
            {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  Recent Activities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f7fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${activity.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0
                      }}>
                        <activity.IconComponent sx={{ fontSize: 20, color: activity.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#1a1f36',
                          marginBottom: '4px',
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {activity.title}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#6c757d',
                          marginBottom: '4px',
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {activity.description}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#a0aec0',
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UMKMDashboard;
