/**
 * Post Submission API Service
 * Handles API calls related to post proof submissions
 */

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

/**
 * Submit a post link for a work submission
 * @param {Object} data - { work_submission_id, post_link }
 */
export const submitLink = async (data) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/post-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error submitting post link:", error);
    throw error;
  }
};

/**
 * Get post submission by work submission ID
 * @param {string|number} workSubmissionId 
 */
export const getByWorkSubmissionId = async (workSubmissionId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/post-submissions/work/${workSubmissionId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching post submission:", error);
    throw error;
  }
};

/**
 * Verify a post submission (for completeness, though mainly for admin/company)
 * @param {string|number} id 
 * @param {string} status - 'verified' | 'rejected'
 */
export const verifySubmission = async (id, status) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/post-submissions/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error verifying post submission:", error);
      throw error;
    }
  };

export default {
  submitLink,
  getByWorkSubmissionId,
  verifySubmission
};
