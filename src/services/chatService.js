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
      const response = await authFetch(`${API_BASE_URL}/chat-rooms/mine`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      throw error;
    }
};

export default {
  createChatRoom,
  getMyChatRooms
};
