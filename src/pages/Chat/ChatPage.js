import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Button, Card, Modal, Input } from '../../components/common';
import { COLORS } from '../../constants/colors';

function ChatPage() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Dummy chat list
  const chatList = [
    { id: 1, name: 'Nama User', lastMessage: 'Terima kasih atas kampanye nya!', time: '10:30', unread: 2 },
    { id: 2, name: 'Nama User', lastMessage: 'Kapan deadline submit konten?', time: '09:15', unread: 0 },
    { id: 3, name: 'Nama User', lastMessage: 'Baik, saya akan segera upload', time: 'Yesterday', unread: 0 }
  ];

  // Dummy messages
  const messages = [
    { id: 1, sender: 'user', text: 'Halo! Saya tertarik dengan campaign ini', time: '10:25' },
    { id: 2, sender: 'me', text: 'Halo! Terima kasih sudah apply ya', time: '10:27' },
    { id: 3, sender: 'user', text: 'Untuk deadline konten kapan ya?', time: '10:28' },
    { id: 4, sender: 'me', text: 'Deadline nya tanggal 15 bulan ini', time: '10:30' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Logika kirim pesan
      console.log('Send message:', message);
      setMessage('');
    }
  };

  const handleReport = () => {
    setShowReportPopup(true);
  };

  const confirmReport = () => {
    alert(`User telah dilaporkan dengan alasan: ${reportReason}`);
    setShowReportPopup(false);
    setReportReason('');
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'Montserrat, Arial, sans-serif',
      background: COLORS.background
    }}>
      {/* Navbar */}
      <Navbar userType="student" />

      {/* Chat Sidebar */}
      <Card 
        padding="large"
        style={{
          width: '300px',
          borderRight: `1px solid ${COLORS.border}`,
          marginTop: '70px',
          overflowY: 'auto',
          borderRadius: 0
        }}
      >
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '1.5rem', 
          fontWeight: 700,
          color: COLORS.textPrimary
        }}>
          Chats
        </h2>

        {/* Chat List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {chatList.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: selectedChat?.id === chat.id ? COLORS.hover : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedChat?.id !== chat.id) {
                  e.currentTarget.style.background = COLORS.backgroundLight;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedChat?.id !== chat.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{chat.name}</span>
                {chat.unread > 0 && (
                  <span style={{
                    background: COLORS.primary,
                    color: COLORS.white,
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {chat.unread}
                  </span>
                )}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: COLORS.textSecondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {chat.lastMessage}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginTop: '70px'
      }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '20px 32px',
              background: COLORS.white,
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: COLORS.hover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  👤
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.textPrimary }}>
                  {selectedChat.name}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={handleReport}
                title="Report User"
              >
                ⚠️ Report
              </Button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px',
              background: COLORS.backgroundLight,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '60%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: msg.sender === 'me' ? COLORS.primary : COLORS.white,
                    color: msg.sender === 'me' ? COLORS.white : COLORS.textPrimary,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ marginBottom: '4px' }}>{msg.text}</div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div style={{
              padding: '20px 32px',
              background: COLORS.white,
              borderTop: `1px solid ${COLORS.border}`
            }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    border: `2px solid ${COLORS.border}`,
                    borderRadius: '24px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                  onBlur={(e) => e.target.style.borderColor = COLORS.border}
                />
                <Button
                  type="submit"
                  variant="primary"
                  style={{ borderRadius: '24px' }}
                >
                  ➤ Kirim
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: COLORS.textSecondary
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '16px', opacity: 0.3 }}>💬</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px', color: COLORS.textPrimary }}>
              Pilih Chat
            </h3>
            <p style={{ fontSize: '1rem' }}>
              Pilih chat dari sidebar untuk memulai percakapan
            </p>
          </div>
        )}
      </div>

      {/* Report Popup */}
      <Modal
        isOpen={showReportPopup}
        onClose={() => setShowReportPopup(false)}
        title="Report User"
        variant="danger"
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚠️</div>
          <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: '0.95rem', lineHeight: '1.5' }}>
            Mengapa Anda ingin melaporkan user ini?
          </p>
        </div>
        <textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="Jelaskan alasan pelaporan..."
          rows="4"
          style={{
            width: '100%',
            padding: '12px',
            border: `2px solid ${COLORS.border}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            marginBottom: '20px',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}
        />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            variant="outline"
            onClick={() => setShowReportPopup(false)}
            fullWidth
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={confirmReport}
            disabled={!reportReason.trim()}
            fullWidth
          >
            Laporkan
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default ChatPage;
