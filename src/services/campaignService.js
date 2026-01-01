/**
 * Campaign API Service
 * Handles all API calls related to campaigns
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

export const payment = async (params = {}) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

/**
 * Get all campaigns with optional filters
 */
export const getCampaigns = async (params = {}) => {
  try {
    // Build query object from all params
    let queryObj = {};
    
    Object.keys(params).forEach(key => {
      if (key === 'sort' && typeof params[key] === 'string' && params[key].includes(':')) {
        // Split "created_at:desc" into sort and order
        const [sortField, orderDir] = params[key].split(':');
        queryObj.sort = sortField;
        queryObj.order = orderDir;
      } else {
        queryObj[key] = params[key];
      }
    });
    
    // Default limit if not provided
    if (!queryObj.limit) {
      queryObj.limit = 50;
    }
    
    const queryParams = new URLSearchParams(queryObj);
    console.log('🌐 Final API URL:', `${API_BASE_URL}/campaigns?${queryParams}`);

    const response = await authFetch(`${API_BASE_URL}/campaigns?${queryParams}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

/**
 * Get campaigns by category
 */
export const getCampaignsByCategory = async (category, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      limit: params.limit || 50,
      ...params,
    });

    const response = await fetch(`${API_BASE_URL}/campaigns/category/${encodeURIComponent(category)}?${queryParams}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching campaigns by category:', error);
    throw error;
  }
};

/**
 * Get single campaign by ID
 */
export const getCampaignById = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${campaignId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    throw error;
  }
};

/**
 * Upload campaign banner
 */
export const uploadBanner = async (campaignId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('banner_image', imageFile);

    const response = await authFetch(`${API_BASE_URL}/upload/campaign/${campaignId}/banner`, {
      method: "POST",
      body: formData,
      // Note: Do not set Content-Type header when sending FormData, 
      // let browser set it with boundary
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error uploading banner:", error);
    throw error;
  }
};

/**
 * Apply to a campaign
 */
export const applyToCampaign = async (data) => {
  try {
    const payload = {
      campaign_id: data.campaign_id,
      student_id: data.student_id,
      application_status: "pending",
      application_notes: data.application_notes || "",
      // accepted_at: null,
      // rejected_at: null
    };

    const response = await authFetch(`${API_BASE_URL}/campaign-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error applying to campaign:", error);
    throw error;
  }
};

/**
 * Get campaign users (my applications)
 */
export const getCampaignUsers = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-users?order=desc&sort=applied_at`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching campaign users:", error);
    throw error;
  }
};

/**
 * Update campaign user (cancel application etc)
 */
export const updateCampaignUser = async (id, data) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error updating campaign user:", error);
    throw error;
  }
};

/**
 * cancel campaign user (cancel application etc)
 */
