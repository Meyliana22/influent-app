import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/AddCircleOutline';
import TransactionsIcon from '@mui/icons-material/Payment';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationIcon from '@mui/icons-material/Notifications';
import ProfileIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import logoIcon from '../../assets/logoIcon.svg';

import { COLORS } from '../../constants/colors';

function UMKMSidebar({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/umkm/dashboard' },
    { icon: ListIcon, label: 'My Campaigns', path: '/campaigns' },
    { icon: TransactionsIcon, label: 'Transactions', path: '/transactions' },
    { icon: ChatIcon, label: 'Chat', path: '/chat' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only close when pathname changes, not when isMobile changes

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '260px',
        height: '100vh',
        background: '#1a1f36',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        fontFamily: "'Inter', sans-serif",
        transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out'
      }}>
      {/* Logo Section */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            ✕
          </button>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
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
            <img 
              src={logoIcon} 
              alt="Influent Logo"
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain'
              }}
            />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.5px'
            }}>
              Influent
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 500
            }}>
              UMKM Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{
        flex: 1,
        padding: '16px 0',
        overflowY: 'auto'
      }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            style={{
              margin: '4px 12px',
              padding: '12px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isActive(item.path) 
                ? 'rgba(102,126,234,0.15)' 
                : 'transparent',
              borderLeft: isActive(item.path) 
                ? '3px solid #667eea' 
                : '3px solid transparent',
              color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.7)'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }
            }}
          >
            <item.icon 
              sx={{
                fontSize: 22,
                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.7)'
              }}
            />
            <span style={{
              fontSize: '0.95rem',
              fontWeight: isActive(item.path) ? 600 : 500
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      {/* <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          padding: '12px',
          background: 'rgba(102,126,234,0.1)',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 500
          }}>
            Version 1.0.0
          </div>
        </div>
      </div> */}
      </div>
    </>
  );
}

export default UMKMSidebar;
