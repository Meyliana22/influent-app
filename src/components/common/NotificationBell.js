/**
 * NotificationBell Component
 * Bell icon with badge showing unread count
 * Dropdown menu showing recent notifications
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notificationService';
const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const pollingIntervalRef = useRef(null);

  const open = Boolean(anchorEl);

  // Get user role from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
  }, []);

  // All roles use single notifications route
  const getNotificationsPath = () => {
    return '/notifications'; // Single route for all roles (admin, company, influencer)
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch recent notifications (for dropdown)
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch all and slice for dropdown
      const data = await getNotifications({ order: 'DESC' });
      // Ensure data is an array before slicing
      const list = Array.isArray(data.data) ? data.data : [];
      setNotifications(list.slice(0, 5));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Polling mechanism - every 15 seconds
  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 15000); // 15 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle bell icon click
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead(notification.notification_id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Close menu
      handleClose();

      // Navigate based on user role and notification title
      const title = notification.title.toLowerCase();
      
      if (userRole === 'admin') {
        // Admin navigation
        if (title.includes('campaign') && (title.includes('ditinjau') || title.includes('review'))) {
          navigate('/admin/campaigns');
        } else if (title.includes('withdrawal') || title.includes('penarikan')) {
          navigate('/admin/withdrawals');
        } else if (title.includes('user') || title.includes('pengguna')) {
          navigate('/admin/users');
        } else {
          navigate('/notifications');
        }
      } else if (userRole === 'company') {
        // UMKM navigation
        if (title.includes('disetujui') || title.includes('approved')) {
          // Campaign approved - go to campaigns list to make payment
          navigate('/campaigns/list');
        } else if (title.includes('ditolak') || title.includes('rejected')) {
          // Campaign rejected - go to edit page to fix
          if (notification.reference_id) {
            navigate(`/campaign-edit/${notification.reference_id}`);
          } else {
            navigate('/campaigns/list');
          }
        } else if (notification.reference_type === 'campaign' && notification.reference_id) {
          if (title.includes('payment') || title.includes('pembayaran')) {
            navigate('/transactions');
          } else if (title.includes('applicant') || title.includes('pelamar')) {
            navigate(`/campaign/${notification.reference_id}/applicants`);
          } else {
            navigate(`/campaign-edit/${notification.reference_id}`);
          }
        } else {
          navigate('/notifications');
        }
      } else {
        // Influencer navigation
        if (title.includes('application') || title.includes('lamaran')) {
          navigate('/applications');
        } else if (title.includes('payment') || title.includes('pembayaran')) {
          navigate('/transactions');
        } else {
          navigate('/notifications');
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      fetchNotifications(); // Refresh list
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconStyle = { fontSize: 20, mr: 1.5 };
    switch (type) {
      case 'campaign':
        return '📋';
      case 'payment':
        return '💰';
      case 'violation':
        return '⚠️';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  };

  // Format time ago (simple implementation without date-fns)
  const formatTimeAgo = (dateString) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return 'baru saja';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} menit yang lalu`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} jam yang lalu`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} hari yang lalu`;
      } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} minggu yang lalu`;
      } else {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} bulan yang lalu`;
      }
    } catch (error) {
      return 'baru saja';
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        aria-label={`${unreadCount} notifikasi baru`}
        color="inherit"
        sx={{
          position: 'relative',
          '&:hover': {
            bgcolor: 'rgba(102, 126, 234, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? (
            <NotificationsIcon sx={{ fontSize: 28 }} />
          ) : (
            <NotificationsNoneIcon sx={{ fontSize: 28 }} />
          )}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
            Notifikasi
          </Typography>
          <Button
            size="small"
            onClick={() => {
              handleClose();
              navigate(getNotificationsPath());
            }}
            sx={{
              textTransform: 'none',
              fontSize: 11,
              color: '#667eea',
              fontWeight: 600,
              minWidth: 'auto',
              px: 1,
              '&:hover': { 
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                textDecoration: 'underline'
              },
            }}
          >
            Lihat semua
          </Button>
        </Box>

        <Divider />

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
            <Typography sx={{ color: '#999', fontSize: 14 }}>
              Tidak ada notifikasi
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.notification_id || notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                bgcolor: notification.is_read ? 'transparent' : 'rgba(102, 126, 234, 0.05)',
                borderLeft: notification.is_read ? 'none' : '3px solid #667eea',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              {/* Icon */}
              <Box sx={{ fontSize: 24, flexShrink: 0, mt: 0.5 }}>
                {getNotificationIcon(notification.type)}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: notification.is_read ? 500 : 700,
                    color: '#333',
                    mb: 0.5,
                    lineHeight: 1.3,
                  }}
                >
                  {notification.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: '#666',
                    mb: 0.5,
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#999', mt: 0.5 }}>
                  {formatTimeAgo(notification.created_at)}
                </Typography>
              </Box>

              {/* Read indicator */}
              {!notification.is_read && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#667eea',
                    flexShrink: 0,
                    mt: 1,
                  }}
                />
              )}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
