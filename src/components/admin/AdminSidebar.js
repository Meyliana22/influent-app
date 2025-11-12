import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import logoIcon from '../../assets/logoIcon.svg';

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { path: '/admin/users', icon: PeopleIcon, label: 'Manage Users' },
    { path: '/admin/campaigns', icon: CampaignIcon, label: 'Manage Campaigns' },
    { path: '/admin/reports', icon: BarChartIcon, label: 'Reports' },
    { path: '/chat', icon: ChatIcon, label: 'Chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      width: '260px',
      minHeight: '100vh',
      background: '#1a1f36',
      padding: '24px 0',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: COLORS.gradient,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src={logoIcon} 
              alt="Influent Logo" 
              style={{ 
                width: '24px', 
                height: '24px',
                objectFit: 'contain'
              }} 
            />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#fff',
              fontFamily: "'Inter', sans-serif"
            }}>
              Influent
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 500
            }}>
              Admin Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: '24px 0' }}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              width: '100%',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isActive(item.path) 
                ? 'rgba(102, 126, 234, 0.15)' 
                : 'transparent',
              border: 'none',
              borderLeft: isActive(item.path) 
                ? '3px solid #667eea' 
                : '3px solid transparent',
              color: isActive(item.path) 
                ? '#fff' 
                : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: isActive(item.path) ? 600 : 500,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.background = 'transparent';
                e.target.style.color = 'rgba(255,255,255,0.7)';
              }
            }}
          >
            <item.icon 
              sx={{
                fontSize: 22,
                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.7)'
              }}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Section */}
      {/* <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        right: '24px',
        padding: '16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '4px'
        }}>
          Version
        </div>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#fff'
        }}>
          v1.0.0
        </div>
      </div> */}
    </div>
  );
}

export default AdminSidebar;
