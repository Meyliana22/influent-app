// Authentication service for handling login, register, and token management

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * Parse JWT token to get payload
 * @param {string} token 
 * @returns {Object|null} Decoded token payload
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * API Response Helper
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  
  return data;
}

/**
 * Check whether a JWT is expired (uses `exp` claim). Adds a small offset to
 * avoid expiry during network calls.
 * @param {string} token
 * @param {number} offsetSeconds seconds of leeway (default 10s)
 * @returns {boolean} true if expired or invalid
 */
export function isTokenExpired(token, offsetSeconds = 10) {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const now = Date.now() / 1000;
  return now > payload.exp - offsetSeconds;
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

/**
 * Ensure that a token exists and is not expired. Does NOT attempt to refresh.
 * Returns true when token exists and not expired; false otherwise.
 */
export function ensureValidToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Login user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Response with token and user data
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store token and user data
  if (data.token || data.access_token) {
    const token = data.token || data.access_token;
    localStorage.setItem('token', token);
    
    // Parse user data from response or token
    const userData = data.user || data.data || parseJwt(token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // Store refresh token if provided
    if (data.refresh_token) {
      localStorage.setItem('refreshToken', data.refresh_token);
    }
  }
  
  return data;
}

/**
 * Register new user
 * @param {Object} userData - { name, email, password, role }
 * @returns {Promise<Object>} Response with success message
 */
export async function register(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return await response.json();
}

/**
 * Verify email with OTP
 * @param {string} email - User email
 * @param {string} otp - Verification code
 * @returns {Promise<Object>} Response with verification status
 */
export async function verifyEmail(email, otp) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Verification failed');
  }

  return await response.json();
}

/**
 * Request password reset
 * @param {string} email 
 * @returns {Promise<Object>} Response with success message
 */
export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send reset email');
  }

  return await response.json();
}

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response with success message
 */
export async function resetPassword(token, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password: newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reset password');
  }

  return await response.json();
}

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user data');
  }

  return await response.json();
}

/**
 * Logout user
 */
export function logout() {
  clearAuth();
  window.location.href = '/login';
}

const authService = {
  parseJwt,
  isTokenExpired,
  clearAuth,
  ensureValidToken,
  login,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  logout,
};

export default authService;
