import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';

function NotificationsPage() {
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'applicant', 
      title: 'Influencer Baru Mendaftar', 
      message: 'Influencer "Sarah Johnson" telah mendaftar di campaign kamu "Beauty Product Launch"',
      time: '2 hours ago',
      isRead: false
    },
    { 
      id: 2, 
      type: 'approval', 
      title: 'Campaign Disetujui', 
      message: 'Campaign kamu "Gaming Gear Review" telah disetujui oleh admin',
      time: '5 hours ago',
      isRead: false
    },
    { 
      id: 3, 
      type: 'payment', 
      title: 'Pembayaran Berhasil', 
      message: 'Pembayaran untuk campaign "Summer Sale 2024" telah berhasil diproses',
      time: 'Yesterday',
      isRead: true
    },
    { 
      id: 4, 
      type: 'applicant', 
      title: 'Influencer Baru Mendaftar', 
      message: 'Influencer "Mike Chen" telah mendaftar di campaign kamu "Tech Product Review"',
      time: '1 day ago',
      isRead: true
    },
    { 
      id: 5, 
      type: 'content', 
      title: 'Konten Disubmit', 
      message: 'Influencer telah submit konten untuk campaign "Product Launch"',
      time: '2 days ago',
      isRead: true
    },
    { 
      id: 6, 
      type: 'system', 
      title: 'Campaign Berakhir', 
      message: 'Campaign "Winter Collection 2024" telah berakhir. Lihat hasil laporan.',
      time: '3 days ago',
      isRead: true
    }
  ]);

  const [filterType, setFilterType] = useState('all');

  const getIcon = (type) => {
    switch(type) {
      case 'applicant': return PersonIcon;
      case 'approval': return CheckCircleIcon;
      case 'payment': return AttachMoneyIcon;
      case 'content': return PhotoCameraIcon;
      case 'system': return SettingsIcon;
      default: return NotificationsIcon;
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'applicant': return { bg: '#dbeafe', color: '#3b82f6' };
      case 'approval': return { bg: '#d1fae5', color: '#10b981' };
      case 'payment': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'content': return { bg: '#ede9fe', color: '#8b5cf6' };
      case 'system': return { bg: '#e2e8f0', color: '#6c757d' };
      default: return { bg: '#f7fafc', color: '#2d3748' };
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : filterType === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box sx={{ display: 'flex', background: '#f7fafc', minHeight: '100vh', height: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: !isMobile ? 32.5 : 0, width: !isMobile ? `calc(100% - ${32.5 * 8}px)` : '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} unreadCount={unreadCount} />
        <Box
          sx={{
            flex: 1,
            mt: 9,
            p: 4,
            overflow: 'auto',
            height: 'calc(100vh - 72px)', // 72px is Topbar height
            minHeight: 0
          }}
        >
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.25 }}>
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: '#1a1f36', m: 0, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                Notifications
              </Typography>
              <Typography sx={{ fontSize: 15, color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
              </Typography>
            </Box>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                sx={{
                  py: 1.5,
                  px: 3,
                  background: COLORS.gradientPrimary,
                  borderRadius: '10px',
                  color: COLORS.textWhite,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: 'none',
                  textTransform: 'none',
                  '&:hover': { background: COLORS.gradientPrimary }
                }}
                variant="contained"
              >
                Mark All as Read
              </Button>
            )}
          </Box>

          {/* Filter Tabs */}
          <Box sx={{ background: '#fff', borderRadius: 2, p: 2.5, mb: 3, border: '1px solid #e2e8f0', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: 'All', IconComponent: NotificationsIcon },
              { value: 'unread', label: 'Unread', IconComponent: StarIcon },
              { value: 'applicant', label: 'Applicants', IconComponent: PersonIcon },
              { value: 'approval', label: 'Approvals', IconComponent: CheckCircleIcon },
              { value: 'payment', label: 'Payments', IconComponent: AttachMoneyIcon }
            ].map(filter => (
              <Button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                sx={{
                  py: 1.25,
                  px: 2.5,
                  border: filterType === filter.value ? 'none' : '2px solid #6573c333',
                  borderRadius: 1.25,
                  background: filterType === filter.value ? '#6573c3' : '#fff',
                  color: filterType === filter.value ? '#fff' : '#6573c3',
                  fontWeight: filterType === filter.value ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'none',
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: filterType === filter.value ? '#4b5bb7' : '#f0f4ff',
                    color: filterType === filter.value ? '#fff' : '#4b5bb7'
                  }
                }}
                variant={filterType === filter.value ? 'contained' : 'outlined'}
                startIcon={<filter.IconComponent sx={{ fontSize: 18 }} />}
              >
                {filter.label}
              </Button>
            ))}
          </Box>

          {/* Notifications List */}
          <Box sx={{ background: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif, index) => {
                const iconStyle = getIconColor(notif.type);
                return (
                  <Box
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    sx={{
                      p: 2.5,
                      borderBottom: index < filteredNotifications.length - 1 ? '1px solid #e2e8f0' : 'none',
                      background: notif.isRead ? '#fff' : '#f0f9ff',
                      cursor: notif.isRead ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      '&:hover': !notif.isRead ? { background: '#e0f2fe' } : {}
                    }}
                  >
                    {/* Icon */}
                    <Box sx={{ width: 26, height: 26, borderRadius: 1.5, background: iconStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {React.createElement(getIcon(notif.type), { sx: { fontSize: 26, color: iconStyle.color } })}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            m: 0,
                            fontSize: 17,
                            fontWeight: 700,
                            color: '#1a1f36',
                            fontFamily: 'Inter, sans-serif',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                          }}
                        >
                          {notif.title}
                        </Typography>
                        {!notif.isRead && (
                          <Box sx={{ width: 7.5, height: 7.5, borderRadius: '50%', background: '#3b82f6', ml: 1 }} />
                        )}
                      </Box>
                      <Typography sx={{ mb: 1, color: '#6c757d', fontSize: 14, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                        {notif.message}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#a0aec0', fontFamily: 'Inter, sans-serif' }}>
                        {notif.time}
                      </Typography>
                    </Box>

                    {/* Delete Button */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      sx={{ color: '#ef4444', opacity: 0.6, transition: 'opacity 0.2s', flexShrink: 0, p: 0.5, '&:hover': { opacity: 1 } }}
                      title="Delete notification"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                );
              })
            ) : (
              <Box sx={{ pt: 38, px: 3, textAlign: 'center', color: '#6c757d' }}>
                <NotificationsIcon sx={{ fontSize: 38, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1a1f36' }}>
                  No Notifications
                </Typography>
                <Typography sx={{ fontSize: 14 }}>
                  All notifications will appear here
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default NotificationsPage;
