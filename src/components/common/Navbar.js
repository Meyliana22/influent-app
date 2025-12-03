import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import logo from '../../assets/logo.svg';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';


/**
 * Reusable Navbar Component
 * @param {string} userType - Type of user: 'umkm' or 'student'
 * @param {boolean} showAuth - If true, show login/register buttons
 */
const Navbar = ({ userType = 'umkm', showAuth = false }) => {
  const navigate = useNavigate();

  const navItems = userType === 'umkm' 
    ? [
        { label: 'Campaign', path: '/campaigns' },
        { label: 'Applications', path: '/applications' },
      ]
    : [
        { label: 'Explore', path: '/student' },
        { label: 'Dashboard', path: '/applications' },
      ];

  return (
    <div style={{
      background: COLORS.white,
      borderBottom: `1px solid ${COLORS.border}`,
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: `0 2px 8px ${COLORS.shadow}`,
    }}>
      {/* Logo and Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <img src={logo} alt='Logo' style={{ height: '26px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        </img>
        <div style={{ display: 'flex', gap: '24px' }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.textSecondary,
                fontWeight: 500,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => e.target.style.color = COLORS.primary}
              onMouseLeave={(e) => e.target.style.color = COLORS.textSecondary}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side Icons/Buttons */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {showAuth ? (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `2px solid ${COLORS.primary}`,
                borderRadius: '8px',
                color: COLORS.primary,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/register-umkm')}
              style={{
                padding: '10px 20px',
                background: COLORS.gradientPrimary,
                border: 'none',
                borderRadius: '8px',
                color: COLORS.white,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Daftar
            </button>
          </>
        ) : (
          <>
            <ChatIcon
              sx={{ 
                fontSize: 26, 
                color: COLORS.textSecondary, 
                cursor: 'pointer',
                '&:hover': { color: COLORS.primary }
              }}
              onClick={() => navigate('/chat')}
            />
            <NotificationsIcon
              sx={{ 
                fontSize: 28, 
                color: COLORS.textSecondary, 
                cursor: 'pointer',
                '&:hover': { color: COLORS.primary }
              }}
              onClick={() => navigate('/notifications')}
            />
            <PersonIcon
              sx={{ 
                fontSize: 30, 
                color: COLORS.textSecondary, 
                cursor: 'pointer',
                '&:hover': { color: COLORS.primary }
              }}
              onClick={() => navigate('/user')}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
