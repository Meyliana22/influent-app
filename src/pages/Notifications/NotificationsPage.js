import React, { useState } from 'react';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
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
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', width: !isMobile ? 'calc(100% - 260px)' : '100%' }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        
        <div style={{ marginTop: '72px', padding: '32px' }}>
          {/* Page Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px'
          }}>
            <div>
              <h1 style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: 700,
                color: '#1a1f36',
                margin: '0px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Notifications
              </h1>
              <p style={{
                fontSize: '0.95rem',
                color: '#6c757d',
                fontFamily: "'Inter', sans-serif"
              }}>
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '12px 24px',
                  background: COLORS.gradient,
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Mark All as Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '16px 24px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {[
              { value: 'all', label: 'All', IconComponent: NotificationsIcon },
              { value: 'unread', label: 'Unread', IconComponent: StarIcon },
              { value: 'applicant', label: 'Applicants', IconComponent: PersonIcon },
              { value: 'approval', label: 'Approvals', IconComponent: CheckCircleIcon },
              { value: 'payment', label: 'Payments', IconComponent: AttachMoneyIcon }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                style={{
                  padding: '10px 20px',
                  border: filterType === filter.value ? 'none' : '2px solid #e2e8f0',
                  borderRadius: '10px',
                  background: filterType === filter.value ? COLORS.gradient : '#fff',
                  color: filterType === filter.value ? '#fff' : '#6c757d',
                  fontWeight: filterType === filter.value ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <filter.IconComponent sx={{ fontSize: 18 }} />
                {filter.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif, index) => {
                const iconStyle = getIconColor(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    style={{
                      padding: '20px 24px',
                      borderBottom: index < filteredNotifications.length - 1 ? '1px solid #e2e8f0' : 'none',
                      background: notif.isRead ? '#fff' : '#f0f9ff',
                      cursor: notif.isRead ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                      if (!notif.isRead) {
                        e.currentTarget.style.background = '#e0f2fe';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!notif.isRead) {
                        e.currentTarget.style.background = '#f0f9ff';
                      }
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: iconStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      {React.createElement(getIcon(notif.type), { 
                        sx: { fontSize: 24, color: iconStyle.color } 
                      })}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'start',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '1rem',
                          fontWeight: notif.isRead ? 600 : 700,
                          color: '#1a1f36',
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            flexShrink: 0,
                            marginLeft: '12px',
                            marginTop: '6px'
                          }} />
                        )}
                      </div>
                      <p style={{
                        margin: '0 0 8px 0',
                        color: '#6c757d',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {notif.message}
                      </p>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#a0aec0',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {notif.time}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        opacity: 0.6,
                        transition: 'opacity 0.2s',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = 1}
                      onMouseLeave={(e) => e.target.style.opacity = 0.6}
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
            ) : (
              <div style={{
                padding: '64px 24px',
                textAlign: 'center',
                color: '#6c757d'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>🔔</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#1a1f36'
                }}>
                  No Notifications
                </h3>
                <p style={{ fontSize: '1rem' }}>
                  All notifications will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
