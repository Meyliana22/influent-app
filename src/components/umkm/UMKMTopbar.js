import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Typography, 
  Divider,
  ListItemIcon,
  ButtonBase,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { COLORS } from '../../constants/colors';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationBell from '../common/NotificationBell';

function UMKMTopbar({ onMenuClick = () => {} }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'UMKM User';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    localStorage.removeItem('user');
    navigate('/login');
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
          bgcolor: '#f7fafc',
          borderRadius: 2,
          '&:hover': { bgcolor: '#e2e8f0' }
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile Dropdown */}
        <Box>
          <ButtonBase
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 0.75,
              pr: 1.5,
              bgcolor: open ? '#edf2f7' : 'transparent',
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: open ? '#edf2f7' : '#f7fafc'
              }
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: COLORS.primary,
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff'
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
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
                UMKM Account
              </Typography>
            </Box>
          </ButtonBase>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                minWidth: 200,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/user'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}

export default UMKMTopbar;
