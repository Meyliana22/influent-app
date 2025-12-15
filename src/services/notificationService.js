/**
 * Notification API Service
 * Handles all API calls related to notifications
 */

import authFetch from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get all notifications for current user
 * @param {Object} params - Query parameters (page, limit, is_read, type)
 */
export const getNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.is_read !== undefined) queryParams.append('is_read', params.is_read);
    if (params.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/notifications${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count (for badge)
 */
export const getUnreadCount = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/notifications/unread-count`);
    const data = await response.json();
    return data.unread_count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Mark specific notification as read
 * @param {number} notificationId
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {number} notificationId
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
