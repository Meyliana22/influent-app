/**
 * Campaign API Service
 * Handles all API calls related to campaigns
 */

const API_BASE_URL = "https://influent-api-1fnn.vercel.app/api/v1";

/**
 * API Response Helper
 */
const handleResponse = async (response) => {
  const data = await response.json();
  return data;
};

export const payment = async (params = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};

/**
 * Get all campaigns with optional filters
 */
export const getCampaigns = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      limit: params.limit || 50,
      ...params,
    });

    const response = await fetch(`${API_BASE_URL}/campaigns?${queryParams}`);
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
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    throw error;
  }
};

/**
 * Create new campaign
 */
export const createCampaign = async (campaignData) => {
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
      start_date: campaignData.start_date || null,
      end_date: campaignData.end_date || null,
      submission_deadline: campaignData.submission_deadline || null,
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
      selected_gender: campaignData.selectedGender || null,
      selected_age: campaignData.selectedAge || null,
      criteria_desc: campaignData.criteriaDesc || null,
      banner_image: campaignData.image || null,
      reference_images: campaignData.referenceFiles
        ? JSON.stringify(campaignData.referenceFiles)
        : null,
      status: campaignData.status || "inactive", // Default to inactive (unpaid)
      contentTypes:
        campaignData.contentItems && campaignData.contentItems.length > 0
          ? JSON.stringify(
              campaignData.contentItems.map((item) => ({
                content_type: item.content_type,
                post_count: item.post_count,
              }))
            )
          : null,
    };
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
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
      start_date: campaignData.start_date || null,
      end_date: campaignData.end_date || null,
      submission_deadline: campaignData.submission_deadline || null,
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
      selected_gender: campaignData.selectedGender || null,
      selected_age: campaignData.selectedAge || null,
      criteria_desc: campaignData.criteriaDesc || null,
      banner_image: campaignData.image || null,
      reference_images: campaignData.referenceFiles
        ? JSON.stringify(campaignData.referenceFiles)
        : null,
      status: campaignData.status || "inactive", // Default to inactive (unpaid)
      contentTypes:
        campaignData.contentItems && campaignData.contentItems.length > 0
          ? JSON.stringify(
              campaignData.contentItems.map((item) => ({
                content_type: item.content_type,
                post_count: item.post_count,
              }))
            )
          : null,
    };

    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
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
    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
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
    contentReference: apiCampaign.content_reference || "",
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

export default {
  getCampaigns,
  getCampaignsByCategory,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  mapApiToFrontend,
  payment,
};
