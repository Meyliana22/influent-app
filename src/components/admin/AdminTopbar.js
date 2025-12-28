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
  ButtonBase
} from '@mui/material';
import { COLORS } from '../../constants/colors';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationBell from '../common/NotificationBell';

function AdminTopbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const adminData = JSON.parse(localStorage.getItem('user') || '{}');

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
        height: 72,
        bgcolor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 4,
        position: 'fixed',
        top: 0,
        right: 0,
        left: 260,
        zIndex: 100
      }}
    >
      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Notification Bell */}
        <NotificationBell />

        {/* Admin Profile */}
        <Box>
          <ButtonBase
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 0.75,
              pr: 1.5,
              bgcolor: open ? '#edf2f7' : '#f7fafc',
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#edf2f7'
              }
            }}
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
            <Box sx={{ textAlign: 'left' }}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#2d3748',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.2
                }}
              >
                {adminData.name || 'Admin Influent'}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#6c757d',
                  lineHeight: 1.2
                }}
              >
                Administrator
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
            <MenuItem onClick={() => { handleClose(); navigate('/admin/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              Keluar
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminTopbar;
