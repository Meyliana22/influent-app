/**
 * Admin Review Service
 * Handles all API calls related to admin campaign review
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * API Response Helper
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  
  return data;
};

/**
 * Get campaigns pending admin review
 */
export const getPendingReviewCampaigns = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    const queryParams = new URLSearchParams({
      limit: params.limit || 20,
      ...params,
    });

    const response = await fetch(`${API_BASE_URL}/admin/campaigns/pending?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching pending campaigns:", error);
    throw error;
  }
};

/**
 * Approve a campaign
 */
export const approveCampaign = async (campaignId) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("Error approving campaign:", error);
    throw error;
  }
};

/**
 * Reject a campaign
 */
export const rejectCampaign = async (campaignId, rejectionReason) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error("Error rejecting campaign:", error);
    throw error;
  }
};

const adminReviewService = {
  getPendingReviewCampaigns,
  approveCampaign,
  rejectCampaign,
};

export default adminReviewService;