export const cancelCampaignUser = async (id) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-users/${id}`, {
      method: "DELETE",
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error canceling campaign user:", error);
    throw error;
  }
};

/**
 * Upload campaign references
 */
export const uploadCampaignReferences = async (campaignId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('reference_images', file);
    });

    const response = await authFetch(`${API_BASE_URL}/upload/campaign/${campaignId}/references`, {
      method: "POST",
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error uploading references:", error);
    throw error;
  }
};

/**
 * Create new campaign
 */
export const createCampaign = async (campaignData) => {
  console.log(campaignData);
  try {
    // Map frontend data to API format
    const apiData = {
      title: campaignData.title,
      campaign_category: campaignData.campaignCategory || null,
      influencer_category: Array.isArray(campaignData.category)
        ? JSON.stringify(campaignData.category)
        : campaignData.category
        ? JSON.stringify([campaignData.category])
        : null,
      has_product: campaignData.hasProduct || false,
      product_name: campaignData.productName || null,
      product_value: campaignData.productValue
        ? parseInt(campaignData.productValue)
        : null,
      product_desc: campaignData.productDesc || null,
      description: campaignData.productDesc || null,
      start_date: campaignData.start_date || null,
      end_date: campaignData.end_date || null,
      registration_deadline: campaignData.registration_deadline || null,
      submission_deadline: campaignData.submission_deadline || null,
      revision_duration: campaignData.revision_duration
        ? parseInt(campaignData.revision_duration)
        : null,
      max_revisions: campaignData.max_revisions
        ? parseInt(campaignData.max_revisions)
        : 1,
      enable_revision:
        campaignData.enable_revision !== undefined
          ? campaignData.enable_revision
          : true,
      content_guidelines: campaignData.content_guidelines || null,
      caption_guidelines: campaignData.caption_guidelines || null,
      content_reference: campaignData.contentReference || null,
      influencer_count: campaignData.influencer_count || 1,
      price_per_post: campaignData.price_per_post
        ? parseInt(campaignData.price_per_post)
        : null,
      min_followers: campaignData.min_followers
        ? parseInt(campaignData.min_followers)
        : null,
      is_free: campaignData.isFree || false,
      selected_gender: campaignData.selectedGender || null,
      selected_age: Array.isArray(campaignData.selectedAge)
        ? JSON.stringify(campaignData.selectedAge)
        : campaignData.selectedAge || null,
      criteria_desc: campaignData.criteriaDesc || null,
      banner_image: campaignData.image || null,
      reference_images: campaignData.referenceFiles
        ? JSON.stringify(campaignData.referenceFiles)
        : null,
      status:campaignData.status == "draft" ? "draft" : "admin_review", // Default to inactive (unpaid)
      content_types:
        campaignData.contentItems && campaignData.contentItems.length > 0
          ? JSON.stringify(
              campaignData.contentItems.map((item) => ({
                content_type: item.content_type,
                post_count: item.post_count,
              }))
            )
          : null,
    };
    console.log(apiData);
    const response = await authFetch(`${API_BASE_URL}/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    const result = await handleResponse(response);
    return result;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};

/**
 * Update existing campaign
 */
export const updateCampaign = async (campaignId, campaignData) => {
  try {
    // Map frontend data to API format
    const apiData = {
      title: campaignData.title,
      campaign_category: campaignData.campaignCategory || null,
      influencer_category: Array.isArray(campaignData.category)
        ? JSON.stringify(campaignData.category)
        : campaignData.category
        ? JSON.stringify([campaignData.category])
        : null,
      has_product: campaignData.hasProduct || false,
      product_name: campaignData.productName || null,
      product_value: campaignData.productValue
        ? parseInt(campaignData.productValue)
        : null,
      product_desc: campaignData.productDesc || null,
      description: campaignData.productDesc || null,
      start_date: campaignData.start_date || null,
      end_date: campaignData.end_date || null,
      registration_deadline: campaignData.registration_deadline || null,
      submission_deadline: campaignData.submission_deadline || null,
      revision_duration: campaignData.revision_duration
        ? parseInt(campaignData.revision_duration)
        : null,
      max_revisions: campaignData.max_revisions
        ? parseInt(campaignData.max_revisions)
        : 1,
      enable_revision:
        campaignData.enable_revision !== undefined
          ? campaignData.enable_revision
          : true,
      content_guidelines: campaignData.content_guidelines || null,
      caption_guidelines: campaignData.caption_guidelines || null,
      content_reference: campaignData.contentReference || null,
      influencer_count: campaignData.influencer_count || 1,
      price_per_post: campaignData.price_per_post
        ? parseInt(campaignData.price_per_post)
        : null,
      min_followers: campaignData.min_followers
        ? parseInt(campaignData.min_followers)
        : null,
      is_free: campaignData.isFree || false,
      selected_gender: campaignData.selectedGender || null,
      selected_age: Array.isArray(campaignData.selectedAge)
        ? JSON.stringify(campaignData.selectedAge)
        : campaignData.selectedAge || null,
      criteria_desc: campaignData.criteriaDesc || null,
      banner_image: campaignData.image || null,
      reference_images: campaignData.referenceFiles
        ? JSON.stringify(campaignData.referenceFiles)
        : null,
      status: campaignData.status || "inactive", // Default to inactive (unpaid)
      content_types:
        campaignData.contentItems && campaignData.contentItems.length > 0
          ? JSON.stringify(
              campaignData.contentItems.map((item) => ({
                content_type: item.content_type,
                post_count: item.post_count,
              }))
            )
          : null,
    };

    const response = await authFetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw error;
  }
};

