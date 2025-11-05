import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import dashboardIcon from '../../assets/sidebar/dashboard.svg';

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: dashboardIcon, label: 'Dashboard', isImage: true },
    { path: '/admin/users', icon: '👥', label: 'Manage Users' },
    { path: '/admin/campaigns', icon: '📢', label: 'Manage Campaigns' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    // { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
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
            width: '48px',
            height: '48px',
            background: COLORS.gradient,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🚀
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
            {item.isImage ? (
              <img 
                src={item.icon} 
                alt={item.label}
                style={{ 
                  width: '20px', 
                  height: '20px',
                  objectFit: 'contain',
                  filter: isActive(item.path) ? 'brightness(0) invert(1)' : 'brightness(0.7) invert(1)'
                }} 
              />
            ) : (
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
            )}
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
