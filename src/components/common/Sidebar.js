import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Divider,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/AddCircleOutline';
import BrowseIcon from '@mui/icons-material/Search';
import CollaborationsIcon from '@mui/icons-material/Handshake';
import TransactionsIcon from '@mui/icons-material/Payment';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListIcon from '@mui/icons-material/List';
import logoIcon from '../../assets/logoIcon.svg';
import { COLORS } from '../../constants/colors';

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  
  // Get user role from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role || 'influencer';

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define menu items based on role
  const getMenuItems = () => {
    switch (userRole) {
      case 'company':
      case 'umkm':
        return [
          { icon: DashboardIcon, label: 'Dasbor', path: '/campaign/dashboard' },
          { icon: ListIcon, label: 'Kampanye', path: '/campaigns/list' },
          { icon: TransactionsIcon, label: 'Transaksi', path: '/campaign/transactions' },
          { icon: ChatIcon, label: 'Pesan', path: '/chat' },
        ];
      case 'admin':
        return [
          { icon: DashboardIcon, label: 'Dasbor', path: '/admin/dashboard' },
          { icon: PeopleIcon, label: 'Kelola Pengguna', path: '/admin/users' },
          { icon: CampaignIcon, label: 'Kelola Kampanye', path: '/admin/campaigns' },
          { icon: GavelIcon, label: 'Tinjau Pengajuan', path: '/admin/review-submissions' },
          { icon: TransactionsIcon, label: 'ManajemenTransaksi', path: '/admin/transactions' },
          { icon: AccountBalanceWalletIcon, label: 'Manajemen Penarikan', path: '/admin/withdrawals' },
          // { icon: BarChartIcon, label: 'Laporan', path: '/admin/reports' },
          { icon: ChatIcon, label: 'Pesan', path: '/chat' },
        ];
      case 'influencer':
      case 'student':
      default:
        return [
          { icon: DashboardIcon, label: 'Dasbor', path: '/student/dashboard' },
          { icon: BrowseIcon, label: 'Jelajahi Kampanye', path: '/student/browse-campaigns' },
          { icon: CollaborationsIcon, label: 'Kolaborasi Saya', path: '/student/my-applications' },
          { icon: TransactionsIcon, label: 'Transaksi', path: '/student/transactions' },
          { icon: ChatIcon, label: 'Pesan', path: '/chat' },
        ];
    }
  };

  // Get sidebar label based on role
  const getSidebarLabel = () => {
    switch (userRole) {
      case 'umkm':
      case 'company':
        return 'Dasbor UMKM';
      case 'admin':
        return 'Dasbor Admin';
      case 'influencer':
      case 'student':
      default:
        return 'Dasbor Influencer';
    }
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    switch (userRole) {
      case 'umkm':
      case 'company':
        return '/campaign/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'influencer':
      case 'student':
      default:
        return '/student/dashboard';
    }
  };

  const menuItems = getMenuItems();
  const sidebarLabel = getSidebarLabel();
  const dashboardPath = getDashboardPath();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#4c0f77ff', // Primary Color
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => navigate(dashboardPath)}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            sx={{
              position: 'absolute',
              top: '12px',
              right: '8px',
              width: '32px',
              height: '32px',
              color: '#fff',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <Box
          sx={{
            width: '48px',
            height: '48px',
            background: '#fff', // White logo bg for contrast
            borderRadius: '12px',
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
              width: '28px',
              height: '28px',
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
              letterSpacing: '-0.5px',
              margin: 0,
              lineHeight: 1
            }}
          >
            Influent
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              margin: 0,
              lineHeight: 1
            }}
          >
            {sidebarLabel}
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List
        sx={{
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <ListItem
              key={index}
              disablePadding
              sx={{ display: 'block', margin: '4px 0' }}
            >
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onClose();
                }}
                sx={{
                  margin: '0 8px',
                  borderRadius: '10px',
                  minHeight: 48,
                  justifyContent: 'initial',
                  px: 2.5,
                  background: active 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'transparent',
                  borderLeft: '3px solid transparent', // Remove colored border, use bg
                  color: '#fff', // Always white text on purple
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    color: '#fff'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                    color: '#fff' // Always white icon
                  }}
                >
                  <Icon sx={{ fontSize: '22px' }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.95rem',
                      fontWeight: active ? 600 : 500,
                      color: 'inherit',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      maxWidth: '100%',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Section */}
      <Box
        sx={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center'
        }}
      >
        © 2025 Influent. Semua hak dilindungi.
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      {!isMobile && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '260px',
            height: '100vh',
            zIndex: 1000
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={isOpen}
          onClose={onClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: '260px',
              background: '#6E00BE',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              zIndex: 1000
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}

export default Sidebar;
