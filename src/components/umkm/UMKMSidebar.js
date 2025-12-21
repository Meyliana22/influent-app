import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/AddCircleOutline';
import TransactionsIcon from '@mui/icons-material/Payment';
import ChatIcon from '@mui/icons-material/Chat';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import logoIcon from '../../assets/logoIcon.svg';
import { COLORS } from '../../constants/colors';

const drawerWidth = 260;

function UMKMSidebar({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/campaign/dashboard' },
    { icon: ListIcon, label: 'Daftar Kampanye', path: '/campaigns' },
    { icon: TransactionsIcon, label: 'Riwayat Transaksi', path: '/transactions' },
    { icon: ChatIcon, label: 'Pesan', path: '/chat' },
  ];

  const isActive = (path) => location.pathname === path;

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1f36', color: '#fff' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: COLORS.gradient,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <img 
              src={logoIcon} 
              alt="Influent Logo"
              style={{
                width: 24,
                height: 24,
                objectFit: 'contain'
              }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.2
              }}
            >
              Influent
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 500
              }}
            >
              UMKM Dashboard
            </Typography>
          </Box>
        </Box>
        
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 0.5, px: 2 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                background: isActive(item.path) 
                  ? 'rgba(102,126,234,0.15)' 
                  : 'transparent',
                // borderLeft: isActive(item.path) 
                //   ? '3px solid #667eea' 
                //   : '3px solid transparent', // Removing border for rounded style
                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.7)',
                '&:hover': {
                  background: isActive(item.path) 
                    ? 'rgba(102,126,234,0.25)' 
                    : 'rgba(255,255,255,0.05)',
                  color: '#fff'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <item.icon sx={{ fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(255,255,255,0.1)' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default UMKMSidebar;
