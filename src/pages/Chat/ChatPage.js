import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "../../components/common";
import UMKMSidebar from "../../components/umkm/UMKMSidebar";
import UMKMTopbar from "../../components/umkm/UMKMTopbar"; // fixed import
import { COLORS } from "../../constants/colors";
import { useToast } from "../../hooks/useToast";
import { io } from "socket.io-client";

// Backend base url and socket URL (use same origin if possible)
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

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
    <div style={{ display: "flex", fontFamily: "'Inter', sans-serif" }}>
      <UMKMSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div style={{ marginLeft: !isMobile ? "260px" : "0", flex: 1 }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div
          style={{
            marginTop: "72px",
            display: "flex",
            height: "calc(100vh - 72px)",
          }}
        >
          {/* Chat Sidebar */}
          <div
            style={{
              width: "320px",
              borderRight: "1px solid #e2e8f0",
              overflowY: "auto",
              background: "white",
            }}
          >
            <div style={{ padding: "24px 20px" }}>
              <h2
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#1a1f36",
                }}
              >
                Chats
              </h2>

              {/* Chat List */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {chatList.length === 0 && (
                  <div style={{ color: "#6c757d" }}>Tidak ada chat</div>
                )}
                {chatList.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background:
                        selectedChat?.id === chat.id
                          ? "#f7fafc"
                          : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border:
                        selectedChat?.id === chat.id
                          ? "2px solid #667eea"
                          : "2px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#1a1f36" }}>
                        {chat.name}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#6c757d",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.lastMessage}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#a0aec0",
                        marginTop: "4px",
                      }}
                    >
                      {chat.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#f7fafc",
            }}
          >
            {selectedChat ? (
              <>
                {/* Header */}
                <div
                  style={{
                    padding: "20px 32px",
                    background: "white",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        color: "white",
                      }}
                    >
                      {selectedChat.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: "#1a1f36",
                        }}
                      >
                        {selectedChat.name}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                        Online
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReportPopup(true)}
                    style={{
                      padding: "8px 16px",
                      background: "#fff5f5",
                      border: "2px solid #fc8181",
                      borderRadius: "8px",
                      color: "#c53030",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    ⚠️ Report
                  </button>
                </div>

                {/* Messages Area */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {messages.length === 0 && (
                    <div style={{ color: "#6c757d" }}>Belum ada pesan</div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.userId === currentUserId
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "60%",
                          padding: "12px 16px",
                          borderRadius: "16px",
                          background:
                            msg.userId === currentUserId
                              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              : "white",
                          color:
                            msg.userId === currentUserId ? "white" : "#1a1f36",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div style={{ marginBottom: "4px" }}>{msg.text}</div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            opacity: 0.7,
                            textAlign: "right",
                          }}
                        >
                          {new Date(msg.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                  {typingIndicatorText() && (
                    <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>
                      {typingIndicatorText()}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div
                  style={{
                    padding: "20px 32px",
                    background: "white",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <form
                    onSubmit={handleSendMessage}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      value={message}
                      onChange={handleInputChange}
                      placeholder="Ketik pesan..."
                      style={{
                        flex: 1,
                        padding: "14px 20px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "24px",
                        fontSize: "1rem",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: "14px 24px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "24px",
                        color: "white",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                      }}
                    >
                      ➤ Kirim
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  color: "#6c757d",
                }}
              >
                <div
                  style={{
                    fontSize: "5rem",
                    marginBottom: "16px",
                    opacity: 0.3,
                  }}
                >
                  💬
                </div>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#1a1f36",
                  }}
                >
                  Pilih Chat
                </h3>
                <p style={{ fontSize: "1rem" }}>
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
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>⚠️</div>
          <p
            style={{
              margin: 0,
              color: "#6c757d",
              fontSize: "0.95rem",
              lineHeight: "1.5",
            }}
          >
            Mengapa Anda ingin melaporkan user ini?
          </p>
        </div>
        <textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="Jelaskan alasan pelaporan..."
          rows="4"
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "0.95rem",
            marginBottom: "20px",
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "'Inter', sans-serif",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button
            variant="outline"
            onClick={() => setShowReportPopup(false)}
            fullWidth
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              showToast(`User telah dilaporkan: ${reportReason}`, "success");
              setShowReportPopup(false);
              setReportReason("");
            }}
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
