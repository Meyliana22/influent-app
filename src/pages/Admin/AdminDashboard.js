import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { COLORS } from '../../constants/colors';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCampaigns: 0,
    pendingReview: 0,
    reportsFiled: 0
  });

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
      icon: '👥',
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns,
      icon: '📢',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: '⏳',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: '3 new',
      changeType: 'neutral'
    },
    {
      title: 'Reports Filed',
      value: stats.reportsFiled,
      icon: '⚠️',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      change: '1 new',
      changeType: 'negative'
    }
  ];

  const recentActivities = [
    { action: 'New campaign created', user: 'Scarlett Beauty', time: '5 min ago', icon: '📢', color: '#667eea' },
    { action: 'User registered', user: '@beautyguru', time: '15 min ago', icon: '👤', color: '#10b981' },
    { action: 'Campaign completed', user: 'Gaming Pro Campaign', time: '1 hour ago', icon: '✅', color: '#10b981' },
    { action: 'Report submitted', user: 'Campaign #1234', time: '2 hours ago', icon: '⚠️', color: '#ef4444' },
    { action: 'Payment processed', user: 'Rp 5.000.000', time: '3 hours ago', icon: '💰', color: '#f59e0b' }
  ];

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
              Dashboard Overview
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#6c757d',
              fontFamily: "'Inter', sans-serif"
            }}>
              Welcome back! Here's what's happening with your platform today.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {statCards.map((card, index) => (
              <div
                key={index}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#6c757d',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {card.title}
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: '#1a1f36',
                      marginBottom: '8px',
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {card.value}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: card.changeType === 'positive' ? '#10b981' : card.changeType === 'negative' ? '#ef4444' : '#6c757d',
                      fontWeight: 600
                    }}>
                      {card.change}
                    </div>
                  </div>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem'
                  }}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div style={{
            gap: '24px'
          }}>
            {/* Recent Activities */}
            <div style={{
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
                Recent Activities
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: '#f7fafc',
                      borderRadius: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f7fafc'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: activity.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#1a1f36',
                        marginBottom: '4px',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {activity.action}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#6c757d'
                      }}>
                        {activity.user}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#6c757d',
                      whiteSpace: 'nowrap'
                    }}>
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                      fontWeight: 600,
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
