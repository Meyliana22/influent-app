import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  getNotifications, 
  markAsRead as markAsReadService, 
  markAllAsRead as markAllAsReadService, 
  getUnreadCount 
} from '../../services/notificationService';

/**
 * NotificationsPage Component
 */
function NotificationsPage() {
  const location = useLocation();
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'admin', 'company', 'influencer'
  const [notifications, setNotifications] = useState([]);
  const [unreadCountBadge, setUnreadCountBadge] = useState(0);
  const [filterType, setFilterType] = useState('all');

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

  // Detect user role from localStorage (source of truth)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role); // 'admin', 'company', 'influencer'
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }, []);
  
  // Fetch notifications from API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications
      // Note: Backend filters by user from token. We get all notifications sorted by date.
      const data = await getNotifications({ sort: 'created_at', order: 'desc' });
      console.log(data);
      const notifsList = Array.isArray(data.data) ? data.data : [];
      
      // Map backend data to frontend format if needed, but data structure seems consistent
      // Just need to ensure field names match what UI expects.
      // UI expects: id, type, title, message, time, isRead, created_at
      
      const mappedNotifs = notifsList.map(notif => ({
        id: notif.id || notif.notification_id, // handle both just in case
        type: notif.type, // RAW type for consistent icon generation
        category: getNotificationCategory(notif.type), // Mapped category for filtering
        originalType: notif.type,
        title: notif.title,
        message: notif.message,
        time: formatTimeAgo(notif.created_at),
        isRead: notif.is_read,
        reference_id: notif.reference_id, // if available
        reference_type: notif.reference_type, // if available
        created_at: notif.created_at
      }));
      
      setNotifications(mappedNotifs);

      // Fetch unread count for badge
      const count = await getUnreadCount();
      setUnreadCountBadge(count);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Map backend notification types to frontend types for icons
  // Map backend notification types to frontend categories for filtering
  const getNotificationCategory = (type) => {
    // Customize this based on actual backend types
    const typeMap = {
      'application_accepted': 'approval',
      'withdrawal': 'payment',
      'campaign_approved': 'approval',
      'campaign_rejected': 'approval',
      'campaign_cancelled': 'system',
      'payment_success': 'payment',
      'applicant_new': 'applicant',
      'content_submitted': 'content',
      'system': 'system',
      'application_rejected': 'cancel'
    };
    return typeMap[type] || 'system';
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'menit' : 'menit'} yang lalu`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'jam' : 'jam'} yang lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Get notification icon based on type (exact match with NotificationBell.js)
  const getNotificationIcon = (type, title = '') => {
    const iconProps = { fontSize: 'small' };
    
    // Check title specific scenarios first if type is generic
    const lowerTitle = (title || '').toLowerCase();
    
    if (lowerTitle.includes('approved') || lowerTitle.includes('disetujui')) {
        return <CheckCircleIcon {...iconProps} sx={{ color: '#10b981' }} />; // Green
    }
    if (lowerTitle.includes('rejected') || lowerTitle.includes('ditolak')) {
        return <ErrorIcon {...iconProps} sx={{ color: '#ef4444' }} />; // Red
    }

    switch (type) {
      case 'campaign':
        return <CampaignIcon {...iconProps} sx={{ color: '#6E00BE' }} />;
      case 'payment':
        return <MonetizationOnIcon {...iconProps} sx={{ color: '#f59e0b' }} />; // Amber
      case 'violation':
        return <ErrorIcon {...iconProps} sx={{ color: '#ef4444' }} />;
      case 'system':
        return <InfoIcon {...iconProps} sx={{ color: '#3b82f6' }} />; // Blue
      default:
        return <MailIcon {...iconProps} sx={{ color: '#64748b' }} />;
    }
  };

  const markAsRead = async (id) => {
    try {
      await markAsReadService(id);
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
      setUnreadCountBadge(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadService();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      setUnreadCountBadge(0);
      toast.success('Semua notifikasi telah ditandai sebagai dibaca');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Gagal menandai notifikasi');
    }
  };

  const navigate = useNavigate();

  // Handle notification click - navigate to relevant page
  const handleNotificationClick = async (notif) => {
    // Mark as read if unread
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }

    // Navigate based on user role and notification title/type
    // We use the title or type to determine where to go
    const title = (notif.title || '').toLowerCase();
    
    // Logic from NotificationBell.js adapted here
    if (userRole === 'admin') {
        if (title.includes('campaign') && (title.includes('ditinjau') || title.includes('review'))) {
          navigate('/admin/campaigns');
        } else if (title.includes('withdrawal') || title.includes('penarikan')) {
          navigate('/admin/withdrawals');
        } else if (title.includes('user') || title.includes('pengguna')) {
          navigate('/admin/users');
        } else {
            // Default fallbacks
        }
      } else if (userRole === 'company') {
        if (title.includes('disetujui') || title.includes('approved')) {
          navigate('/campaigns/list');
        } else if (title.includes('ditolak') || title.includes('rejected')) {
          if (notif.reference_id) {
            navigate(`/campaign-edit/${notif.reference_id}`);
          } else {
            navigate('/campaigns/list');
          }
        } else if (notif.reference_type === 'campaign' && notif.reference_id) {
          if (title.includes('payment') || title.includes('pembayaran')) {
            navigate('/campaign/transactions');
          } else if (title.includes('applicant') || title.includes('pelamar')) {
            navigate(`/campaign/${notif.reference_id}/applicants`);
          } else {
            navigate(`/campaign-edit/${notif.reference_id}`);
          }
        }
      } else {
        // Influencer navigation
        if (title.includes('application') || title.includes('lamaran')) {
          navigate('/student/my-applications');
        } else if (title.includes('payment') || title.includes('pembayaran')) {
          navigate('/student/transactions');
        }
      }
  };

  const filteredNotifications = filterType === 'all' 
    ? notifications 
    : filterType === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.category === filterType);

  return (
    <Box sx={{ display: 'flex', background: '#f7fafc', minHeight: '100vh', height: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: !isMobile ? 32.5 : 0, width: !isMobile ? `calc(100% - ${32.5 * 8}px)` : '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} unreadCount={unreadCountBadge} />
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: '#1a1f36', m: 0, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                    Notifikasi
                  </Typography>
              
                </Box>
                <Typography sx={{ fontSize: 15, color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>
                  {unreadCountBadge > 0 ? `Anda memiliki ${unreadCountBadge} notifikasi belum dibaca` : 'Semua sudah dibaca!'}
                </Typography>
              </Box>
            </Box>
            {unreadCountBadge > 0 && (
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
                Tandai Semua Dibaca
              </Button>
            )}
          </Box>

          {/* Filter Tabs */}
          <Box sx={{ background: '#fff', borderRadius: 2, p: 2.5, mb: 3, border: '1px solid #e2e8f0', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {[
              { value: 'all', label: 'Semua', IconComponent: NotificationsIcon },
              { value: 'unread', label: 'Belum Dibaca', IconComponent: StarIcon },
              { value: 'applicant', label: 'Pelamar', IconComponent: MailIcon },
              { value: 'approval', label: 'Persetujuan', IconComponent: CheckCircleIcon },
              { value: 'payment', label: 'Pembayaran', IconComponent: MonetizationOnIcon }
            ].map(filter => (
              <Button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                sx={{
                  py: 1.25,
                  px: 2.5,
                  border: filterType === filter.value ? 'none' : `2px solid ${COLORS.primary}33`, // 20% opacity
                  borderRadius: 1.25,
                  background: filterType === filter.value ? COLORS.primary : '#fff',
                  color: filterType === filter.value ? '#fff' : COLORS.primary,
                  fontWeight: filterType === filter.value ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'none',
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: filterType === filter.value ? COLORS.primary : `${COLORS.primary}11`, // 70-ish opacity equivalent or just light tint
                    color: filterType === filter.value ? '#fff' : COLORS.primary
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
          <Box sx={{ background: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden', minHeight: '400px' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                <CircularProgress size={40} sx={{ color: COLORS.primary }} />
              </Box>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif, index) => {
                return (
                  <Box
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      p: 2.5,
                      borderBottom: index < filteredNotifications.length - 1 ? '1px solid #e2e8f0' : 'none',
                      background: notif.isRead ? '#fff' : '#f5f3ff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      '&:hover': { background: COLORS.primaryLight }
                    }}
                  >
                    {/* Icon - matching NotificationBell.js UI style */}
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #f1f5f9'
                    }}>
                      {getNotificationIcon(notif.type, notif.title)}
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
                          <Box sx={{ width: 7.5, height: 7.5, borderRadius: '50%', background: COLORS.primary, ml: 1 }} />
                        )}
                      </Box>
                      <Typography sx={{ mb: 1, color: '#6c757d', fontSize: 14, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                        {notif.message}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#a0aec0', fontFamily: 'Inter, sans-serif' }}>
                        {notif.time}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box sx={{ pt: 18, px: 3, textAlign: 'center', color: '#6c757d' }}>
                <NotificationsIcon sx={{ fontSize: 38, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#1a1f36' }}>
                  Tidak Ada Notifikasi
                </Typography>
                <Typography sx={{ fontSize: 14 }}>
                  Semua notifikasi akan muncul di sini
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
