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
  useTheme,
  useMediaQuery,
  ButtonBase
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationBell from './NotificationBell';

function Topbar({ onMenuClick = () => {} }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'User';
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
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: { xs: 0, md: 260 },
        right: 0,
        height: 72,
        bgcolor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        zIndex: 90,
        transition: theme.transitions.create(['left'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Hamburger Menu - Mobile Only */}
      <IconButton
        onClick={onMenuClick}
        sx={{
          display: { xs: 'flex', md: 'none' },
          mr: 2,
          width: 40,
          height: 40,
          borderRadius: 2,
          color: '#1a1f36',
          '&:hover': {
            backgroundColor: '#e2e8f0'
          }
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
        {/* Notification Bell with Dropdown */}
        <NotificationBell />

        {/* Profile Button */}
        <Box>
          <ButtonBase
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: '8px 12px',
              borderRadius: 3,
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
            <Box sx={{ textAlign: 'left' }}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#2d3748',
                  lineHeight: 1.2
                }}
              >
                {userName}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#6c757d',
                  lineHeight: 1.2
                }}
              >
                {getRoleLabel()}
              </Typography>
            </Box>
          </ButtonBase>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                minWidth: 200,
                mt: 1.5
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={handleProfileClick}
              sx={{
                '&:hover': {
                  backgroundColor: '#f7fafc'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PersonIcon sx={{ color: '#2d3748' }} />
              </ListItemIcon>
              Profile
            </MenuItem>
            
            <Divider sx={{ my: 0.5 }} />
            
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: '#fff5f5'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LogoutIcon sx={{ fontSize: 20, color: '#ef4444' }} />
              </ListItemIcon>
              Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}

export default Topbar;
