import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import {
  Send as SendIcon,
  Search as SearchIcon,
  Report as ReportIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  SupportAgent as SupportAgentIcon,
  Cancel as EndSessionIcon,
} from "@mui/icons-material";
import { createAdminChat, endChatSession } from "../../services/chatService";

import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import { useToast } from "../../hooks/useToast";
import { io } from "socket.io-client";

// Backend base url and socket URL
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

// Helper to decode JWT payload
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
  const { showToast } = useToast();
  const theme = useTheme();
  // We'll treat < 1000px as "mobile" to match Sidebar.js logic exactly
  // Sidebar.js uses window.innerWidth < 1000
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 1000);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Existing sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  // Chat Data State
  const [chatList, setChatList] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  
  // Message State
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Operational State
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  
  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auth State
  const token = localStorage.getItem("token");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
          if (payload.sub) setCurrentUserId(Number(payload.sub));
          // Assuming role is in payload.role or payload.user_role
          // Adjust based on your actual JWT structure
          setUserRole(payload.role || payload.user_role || 'user');
      }
    }
  }, [token]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load My Chats
  const loadChatList = async () => {
    setChatListLoading(true);
    if (!token) {
      console.warn("No token — not fetching chat list");
      setChatList([]);
      setChatListLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/chat-rooms/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn("Failed to fetch chat list", await res.text());
        setChatList([]);
        setChatListLoading(false);
        return;
      }
      const data = await res.json();
      const normalized = data.data.map((row) => ({
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
        timestamp: row.lastMessage
          ? new Date(row.lastMessage.timestamp || row.lastMessage.created_at).getTime()
          : 0,
        unread: row.unreadCount || 0,
        profileImage: row.otherUser?.profile_image || row.otherUser?.profile_picture || null,
        raw: row.room,
      }));
      
      // Sort: Newest first
      normalized.sort((a, b) => b.timestamp - a.timestamp);

      setChatList(normalized);
      setChatListLoading(false);
    } catch (err) {
      console.error("loadChatList error", err);
      setChatList([]);
      setChatListLoading(false);
    }
  };

  // Socket Connection
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    const sock = socketRef.current;

    sock.on("connect", () => {
      console.log("Socket connected", sock.id);
    });

    sock.on("history", (msgs = []) => {
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
      setMessages((prev) => {
        // Dedup logic vs optimistic
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

      // Update chat list snippet
      setChatList((prevList) => {
        const updated = prevList.map((c) =>
          c.id === normalized.roomId
            ? {
                ...c,
                lastMessage: normalized.text,
                time: new Date(normalized.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                timestamp: new Date(normalized.time).getTime(),
              }
            : c
        );
        return updated.sort((a, b) => b.timestamp - a.timestamp);
      });
    });

    sock.on("typing", ({ userId, typing }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (typing) next[userId] = true;
        else delete next[userId];
        return next;
      });
    });

    return () => {
      sock.disconnect();
    };
  }, [token]);

  // Initial Load
  useEffect(() => {
    loadChatList();
  }, [token]);

  // Join Room
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;

    if (selectedChat) {
      setMessages([]);
      setMessagesLoading(true);
      sock.emit("joinRoom", { roomId: selectedChat.id });
      setTimeout(() => loadChatList(), 300);
    }
  }, [selectedChat]);

  // Handle Typing
  const sendTyping = useCallback((roomId) => {
    const sock = socketRef.current;
    if (!sock || !roomId) return;
    sock.emit("typing", { roomId, typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", { roomId, typing: false });
    }, 900);
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (selectedChat) sendTyping(selectedChat.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedChat) return showToast("Pilih chat terlebih dahulu", "warning");
    if (!message.trim()) return;

    const sock = socketRef.current;
    const payload = { roomId: selectedChat.id, message: message.trim() };

    // Optimistic update
    const optimistic = {
      id: `temp-${Date.now()}`,
      userId: currentUserId,
      roomId: selectedChat.id,
      text: message.trim(),
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    
    try {
      sock.emit("message", payload);
      setMessage("");
      setTimeout(() => loadChatList(), 300);
    } catch (err) {
      console.error("Send error", err);
      showToast("Gagal mengirim pesan", "error");
    }
  };

  const handleAdminChat = async () => {
    try {
      const res = await createAdminChat();
      if (res && (res.room || res.data)) {
        const room = res.room || res.data;
        // Check if room already in list
        const exists = chatList.find((c) => c.id === room.id);
        if (!exists) {
            // Refresh list to pull new room
            await loadChatList();
        }
        // Ideally we would want to select the chat immediately
        // But for now, a refresh and user selection or a toast is fine
        // If we want to auto-select, we need the normalized object
        showToast("Ruang pesan dengan pusat bantuan berhasil dibuat", "success");
        loadChatList(); // Reload to ensure we get the room
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal membuat pesan dengan pusat bantuan", "error");
    }
  };

  const handleEndSession = async () => {
    if (!selectedChat) return;
    if (!window.confirm("Apakah Anda yakin ingin mengakhiri sesi chat ini?")) return;
    try {
        await endChatSession(selectedChat.id);
        showToast("Sesi chat telah diakhiri", "success");
        // Update local state to reflect closed status
        setSelectedChat(prev => ({ ...prev, raw: { ...prev.raw, status: 'closed' } })); 
        // Also update list if needed
        loadChatList();
    } catch (err) {
        console.error(err);
        showToast("Gagal mengakhiri sesi", "error");
    }
  };

  const isChatClosed = selectedChat?.raw?.status === 'closed';

  const typingIndicatorText = () => {
    const keys = Object.keys(typingUsers).filter(
      (k) => Number(k) !== Number(currentUserId)
    );
    if (keys.length === 0) return null;
    if (keys.length === 1) return "Sedang mengetik...";
    return "Beberapa orang sedang mengetik...";
  };

  // --- UI Components ---
  
  // Sidebar List
  const ChatListComponent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">Pesan</Typography>
        {/* Optional Search Bar */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="Cari..."
          fullWidth
          sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
          }}
        />
      </Box>
      <Box sx={{ p: 2, pt: 0, borderBottom: 1, borderColor: 'divider' }}>
        {userRole !== 'admin' && (
            <Button
            fullWidth
            variant="outlined"
            startIcon={<SupportAgentIcon />}
            onClick={handleAdminChat}
            sx={{ mb: 1 }}
            >
            Pusat Bantuan
            </Button>
        )}
      </Box>
      <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
        {chatList.length === 0 && !chatListLoading && (
           <Box p={3} textAlign="center">
             <Typography variant="body2" color="text.secondary">Tidak ada pesan</Typography>
           </Box>
        )}
        {chatList.map((chat) => (
          <ListItemButton
            key={chat.id}
            selected={selectedChat?.id === chat.id}
            onClick={() => {
              setSelectedChat(chat);
            }}
            sx={{
              borderLeft: selectedChat?.id === chat.id ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              '&.Mui-selected': { bgcolor: 'primary.50' }
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }} src={chat.profileImage}>{chat.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between">
                   <Typography variant="subtitle2" fontWeight="bold" noWrap>{chat.name}</Typography>
                   <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{chat.time}</Typography>
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" noWrap>
                  {chat.lastMessage}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f6f8' }}>
      {/* App Shell Sidebar  */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        height: '100vh',
        overflow: 'hidden',
        marginLeft: !isMobileScreen ? '260px' : '0',
        width: !isMobileScreen ? 'calc(100% - 260px)' : '100%',
      }}>
        {/* Topbar */}
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* content Area (below topbar) */}
        <Box sx={{ flex: 1, display: 'flex', mt: '72px', overflow: 'hidden' }}>
          
          {/* Chat List Sidebar (Panel) */}
          <Paper
            elevation={selectedChat && isMobileScreen ? 0 : 2}
            sx={{
              width: { xs: '100%', md: 350 },
              borderRadius: 0,
              display: (selectedChat && isMobileScreen) ? 'none' : 'flex',
              flexDirection: 'column',
              zIndex: 1,
              borderRight: 1,
              borderColor: 'divider'
            }}
          >
            {ChatListComponent}
          </Paper>

          {/* Chat Window */}
          {selectedChat ? (
             <Box sx={{ 
               flex: 1, 
               display: 'flex', 
               flexDirection: 'column', 
               position: 'relative',
               bgcolor: '#fff',
             }}>
               {/* Chat Header */}
               <Paper 
                 elevation={1} 
                 sx={{ 
                   p: 2, 
                   display: 'flex', 
                   alignItems: 'center', 
                   borderRadius: 0, 
                   zIndex: 2,
                   borderBottom: 1,
                   borderColor: 'divider'
                 }}
               >
                  {isMobileScreen && (
                    <IconButton edge="start" onClick={() => setSelectedChat(null)} sx={{ mr: 1 }}>
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }} src={selectedChat.profileImage}>{selectedChat.name.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{selectedChat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Online</Typography>
                  </Box>
                
                  
                  {userRole === 'admin' && !isChatClosed && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<EndSessionIcon />}
                        onClick={handleEndSession}
                      >
                        Akhiri Sesi
                      </Button>
                  )}
               </Paper>

               {/* Messages */}
               <Box 
                 sx={{ 
                   flex: 1, 
                   overflowY: 'auto', 
                   p: 3, 
                   display: 'flex', 
                   flexDirection: 'column',
                   bgcolor: '#f9f9f9'
                 }}
               >
                 {messages.length === 0 && !messagesLoading && (
                   <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.6 }}>
                     <Typography>Belum ada pesan</Typography>
                   </Box>
                 )}
                 {messages.map((msg) => {
                    const isOwn = msg.userId === currentUserId;
                    return (
                      <Box 
                        key={msg.id} 
                        sx={{ 
                          alignSelf: isOwn ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          mb: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwn ? 'flex-end' : 'flex-start'
                        }}
                      >
                         <Paper 
                           elevation={1}
                           sx={{
                             p: 2,
                             borderRadius: 2,
                             bgcolor: isOwn ? 'primary.main' : 'common.white',
                             color: isOwn ? 'primary.contrastText' : 'text.primary',
                             borderBottomRightRadius: isOwn ? 0 : 2,
                             borderBottomLeftRadius: isOwn ? 2 : 0
                           }}
                         >
                            <Typography variant="body1">{msg.text}</Typography>
                         </Paper>
                         <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </Typography>
                      </Box>
                    );
                 })}
                 <div ref={messagesEndRef} />
                 {typingIndicatorText() && (
                   <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                     {typingIndicatorText()}
                   </Typography>
                 )}
               </Box>

               {/* Input Area */}
               {isChatClosed ? (
                   <Box sx={{ p: 2, bgcolor: '#f0f0f0', textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
                       <Typography variant="body2" color="text.secondary">
                           Sesi chat ini telah berakhir.
                       </Typography>
                   </Box>
               ) : (
                <Paper 
                  component="form" 
                  onSubmit={handleSendMessage}
                 elevation={3}
                 sx={{ 
                   p: 2, 
                   borderTop: 1, 
                   borderColor: 'divider', 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: 2 
                 }}
               >
                 <TextField
                   fullWidth
                   placeholder="Ketik pesan..."
                   value={message}
                   onChange={handleInputChange}
                   variant="outlined"
                   size="small"
                   sx={{ 
                      '& .MuiOutlinedInput-root': { borderRadius: 4 }
                   }}
                 />
                 <IconButton 
                   color="primary" 
                   type="submit" 
                   sx={{ 
                     bgcolor: 'primary.main', 
                     color: 'white', 
                     '&:hover': { bgcolor: 'primary.dark' },
                     width: 45,
                     height: 45
                   }}
                   disabled={!message.trim()}
                 >
                   <SendIcon fontSize="small" />
                 </IconButton>
                </Paper>
               )}
             </Box>
          ) : (
            // No Chat Selected Placeholder
            <Box sx={{ 
              flex: 1, 
              display: { xs: 'none', md: 'flex' }, 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: '#fafafa',
              color: 'text.secondary'
            }}>
               <Typography variant="h1" sx={{ opacity: 0.2 }}>💬</Typography>
               <Typography variant="h5" sx={{ mt: 2 }}>Pilih Pesan</Typography>
               <Typography variant="body1">Pilih untuk melihat riwayat percakapan.</Typography>
            </Box>
          )}

        </Box>
      </Box>
      
      {/* Report Dialog */}
      <Dialog 
        open={showReportPopup} 
        onClose={() => setShowReportPopup(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
           <WarningIcon color="error" sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
           Laporkan Pengguna
        </DialogTitle>
        <DialogContent>
           <DialogContentText textAlign="center" sx={{ mb: 2 }}>
             Apa alasan Anda melaporkan pengguna ini? Laporan akan ditinjau oleh tim kami.
           </DialogContentText>
           <TextField
             autoFocus
             margin="dense"
             label="Alasan Pelaporan"
             fullWidth
             multiline
             rows={4}
             variant="outlined"
             value={reportReason}
             onChange={(e) => setReportReason(e.target.value)}
           />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => setShowReportPopup(false)} variant="outlined">Batal</Button>
          <Button 
            onClick={() => {
               showToast(`User telah dilaporkan: ${reportReason}`, "success");
               setShowReportPopup(false);
               setReportReason("");
            }} 
            variant="contained" 
            color="error"
            disabled={!reportReason.trim()}
          >
            Laporkan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatPage;