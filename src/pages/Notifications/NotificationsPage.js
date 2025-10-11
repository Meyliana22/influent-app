import React, { useState } from 'react';
import { Navbar, Card, Button } from '../../components/common';
import { COLORS } from '../../constants/colors';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'application', 
      title: 'Aplikasi Baru', 
      message: 'User123 telah apply ke campaign "Razer Mouse Review"',
      time: '2 jam yang lalu',
      isRead: false
    },
    { 
      id: 2, 
      type: 'message', 
      title: 'Pesan Baru', 
      message: 'Anda mendapat pesan baru dari UserInfluencer',
      time: '5 jam yang lalu',
      isRead: false
    },
    { 
      id: 3, 
      type: 'content', 
      title: 'Konten Disubmit', 
      message: 'UserInfluencer telah submit konten untuk campaign "Product Launch"',
      time: 'Kemarin',
      isRead: true
    },
    { 
      id: 4, 
      type: 'system', 
      title: 'Campaign Berakhir', 
      message: 'Campaign "Summer Sale 2024" telah berakhir',
      time: '2 hari yang lalu',
      isRead: true
    }
  ]);

  const getIcon = (type) => {
    switch(type) {
      case 'application': return '📝';
      case 'message': return '💬';
      case 'content': return '📸';
      case 'system': return '⚙️';
      default: return '🔔';
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: COLORS.background,
      fontFamily: 'Montserrat, Arial, sans-serif'
    }}>
      {/* Header */}
      <Navbar userType="student" />

      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header with Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '2rem', 
              fontWeight: 700,
              color: COLORS.textPrimary
            }}>
              Notifikasi
            </h2>
            {unreadCount > 0 && (
              <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: '0.95rem' }}>
                {unreadCount} notifikasi belum dibaca
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="primary" onClick={markAllAsRead}>
              Tandai Semua Dibaca
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                style={{
                  padding: '20px 24px',
                  borderBottom: index < notifications.length - 1 ? `1px solid ${COLORS.borderLight}` : 'none',
                  background: notif.isRead ? COLORS.white : COLORS.primaryLight,
                  cursor: notif.isRead ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!notif.isRead) {
                    e.currentTarget.style.background = '#e7f3ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!notif.isRead) {
                    e.currentTarget.style.background = COLORS.primaryLight;
                  }
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: notif.isRead ? COLORS.backgroundLight : COLORS.info,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 6px 0', 
                    fontSize: '1rem', 
                    fontWeight: notif.isRead ? 600 : 700,
                    color: COLORS.textPrimary
                  }}>
                    {notif.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: COLORS.textSecondary,
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {notif.message}
                  </p>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: COLORS.textLight
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
                    color: COLORS.danger,
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0.6}
                  title="Hapus notifikasi"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '64px 24px', 
              textAlign: 'center',
              color: COLORS.textSecondary
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>🔔</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', fontWeight: 600 }}>
                Tidak Ada Notifikasi
              </h3>
              <p style={{ fontSize: '1rem' }}>
                Semua notifikasi akan muncul di sini
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default NotificationsPage;
