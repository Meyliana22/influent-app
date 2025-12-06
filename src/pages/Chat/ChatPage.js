import { Box, Typography, Button as MUIButton, TextField } from '@mui/material';
import TextsmsIcon from '@mui/icons-material/Textsms';
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "../../components/common";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import { COLORS } from "../../constants/colors";
import { useToast } from "../../hooks/useToast";
import { io } from "socket.io-client";

// Backend base url and socket URL (use same origin if possible)
const API_BASE = process.env.REACT_APP_API_URL || "https://influent-api-1fnn.vercel.app";
const SOCKET_URL = process.env.REACT_APP_API_URL || "https://influent-api-1fnn.vercel.app";

// small helper to decode JWT payload (no dependency)
function parseJwt(token) {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(
      atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload;
  } catch (e) {
    return null;
  }
}

function ChatPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [chatList, setChatList] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // responsive sidebar state
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // socket + messages
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]); // active room messages
  const [messagesLoading, setMessagesLoading] = useState(false); // waiting for history
  const [typingUsers, setTypingUsers] = useState({}); // { userId: true }
  const typingTimeoutRef = useRef(null);

  // message list scrolling
  const messagesEndRef = useRef(null);

  // currentUser: read token from localStorage and parse sub
  const token = localStorage.getItem("token");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.sub) setCurrentUserId(Number(payload.sub));
    }
  }, [token]);

  // scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // load my chats
  const loadChatList = async () => {
    setChatListLoading(true);
    if (!token) {
      // optionally redirect to login
      console.warn("No token — not fetching chat list");
      setChatList([]);
      setChatListLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat-rooms/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn("Failed to fetch chat list", await res.text());
        setChatList([]);
        setChatListLoading(false);
        return;
      }
      const data = await res.json();
      // normalize into sidebar items
      const normalized = data.map((row) => ({
        id: row.room.id ?? row.room.room_id ?? row.room.id,
        name: row.room.name ?? `Chat ${row.room.id}`,
        lastMessage: row.lastMessage
          ? row.lastMessage.message || row.lastMessage.text
          : "",
        time: row.lastMessage
          ? new Date(
              row.lastMessage.timestamp || row.lastMessage.created_at
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        unread: row.unreadCount || 0,
        raw: row.room,
      }));
      setChatList(normalized);
      setChatListLoading(false);
    } catch (err) {
      console.error("loadChatList error", err);
      setChatList([]);
      setChatListLoading(false);
    }
  };

  // load messages REST fallback (if you prefer)
  const loadMessagesForRoom = async (roomId) => {
    if (!token) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/chat-messages?chat_room_id=${roomId}&limit=200&order=ASC`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        console.warn("Failed to fetch messages", await res.text());
        setMessagesLoading(false);
        return;
      }
      const msgs = await res.json();
      // normalize incoming
      const normalized = msgs.map((m) => ({
        id: m.id ?? m.message_id,
        userId: m.user_id,
        roomId: m.chat_room_id,
        text: m.message,
        time: m.timestamp || m.created_at,
      }));
      setMessages(normalized);
      setMessagesLoading(false);
    } catch (err) {
      console.error("loadMessagesForRoom error", err);
      setMessagesLoading(false);
    }
  };

  // Initialize socket on mount (with auth token)
  useEffect(() => {
    if (!token) {
      console.warn("No token found, socket will not connect.");
      return;
    }

    // connect with token in auth handshake
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    const sock = socketRef.current;

    sock.on("connect", () => {
      console.log("Socket connected", sock.id);
    });

    sock.on("connect_error", (err) => {
      console.warn("Socket connect error", err.message || err);
    });

    sock.on("history", (msgs = []) => {
      // server sends DB messages
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          userId: m.user_id,
          roomId: m.chat_room_id,
          text: m.message,
          time: m.timestamp || m.created_at,
        }))
      );
      setMessagesLoading(false);
    });

    sock.on("message", (m) => {
      const normalized = {
        id: m.id,
        userId: m.user_id,
        roomId: m.chat_room_id,
        text: m.message,
        time: m.timestamp || m.created_at,
      };
      // If an optimistic message exists (temp-...), replace it instead of appending duplicate
      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (pm) =>
            String(pm.userId) === String(normalized.userId) &&
            pm.id &&
            String(pm.id).startsWith("temp-") &&
            pm.text === normalized.text
        );
        if (tempIndex !== -1) {
          const copy = [...prev];
          copy[tempIndex] = normalized;
          return copy;
        }
        return [...prev, normalized];
      });
      setSending(false);
      // update chat list lastMessage for UX
      setChatList((prevList) =>
        prevList.map((c) =>
          c.id === normalized.roomId
            ? {
                ...c,
                lastMessage: normalized.text,
                time: new Date(normalized.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }
            : c
        )
      );
    });

    sock.on("typing", ({ userId, typing }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (typing) next[userId] = true;
        else delete next[userId];
        return next;
      });
    });

    sock.on("error", (err) => {
      console.warn("Socket error", err);
    });

    return () => {
      sock.disconnect();
    };
  }, [token]);

  // load initial chat list once (and when token changes)
  useEffect(() => {
    loadChatList();
  }, [token]);

  // Join room when selectedChat changes
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;

    if (selectedChat) {
      setMessages([]); // clear while loading
      // Prefer receiving history over REST call
      sock.emit("joinRoom", { roomId: selectedChat.id });

      // Also refresh the sidebar after joining
      setTimeout(() => loadChatList(), 300); // small delay to allow lastMessage updates
    }
  }, [selectedChat]);

  // Send typing events (debounced)
  const sendTyping = useCallback((roomId) => {
    const sock = socketRef.current;
    if (!sock || !roomId) return;
    sock.emit("typing", { roomId, typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", { roomId, typing: false });
    }, 900);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedChat)
      return showToast("Pilih chat terlebih dahulu", "warning");
    if (!message.trim()) return;
    const sock = socketRef.current;
    const payload = { roomId: selectedChat.id, message: message.trim() };

    // optimistic update
    const optimistic = {
      id: `temp-${Date.now()}`,
      userId: currentUserId,
      roomId: selectedChat.id,
      text: message.trim(),
      time: new Date().toISOString(),
    };
    // setMessages((prev) => [...prev, optimistic]);

    try {
      sock.emit("message", payload);
      setMessage("");
      // refresh chat list so sidebar updates lastMessage/unread quickly
      setTimeout(() => loadChatList(), 300);
    } catch (err) {
      console.error("Send message error", err);
      showToast("Gagal mengirim pesan", "error");
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (selectedChat) sendTyping(selectedChat.id);
  };

  // helper for typing indicator text
  const typingIndicatorText = () => {
    const keys = Object.keys(typingUsers).filter(
      (k) => Number(k) !== Number(currentUserId)
    );
    if (keys.length === 0) return null;
    if (keys.length === 1) return "Sedang mengetik...";
    return "Beberapa orang sedang mengetik...";
  };

  // choose chat from list
  const onSelectChat = (chat) => {
    setSelectedChat(chat);
    // optionally mark messages read by calling a backend endpoint (if implemented)
    // fetch(`${API_BASE}/api/v1/chat-rooms/${chat.id}/read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }})
    // then refresh chatList to update unread counts
    // loadChatList();
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: !isMobile ? 32.5 : 0, flex: 1 }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box sx={{ mt: 9, display: 'flex', minHeight: 'calc(100vh - 72px)' }}>
          {/* Chat Sidebar */}
          <Box sx={{ width: 300, borderRight: '1px solid #e2e8f0', overflowY: 'auto', bgcolor: 'white' }}>
            <Box sx={{ pt: 3, pb: 3, px: 2.5 }}>
              <Typography variant="h4" fontWeight={700} color="#1a1f36" sx={{ mb: 2 }}>
                Chats
              </Typography>
              {/* Chat List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {chatList.length === 0 && (
                  <Typography color="#6c757d">Tidak ada chat</Typography>
                )}
                {chatList.map((chat) => (
                  <Box
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: selectedChat?.id === chat.id ? '#f7fafc' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: selectedChat?.id === chat.id ? '2px solid #667eea' : '2px solid transparent',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography fontWeight={600} color="#1a1f36">
                        {chat.name}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: '#6c757d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.lastMessage}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#a0aec0', mt: 0.5 }}>
                      {chat.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          {/* Chat content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f7fafc' }}>
            {selectedChat ? (
              <>
                {/* Header */}
                <Box sx={{ pt: 2.5, pb: 2.5, px: 4, bgcolor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white' }}>
                      {selectedChat.name.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography fontWeight={700} fontSize={16} color="#1a1f36">
                        {selectedChat.name}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#6c757d' }}>Online</Typography>
                    </Box>
                  </Box>
                  <MUIButton
                    onClick={() => setShowReportPopup(true)}
                    variant="outlined"
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: '#fff5f5',
                      border: '2px solid #fc8181',
                      borderRadius: 1,
                      color: '#c53030',
                      fontWeight: 600,
                      fontSize: 14,
                      '&:hover': { bgcolor: '#ffe5e5', borderColor: '#fc8181' },
                    }}
                  >
                    ⚠️ Report
                  </MUIButton>
                </Box>
                {/* Messages Area */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {messages.length === 0 && (
                    <Typography color="#6c757d">Belum ada pesan</Typography>
                  )}
                  {messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{ display: 'flex', justifyContent: msg.userId === currentUserId ? 'flex-end' : 'flex-start' }}
                    >
                      <Box
                        sx={{
                          maxWidth: '60%',
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: msg.userId === currentUserId ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                          color: msg.userId === currentUserId ? 'white' : '#1a1f36',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      >
                        <Typography sx={{ mb: 0.5 }}>{msg.text}</Typography>
                        <Typography sx={{ fontSize: 12, opacity: 0.7, textAlign: 'right' }}>
                          {new Date(msg.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                  {typingIndicatorText() && (
                    <Typography color="#6c757d" fontSize={14}>
                      {typingIndicatorText()}
                    </Typography>
                  )}
                </Box>
                {/* Message Input */}
                <Box sx={{ pt: 2.5, pb: 2.5, px: 4, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                  <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      type="text"
                      value={message}
                      onChange={handleInputChange}
                      placeholder="Ketik pesan..."
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: 16,
                          px: 2,
                          py: 1,
                        },
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                    <MUIButton
                      type="submit"
                      sx={{
                        px: 2.5,
                        py: 1,
                        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: 3,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 15,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', opacity: 0.9 },
                      }}
                    >
                      ➤ Kirim
                    </MUIButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#6c757d' }}>
                <TextsmsIcon sx={{ fontSize: 40, mb: 2, opacity: 0.3 }} />
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: '#1a1f36', fontSize: 18 }}>
                  Pilih Chat
                </Typography>
                <Typography sx={{ fontSize: 15 }}>
                  Pilih chat dari  untuk memulai percakapan
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      {/* Report Popup */}
      <Modal
        isOpen={showReportPopup}
        onClose={() => setShowReportPopup(false)}
        title="Report User"
        variant="danger"
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography sx={{ fontSize: 32, mb: 2 }}>⚠️</Typography>
          <Typography sx={{ color: '#6c757d', fontSize: 15, lineHeight: 1.5 }}>
            Mengapa Anda ingin melaporkan user ini?
          </Typography>
        </Box>
        <TextField
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="Jelaskan alasan pelaporan..."
          multiline
          rows={4}
          fullWidth
          sx={{ mb: 2, fontSize: 15 }}
        />
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <MUIButton
            variant="outlined"
            onClick={() => setShowReportPopup(false)}
            fullWidth
            sx={{ fontSize: 15, py: 1 }}
          >
            Batal
          </MUIButton>
          <MUIButton
            variant="contained"
            color="error"
            onClick={() => {
              showToast(`User telah dilaporkan: ${reportReason}`, 'success');
              setShowReportPopup(false);
              setReportReason('');
            }}
            disabled={!reportReason.trim()}
            fullWidth
            sx={{ fontSize: 15, py: 1 }}
          >
            Laporkan
          </MUIButton>
        </Box>
      </Modal>
    </Box>
  );
}

export default ChatPage;
