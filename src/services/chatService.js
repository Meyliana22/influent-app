/**
 * Chat API Service
 * Handles all API calls related to chat functionality
 */

import authFetch from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * API Response Helper
 */
const handleResponse = async (response) => {
  const data = await response.json();
  return data;
};

/**
 * Create a new chat room
 * Payload: { name?: "string", type: "private" | "group", participants: number[] }
 */
export const createChatRoom = async (data) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/chat-rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

/**
 * Get user's chat rooms
 */
export const getMyChatRooms = async () => {
    try {
      console.log(API_BASE_URL)
      const response = await authFetch(`${API_BASE_URL}/chat-rooms/mine`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      throw error;
    }
};

/**
 * Create a chat with an admin
 */
export const createAdminChat = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/chat-rooms/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating admin chat:", error);
    throw error;
  }
};

/**
 * Join an existing chat room
 * @param {number} roomId 
 */
export const joinChatRoom = async (roomId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/chat-rooms/${roomId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error joining chat room:", error);
    throw error;
  }
};

/**
 * End a chat session
 * @param {number} roomId 
 */
export const endChatSession = async (roomId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/chat-rooms/${roomId}/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error ending chat session:", error);
    throw error;
  }
};

export default {
  createChatRoom,
  getMyChatRooms,
  createAdminChat,
  joinChatRoom,
  endChatSession
};
