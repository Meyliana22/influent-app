/**
 * Applicant Storage Helper
 * Manage applicant data in localStorage
 */

export const applicantStorageHelper = {
  /**
   * Get all applicants
   */
  getAllApplicants: () => {
    try {
      return JSON.parse(localStorage.getItem('applicants') || '[]');
    } catch (error) {
      console.error('Error reading applicants:', error);
      return [];
    }
  },

  /**
   * Get applicants for specific campaign
   */
  getApplicantsByCampaignId: (campaignId) => {
    try {
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      return applicants.filter(a => a.campaignId === campaignId);
    } catch (error) {
      console.error('Error reading applicants:', error);
      return [];
    }
  },

  /**
   * Get accepted applicants for campaign
   */
  getAcceptedApplicants: (campaignId) => {
    try {
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      return applicants.filter(a => a.campaignId === campaignId && a.status === 'Accepted');
    } catch (error) {
      console.error('Error reading applicants:', error);
      return [];
    }
  },

  /**
   * Update applicant status
   */
  updateApplicantStatus: (applicantId, status) => {
    try {
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updated = applicants.map(a => 
        a.id === applicantId ? { ...a, status } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error updating applicant:', error);
      return false;
    }
  },

  /**
   * Add new applicant
   */
  addApplicant: (applicant) => {
    try {
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      applicants.push({
        ...applicant,
        id: Date.now().toString(),
        appliedDate: new Date().toISOString(),
        isSelected: false
      });
      localStorage.setItem('applicants', JSON.stringify(applicants));
      return true;
    } catch (error) {
      console.error('Error adding applicant:', error);
      return false;
    }
  },

  /**
   * Toggle applicant selection
   */
  toggleSelection: (applicantId, isSelected) => {
    try {
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updated = applicants.map(a => 
        a.id === applicantId ? { ...a, isSelected } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error toggling selection:', error);
      return false;
    }
  },

  /**
   * Get selected applicants for campaign
   */
  getSelectedApplicants: (campaignId) => {
    try {
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      return applicants.filter(a => a.campaignId === campaignId && a.isSelected === true);
    } catch (error) {
      console.error('Error reading selected applicants:', error);
      return [];
    }
  },

  /**
   * Get applicant by ID
   */
  getApplicantById: (applicantId) => {
    try {
      const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      return applicants.find(a => a.id === applicantId);
    } catch (error) {
      console.error('Error reading applicant:', error);
      return null;
    }
  }
};

// Make available in console
if (typeof window !== 'undefined') {
  window.applicantStorage = applicantStorageHelper;
  console.log('👥 Applicant Storage Helper loaded! Use window.applicantStorage in console');
}

export default applicantStorageHelper;
