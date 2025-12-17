import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SearchIcon from '@mui/icons-material/Search';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PaymentIcon from '@mui/icons-material/Payment';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListIcon from '@mui/icons-material/List';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = React.useState('student');

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user?.role) setUserRole(user.role);
  }, []);

  const getMenuItems = () => {
    switch (userRole) {
      case 'company':
      case 'umkm':
        return [
          { icon: <DashboardRoundedIcon />, label: 'Dashboard', path: '/umkm/dashboard' },
          { icon: <ListIcon />, label: 'Daftar Kampanye', path: '/campaigns' },
          { icon: <PaymentIcon />, label: 'Riwayat Transaksi', path: '/transactions' },
          { icon: <ChatIcon />, label: 'Pesan', path: '/chat' },
        ];
      case 'admin':
        return [
          { icon: <DashboardRoundedIcon />, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: <PeopleIcon />, label: 'Manage Users', path: '/admin/users' },
          { icon: <CampaignIcon />, label: 'Manage Campaigns', path: '/admin/campaigns' },
          { icon: <PaymentIcon />, label: 'Transactions', path: '/admin/transactions' },
          { icon: <AccountBalanceWalletIcon />, label: 'Withdrawals', path: '/admin/withdrawals' },
          { icon: <BarChartIcon />, label: 'Reports', path: '/admin/reports' },
          { icon: <ChatIcon />, label: 'Chat', path: '/chat' },
        ];
      case 'influencer':
      case 'student':
      default:
        return [
          { icon: <DashboardRoundedIcon />, label: 'Dashboard', path: '/student/dashboard' },
          { icon: <SearchIcon />, label: 'Browse Campaigns', path: '/student/browse-campaigns' },
          { icon: <HandshakeIcon />, label: 'My Collaborations', path: '/student/collaborations' },
          { icon: <PaymentIcon />, label: 'Transactions', path: '/student/transactions' },
          { icon: <ChatIcon />, label: 'Chat', path: '/chat' },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton 
              selected={location.pathname === item.path} 
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
