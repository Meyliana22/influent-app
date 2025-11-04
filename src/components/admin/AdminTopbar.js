import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';

function AdminTopbar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const adminData = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-umkm');
  };

  return (
    <div style={{
      height: '72px',
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      marginLeft: '260px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '260px',
      zIndex: 100
    }}>
      {/* Search Bar */}
      <div style={{
        flex: 1,
        maxWidth: '500px',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="Search users, campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 44px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = COLORS.primary;
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
        <span style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '1.25rem'
        }}>
          🔍
        </span>
      </div>

      {/* Right Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Notifications */}
        <button style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: 'none',
          background: '#f7fafc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          position: 'relative',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = '#edf2f7'}
        onMouseLeave={(e) => e.target.style.background = '#f7fafc'}
        >
          🔔
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%',
            border: '2px solid #fff'
          }}></span>
        </button>

        {/* Admin Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              background: '#f7fafc',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#edf2f7'}
            onMouseLeave={(e) => e.target.style.background = '#f7fafc'}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: COLORS.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#2d3748',
                fontFamily: "'Inter', sans-serif"
              }}>
                {adminData.name || 'Admin'}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#6c757d'
              }}>
                Administrator
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>▼</span>
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
              <button
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
                <span>⚙️</span>
                Settings
              </button>
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
                onMouseEnter={(e) => e.target.style.background = '#f7fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span>👤</span>
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
                onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <span>🚪</span>
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
