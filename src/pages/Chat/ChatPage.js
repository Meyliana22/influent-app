import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import { useToast } from '../../hooks/useToast';

function ChatPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState('');
  
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
    showToast(`User telah dilaporkan dengan alasan: ${reportReason}`, 'success');
    setShowReportPopup(false);
    setReportReason('');
  };

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', flex: 1 }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ marginTop: '72px', display: 'flex', height: 'calc(100vh - 72px)' }}>
          {/* Chat Sidebar */}
          <div style={{
            width: '320px',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            background: 'white'
          }}>
            <div style={{ padding: '24px 20px' }}>
              <h2 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '1.5rem', 
                fontWeight: 700,
                color: '#1a1f36'
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
                      background: selectedChat?.id === chat.id ? '#f7fafc' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: selectedChat?.id === chat.id ? '2px solid #667eea' : '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedChat?.id !== chat.id) {
                        e.currentTarget.style.background = '#f7fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChat?.id !== chat.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#1a1f36' }}>{chat.name}</span>
                      {chat.unread > 0 && (
                        <span style={{
                          background: '#667eea',
                          color: 'white',
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
                      color: '#6c757d',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {chat.lastMessage}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#a0aec0',
                      marginTop: '4px'
                    }}>
                      {chat.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            background: '#f7fafc'
          }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: '20px 32px',
                  background: 'white',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      color: 'white'
                    }}>
                      {selectedChat.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1f36' }}>
                        {selectedChat.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        Online
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleReport}
                    style={{
                      padding: '8px 16px',
                      background: '#fff5f5',
                      border: '2px solid #fc8181',
                      borderRadius: '8px',
                      color: '#c53030',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fc8181';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff5f5';
                      e.currentTarget.style.color = '#c53030';
                    }}
                  >
                    ⚠️ Report
                  </button>
                </div>

                {/* Messages Area */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '32px',
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
                        background: msg.sender === 'me' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                        color: msg.sender === 'me' ? 'white' : '#1a1f36',
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
                  background: 'white',
                  borderTop: '1px solid #e2e8f0'
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
                        border: '2px solid #e2e8f0',
                        borderRadius: '24px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '14px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '24px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      ➤ Kirim
                    </button>
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
                color: '#6c757d'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px', opacity: 0.3 }}>💬</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px', color: '#1a1f36' }}>
                  Pilih Chat
                </h3>
                <p style={{ fontSize: '1rem' }}>
                  Pilih chat dari sidebar untuk memulai percakapan
                </p>
              </div>
            )}
          </div>
        </div>
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
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.5' }}>
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
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            marginBottom: '20px',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: "'Inter', sans-serif",
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
