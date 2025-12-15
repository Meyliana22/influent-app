/**
 * Work Submission API Service
 * Handles all API calls related to work submissions
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
 * Get all submissions for a campaign
 */
export const getCampaignSubmissions = async (campaignId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/campaign/${campaignId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching campaign submissions:", error);
    throw error;
  }
};

/**
 * Get single submission by ID
 */
export const getSubmissionById = async (submissionId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${submissionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching submission:", error);
    throw error;
  }
};

/**
 * Review a submission (approve/reject/request revision)
 */
export const reviewSubmission = async (submissionId, reviewData) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${submissionId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error reviewing submission:", error);
    throw error;
  }
};

/**
 * Approve a submission
 */
export const approveSubmission = async (submissionId, notes = '') => {
  return reviewSubmission(submissionId, {
    status: 'approved',
    review_notes: notes,
  });
};

/**
 * Reject a submission
 */
export const rejectSubmission = async (submissionId, notes) => {
  return reviewSubmission(submissionId, {
    status: 'rejected',
    review_notes: notes,
  });
};

/**
 * Request revision for a submission
 */
export const requestRevision = async (submissionId, notes) => {
  return reviewSubmission(submissionId, {
    status: 'revision_requested',
    review_notes: notes,
  });
};

/**
 * Get rejected submissions for admin review
 */
export const getRejectedSubmissions = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/rejected`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching rejected submissions:", error);
    throw error;
  }
};

export default {
  getCampaignSubmissions,
  getSubmissionById,
  reviewSubmission,
  approveSubmission,
  rejectSubmission,
  requestRevision,
  getRejectedSubmissions,
};