/**
 * Delete campaign
 */
export const deleteCampaign = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
      method: "DELETE",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
};

/**
 * Map API campaign data to frontend format
 */
export const mapApiToFrontend = (apiCampaign) => {
  return {
    campaign_id: apiCampaign.campaign_id,
    title: apiCampaign.title || "",
    campaignCategory: apiCampaign.campaign_category || "",
    category: apiCampaign.influencer_category
      ? apiCampaign.influencer_category.split(",").map((c) => c.trim())
      : [],
    hasProduct: apiCampaign.has_product || false,
    productName: apiCampaign.product_name || "",
    productValue: apiCampaign.product_value
      ? String(apiCampaign.product_value)
      : "",
    productDesc: apiCampaign.product_desc || "",
    start_date: apiCampaign.start_date
      ? apiCampaign.start_date.split("T")[0]
      : "",
    end_date: apiCampaign.end_date ? apiCampaign.end_date.split("T")[0] : "",
    submission_deadline: apiCampaign.submission_deadline
      ? apiCampaign.submission_deadline.split("T")[0]
      : "",
    content_guidelines: apiCampaign.content_guidelines || "",
    caption_guidelines: apiCampaign.caption_guidelines || "",
    content_reference: apiCampaign.content_reference || "",
    influencer_count: apiCampaign.influencer_count || 1,
    price_per_post: apiCampaign.price_per_post
      ? String(apiCampaign.price_per_post)
      : "",
    min_followers: apiCampaign.min_followers
      ? String(apiCampaign.min_followers)
      : "",
    selectedGender: apiCampaign.selected_gender || "",
    selectedAge: apiCampaign.selected_age || "",
    criteriaDesc: apiCampaign.criteria_desc || "",
    contentItems:
      apiCampaign.contentTypes && apiCampaign.contentTypes.length > 0
        ? apiCampaign.contentTypes.map((ct, index) => ({
            id: index + 1,
            post_count: ct.post_count || 1,
            content_type: ct.content_type || "foto",
          }))
        : [{ id: 1, post_count: 1, content_type: "foto" }],
    image: apiCampaign.banner_image || null,
    imagePreview: apiCampaign.banner_image || null,
    referenceFiles: apiCampaign.reference_images
      ? typeof apiCampaign.reference_images === "string"
        ? JSON.parse(apiCampaign.reference_images)
        : apiCampaign.reference_images
      : [],
    status: apiCampaign.status || "inactive",
    isPaid: apiCampaign.status === "active", // Active = paid, Inactive = unpaid
    created_at: apiCampaign.created_at,
    updated_at: apiCampaign.updated_at,
  };
};

/**
 * Activate campaign (change status to active)
 */
export const activateCampaign = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${campaignId}/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error activating campaign:", error);
    throw error;
  }
};

/**
 * Get dashboard statistics for UMKM
 */
export const getDashboardStats = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/umkm/dashboard/stats`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * Campaign Payment Timer - Process payment for approved campaign
 */
export const processPayment = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-payment/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

/**
 * Get payment status and timer info
 */
export const getPaymentStatus = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-payment/status/${campaignId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching payment status:", error);
    throw error;
  }
};

/**
 * Distribute payment to all eligible students (work around)
 */
export const distributePayment = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-payments/pay-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaign_id: campaignId }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error distributing payment:", error);
    throw error;
  }
};

/**
 * Update campaign status (admin/system/user action)
 */
export const updateCampaignStatus = async (campaignId, status) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error updating campaign status:", error);
    throw error;
  }
};

/**
 * Complete campaign (mark as completed via endpoint)
 */
export const completeCampaign = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${campaignId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error completing campaign:", error);
    throw error;
  }
};

export default {
  getCampaigns,
  getCampaignsByCategory,
  getCampaignById,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
  mapApiToFrontend,
  payment,
  activateCampaign,
  getDashboardStats,
  processPayment,
  getPaymentStatus,
  uploadBanner,
  uploadCampaignReferences,
  applyToCampaign,
  getCampaignUsers,
  updateCampaignUser,
  distributePayment,
  completeCampaign,
};
