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
 * Approve a submission
 */
export const approveSubmission = async (submissionId, notes = '') => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${submissionId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review_notes: notes }),
    });
    console.log(`Approved submission ${submissionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error approving submission:", error);
    throw error;
  }
};

/**
 * Reject a submission
 */
export const rejectSubmission = async (submissionId, notes) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${submissionId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review_notes: notes }),
    });
    console.log(`Rejected submission ${submissionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error rejecting submission:", error);
    throw error;
  }
};

/**
 * Request revision for a submission
 */
export const requestRevision = async (submissionId, notes) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${submissionId}/request-revisions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review_notes: notes }),
    });
    console.log(`Requested revision for submission ${submissionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error requesting revision:", error);
    throw error;
  }
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

/**
 * Create a new work submission
 */
export const createWorkSubmission = async (data) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  }
};

/**
 * Update an existing work submission
 */
export const updateWorkSubmission = async (id, data) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error updating submission:", error);
    throw error;
  }
};

/**
 * Admin rejects the rejection (sends back to UMKM)
 */
export const adminRejectRejection = async (submissionId, notes) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${submissionId}/reject-rejection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review_notes: notes }),
    });
    console.log(`Admin rejected rejection for submission ${submissionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error admin rejecting rejection:", error);
    throw error;
  }
};

/**
 * Admin approves the rejection (confirms rejection)
 */
export const adminApproveRejection = async (submissionId, notes) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/work-submissions/${submissionId}/approve-rejection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review_notes: notes }),
    });
    console.log(`Admin approved rejection for submission ${submissionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error admin approving rejection:", error);
    throw error;
  }
};

export default {
  getCampaignSubmissions,
  getSubmissionById,
  approveSubmission,
  rejectSubmission,
  requestRevision,
  getRejectedSubmissions,
  createWorkSubmission,
  createWorkSubmission,
  updateWorkSubmission,
  adminRejectRejection,
  adminApproveRejection,
};
