/**
 * Notification API Service
 * Handles all API calls related to notifications
 */

import authFetch from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get all notifications for current user
 * @param {Object} params - Query parameters (is_read, sort, order)
 */
export const getNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.is_read !== undefined) queryParams.append('is_read', params.is_read);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

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
 * Get unread notifications
 */
export const getUnreadNotifications = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/notifications/unread`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
};

/**
 * Get unread notification count (for badge)
 * Wrapper around getUnreadNotifications
 */
export const getUnreadCount = async () => {
  try {
    const response = await getUnreadNotifications();
    // Handle both array response and { data: [] } response structure
    const notifications = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
    return notifications.length;
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
      method: 'PUT',
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
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
