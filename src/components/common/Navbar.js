import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import logo from '../../assets/logo.svg';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import {
  Badge,
  Box,
  Button,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';

/**
 * Reusable Navbar Component
 * @param {string} userType - Type of user: 'umkm' or 'student'
 * @param {boolean} showAuth - If true, show login/register buttons
 */
const Navbar = ({ userType = 'umkm', showAuth = false, unreadCount = 0 }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user from localStorage to determine role
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }, []);

  // All roles use single notifications route
  const getNotificationsPath = () => {
    return '/notifications'; // Single route for all roles (admin, company, influencer)
  };

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
    <Box
      sx={{
        bgcolor: COLORS.white,
        borderBottom: `1px solid ${COLORS.border}`,
        px: 4,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: `0 2px 8px ${COLORS.shadow}`,
      }}
    >
      {/* Logo and Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Box 
          component="img" 
          src={logo} 
          alt='Logo' 
          sx={{ height: 26, cursor: 'pointer' }} 
          onClick={() => navigate('/')} 
        />
        
        <Stack direction="row" spacing={3}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                background: 'transparent',
                border: 'none',
                color: COLORS.textSecondary,
                fontWeight: 500,
                fontSize: '1rem',
                minWidth: 'auto',
                p: 0,
                textTransform: 'none',
                '&:hover': {
                  background: 'transparent',
                  color: COLORS.primary
                }
              }}
              disableRipple
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Right Side Icons/Buttons */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {showAuth ? (
          <>
            <Button
              onClick={() => navigate('/login')}
              variant="outlined"
              sx={{
                px: 2.5,
                py: 1,
                borderColor: COLORS.primary,
                color: COLORS.primary,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': {
                  borderColor: COLORS.primary,
                  bgcolor: 'rgba(102, 126, 234, 0.05)'
                }
              }}
            >
              Masuk
            </Button>
            <Button
              onClick={() => navigate('/register-umkm')}
              variant="contained"
              sx={{
                px: 2.5,
                py: 1,
                background: COLORS.gradientPrimary,
                color: COLORS.white,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: 'none',
                '&:hover': {
                  background: COLORS.gradientPrimary,
                  opacity: 0.9
                }
              }}
            >
              Daftar
            </Button>
          </>
        ) : (
          <>
            <IconButton onClick={() => navigate('/chat')}>
              <ChatIcon
                sx={{ 
                  fontSize: 26, 
                  color: COLORS.textSecondary, 
                  '&:hover': { color: COLORS.primary }
                }}
              />
            </IconButton>
            
            <IconButton onClick={() => navigate(getNotificationsPath())}>
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    minWidth: '18px',
                    height: '18px'
                  }
                }}
              >
                <NotificationsIcon
                  sx={{ 
                    fontSize: 28, 
                    color: COLORS.textSecondary, 
                    '&:hover': { color: COLORS.primary }
                  }}
                />
              </Badge>
            </IconButton>
            
            <IconButton onClick={() => navigate('/user')}>
              <PersonIcon
                sx={{ 
                  fontSize: 30, 
                  color: COLORS.textSecondary, 
                  '&:hover': { color: COLORS.primary }
                }}
              />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Navbar;
