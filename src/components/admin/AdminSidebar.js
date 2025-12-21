import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  useTheme 
} from '@mui/material';
import { COLORS } from '../../constants/colors';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import GavelIcon from '@mui/icons-material/Gavel';
import logoIcon from '../../assets/logoIcon.svg';

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    { path: '/admin/dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { path: '/admin/users', icon: PeopleIcon, label: 'Manage Users' },
    { path: '/admin/campaigns', icon: CampaignIcon, label: 'Manage Campaigns' },
    { path: '/admin/review-submissions', icon: GavelIcon, label: 'Review Submissions' },
    { path: '/admin/reports', icon: BarChartIcon, label: 'Reports' },
    { path: '/chat', icon: ChatIcon, label: 'Chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        bgcolor: '#6E00BE', // Primary
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            background: '#fff',
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
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ py: 3 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                px: 3,
                py: 1.5,
                background: isActive(item.path) 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'transparent',
                borderLeft: '3px solid',
                borderColor: isActive(item.path) 
                  ? '#fff' 
                  : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  background: isActive(item.path) 
                    ? 'rgba(255, 255, 255, 0.25)' 
                    : 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: '#fff'
                }}
              >
                <item.icon sx={{ fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  color: '#fff',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default AdminSidebar;
