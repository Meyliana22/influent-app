import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
  Divider,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationBell from './NotificationBell';

function Topbar({ onMenuClick = () => {} }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

  const openMenu = Boolean(anchorEl);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';
  const userEmail = user.email || '';
  const userRole = user.role || 'influencer';

  // Get role label based on role
  const getRoleLabel = () => {
    switch (userRole) {
      case 'company':
        return 'UMKM Account';
      case 'admin':
        return 'Admin Account';
      case 'influencer':
      default:
        return 'Influencer Account';
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/user');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: !isMobile ? '260px' : '0',
      right: 0,
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
      {isMobile && (
        <IconButton
          onClick={onMenuClick}
          sx={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            color: '#1a1f36',
            padding: 0,
            '&:hover': {
              backgroundColor: '#e2e8f0'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto' }}>
        {/* Notification Bell with Dropdown */}
        <NotificationBell />

        {/* Profile Button */}
        <Box
          onClick={handleProfileMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: openMenu ? '#f7fafc' : 'transparent',
            '&:hover': {
              backgroundColor: '#f7fafc'
            }
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: COLORS.primary,
              fontSize: '1rem',
              fontWeight: 700,
              color: '#fff'
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#2d3748',
                margin: 0,
                lineHeight: 1
              }}
            >
              {userName}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#6c757d',
                margin: 0,
                lineHeight: 1
              }}
            >
              {getRoleLabel()}
            </Typography>
          </Box>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              minWidth: '200px',
              mt: 1
            }
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem
            onClick={handleProfileClick}
            sx={{
              '&:hover': {
                backgroundColor: '#f7fafc'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <PersonIcon sx={{ color: '#2d3748' }} />
            </ListItemIcon>
            Profile
          </MenuItem>
          
          <Divider sx={{ margin: '4px 0' }} />
          
          <MenuItem
            onClick={handleLogout}
            sx={{
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                backgroundColor: '#fff5f5'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <LogoutIcon sx={{ fontSize: '18px', color: '#ef4444' }} />
            </ListItemIcon>
            Log Out
          </MenuItem>
        </Menu>
      </Box>
    </div>
  );
}

export default Topbar;
