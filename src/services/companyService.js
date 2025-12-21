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

const companyService = {
  createProfile: async (profileData) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/umkm/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error creating company profile:", error);
      throw error;
    }
  },

  // Removed getProfile as data comes from /auth/me

  updateProfile: async (userId, profileData) => {
    try {
      // Map company specific fields to generic User fields
      const apiData = {
          name: profileData.business_name,
          // If owner_name corresponds to username or just part of description? 
          // For now, we only map safe fields.
          phone_number: profileData.phone_number,
          address: profileData.address,
          description: profileData.description
      };

      const response = await authFetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error updating company profile:", error);
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
  }
};

export default companyService;
