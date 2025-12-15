import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import NotificationBell from '../common/NotificationBell';

function UMKMTopbar({ onMenuClick = () => {} }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'UMKM User';
  const userEmail = user.email || '';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/campaigns?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: !isMobile ? '260px' : '0',
      right: 1,
      height: '72px',
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 90,
      fontFamily: "'Inter', sans-serif",
      transition: 'left 0.3s ease-in-out'
    }}>
      {/* Hamburger Menu - Mobile Only */}
      <button
        onClick={onMenuClick}
        style={{
          display: isMobile ? 'flex' : 'none',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: 'none',
          background: '#f7fafc',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          transition: 'all 0.2s',
          color: '#1a1f36'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e2e8f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f7fafc';
        }}
      >
        ☰
      </button>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
        {/* Notification Bell with Dropdown */}
        <NotificationBell />

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: showDropdown ? '#f7fafc' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!showDropdown) e.currentTarget.style.background = '#f7fafc';
            }}
            onMouseLeave={(e) => {
              if (!showDropdown) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#fff'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#2d3748'
              }}>
                {userName}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6c757d'
              }}>
                UMKM Account
              </div>
            </div>
            <span style={{
              fontSize: '0.75rem',
              color: '#6c757d',
              transition: 'transform 0.2s',
              transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '200px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              zIndex: 1000
            }}>
              <div
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/user');
                }}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                  color: '#2d3748'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f7fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <span>👤</span>
                Profile
              </div>
              <div style={{
                height: '1px',
                background: '#e2e8f0',
                margin: '4px 0'
              }} />
              <div
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                  color: '#ef4444'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <span>🚪</span>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UMKMTopbar;
