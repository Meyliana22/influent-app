/**
 * Applicant API Service
 * Handles all API calls related to campaign applicants
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
 * Get all applicants for a campaign
 */
export const getCampaignApplicants = async (campaignId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      campaign_id: campaignId,
      ...params,
    });

    const response = await authFetch(`${API_BASE_URL}/campaign-users?${queryParams}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    throw error;
  }
};

/**
 * Get single applicant by ID
 */
export const getApplicantById = async (applicantId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-users/${applicantId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching applicant:", error);
    throw error;
  }
};

/**
 * Accept an applicant
 */
export const acceptApplicant = async (applicantId, notes = '') => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-users/${applicantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        application_status: 'accepted',
        application_notes: notes,
        accepted_at: new Date().toISOString()
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error accepting applicant:", error);
    throw error;
  }
};

/**
 * Reject an applicant
 */
export const rejectApplicant = async (applicantId, notes = '') => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-users/${applicantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        application_status: 'rejected',
        application_notes: notes,
        rejected_at: new Date().toISOString()
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error rejecting applicant:", error);
    throw error;
  }
};

/**
 * Reconsider an applicant (reset to pending)
 */
export const reconsiderApplicant = async (applicantId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/campaign-users/${applicantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        application_status: 'pending',
        accepted_at: null,
        rejected_at: null
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error reconsidering applicant:", error);
    throw error;
  }
};

/**
 * Create dummy applicants for testing (dev only)
 */
export const createDummyApplicants = async (campaignId) => {
  const dummyApplicants = [
    {
      campaign_id: campaignId,
      student_id: 101, // Dummy student ID
      application_notes: "Saya sangat tertarik dengan campaign ini dan memiliki pengalaman di bidang yang relevan.",
      application_status: "pending"
    },
    {
      campaign_id: campaignId,
      student_id: 102,
      application_notes: "Portfolio saya menunjukkan hasil kerja yang berkualitas tinggi.",
      application_status: "pending"
    },
    {
      campaign_id: campaignId,
      student_id: 103,
      application_notes: "Saya memiliki audience yang sesuai dengan target campaign.",
      application_status: "pending"
    },
    {
      campaign_id: campaignId,
      student_id: 104,
      application_notes: "Berpengalaman dalam konten kreatif dan engagement tinggi.",
      application_status: "pending"
    },
    {
      campaign_id: campaignId,
      student_id: 105,
      application_notes: "Saya siap berkomitmen untuk menghasilkan konten terbaik.",
      application_status: "pending"
    }
  ];

  try {
    const results = [];
    for (const applicant of dummyApplicants) {
      const response = await authFetch(`${API_BASE_URL}/campaign-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicant),
      });
      const data = await handleResponse(response);
      results.push(data);
    }
    return results;
  } catch (error) {
    console.error("Error creating dummy applicants:", error);
    throw error;
  }
};

export default {
  getCampaignApplicants,
  getApplicantById,
  acceptApplicant,
  rejectApplicant,
  reconsiderApplicant,
  createDummyApplicants,
};
