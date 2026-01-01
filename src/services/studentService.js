import authFetch from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  return data;
};

const studentService = {
  createProfile: async (profileData) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error creating student profile:", error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/students/`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      throw error;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/students/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error updating student profile:", error);
      throw error;
    }
  },

  updateProfileImage: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profile_image', imageFile);

      const response = await authFetch(`${API_BASE_URL}/upload/user/${userId}/profile`, {
        method: 'POST',
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw error;
    }
  },

  connectInstagram: async (code) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/students/instagram/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error connecting Instagram:", error);
      throw error;
    }
  },

  uploadKtm: async (file) => {
    try {
      const formData = new FormData();
      formData.append('ktm', file);

      const response = await authFetch(`${API_BASE_URL}/students/upload-ktm`, {
        method: 'POST',
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error uploading KTM:", error);
      throw error;
    }
  }
};

export default studentService;
