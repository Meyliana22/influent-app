import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import NotificationBell from '../common/NotificationBell';

function AdminTopbar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const adminData = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{
      height: '72px',
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 32px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '260px',
      zIndex: 100
    }}>
      {/* Right Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Notification Bell with Dropdown */}
        <NotificationBell />

        {/* Admin Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 12px 6px 6px',
              background: '#f7fafc',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f7fafc'}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: COLORS.gradient,
                fontSize: '0.9rem',
                fontWeight: 700
              }}
            >
              {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
            </Avatar>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#2d3748',
                fontFamily: "'Inter', sans-serif"
              }}>
                {adminData.name || 'Admin Influent'}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6c757d'
              }}>
                Administrator
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              minWidth: '200px',
              overflow: 'hidden',
              zIndex: 1000
            }}>
              {/* <button
                onClick={() => {
                  navigate('/admin/settings');
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  color: '#2d3748',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f7fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
                Settings
              </button> */}
              <button
                onClick={() => {
                  navigate('/admin/profile');
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  color: '#2d3748',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
                Profile
              </button>
              <div style={{
                height: '1px',
                background: '#e2e8f0',
                margin: '4px 0'
              }}></div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  color: '#ef4444',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogoutIcon sx={{ fontSize: 18 }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTopbar;
