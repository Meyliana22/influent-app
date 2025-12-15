import authFetch from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// User Management
export const adminUserService = {
  // Get all users with filters
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await authFetch(`${API_BASE_URL}/users?${queryParams}`);
    return response.json();
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/users/${id}`);
    return response.json();
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await authFetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Campaign Management
export const adminCampaignService = {
  // Get all campaigns
  getAllCampaigns: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await authFetch(`${API_BASE_URL}/campaigns?${queryParams}`);
    return response.json();
  },

  // Get campaign by ID
  getCampaignById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${id}`);
    return response.json();
  },

  // Update campaign (moderate)
  updateCampaign: async (id, data) => {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Admin Review Management (Campaign Approval/Rejection)
export const adminReviewService = {
  // Get campaigns pending admin review
  getPendingCampaigns: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await authFetch(`${API_BASE_URL}/admin/review/pending?${queryParams}`);
    return response.json();
  },

  // Approve campaign (Admin only)
  approveCampaign: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/admin/review/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // Reject campaign (Admin only)
  rejectCampaign: async (id, cancellationReason) => {
    const response = await authFetch(`${API_BASE_URL}/admin/review/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancellation_reason: cancellationReason })
    });
    return response.json();
  }
};

// Withdrawal Management
export const adminWithdrawalService = {
  // Get all withdrawal requests
  getAllWithdrawals: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await authFetch(`${API_BASE_URL}/withdrawals/admin/all?${queryParams}`);
    return response.json();
  },

  // Get withdrawal by ID
  getWithdrawalById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/withdrawals/${id}`);
    return response.json();
  },

  // Approve withdrawal
  approveWithdrawal: async (id, reviewNotes = '') => {
    const response = await authFetch(`${API_BASE_URL}/withdrawals/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_notes: reviewNotes })
    });
    return response.json();
  },

  // Reject withdrawal
  rejectWithdrawal: async (id, rejectionReason) => {
    const response = await authFetch(`${API_BASE_URL}/withdrawals/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejection_reason: rejectionReason })
    });
    return response.json();
  },

  // Complete withdrawal (with transfer proof)
  completeWithdrawal: async (id, transferProof, reviewNotes = '') => {
    const formData = new FormData();
    formData.append('transfer_proof', transferProof);
    if (reviewNotes) formData.append('review_notes', reviewNotes);
    
    const response = await authFetch(`${API_BASE_URL}/withdrawals/${id}/complete`, {
      method: 'PUT',
      body: formData
    });
    return response.json();
  }
};

// Transaction Management
export const adminTransactionService = {
  // Get all transactions
  getAllTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.type) queryParams.append('type', params.type);
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await authFetch(`${API_BASE_URL}/transactions/admin/all?${queryParams}`);
    return response.json();
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/transactions/${id}`);
    return response.json();
  }
};

// Student Management
export const adminStudentService = {
  // Get all students
  getAllStudents: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.university) queryParams.append('university', params.university);
    if (params.min_followers) queryParams.append('min_followers', params.min_followers);
    if (params.interests) queryParams.append('interests', params.interests);
    
    const response = await authFetch(`${API_BASE_URL}/students?${queryParams}`);
    return response.json();
  },

  // Get student by ID
  getStudentById: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/students/${id}`);
    return response.json();
  },

  // Update student
  updateStudent: async (id, data) => {
    const response = await authFetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete student
  deleteStudent: async (id) => {
    const response = await authFetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Analytics
export const adminAnalyticsService = {
  // Get platform statistics
  getStats: async () => {
    try {
      // Fetch data from multiple endpoints
      const [usersRes, campaignsRes, transactionsRes, withdrawalsRes] = await Promise.allSettled([
        adminUserService.getAllUsers({ limit: 1 }).catch(() => ({ total: 0, users: [] })),
        adminCampaignService.getAllCampaigns({ limit: 1 }).catch(() => ({ total: 0, campaigns: [] })),
        adminTransactionService.getAllTransactions({ limit: 1 }).catch(() => ({ total: 0, transactions: [] })),
        adminWithdrawalService.getAllWithdrawals({ limit: 1 }).catch(() => ({ total: 0, withdrawals: [] }))
      ]);

      const users = usersRes.status === 'fulfilled' ? usersRes.value : { total: 0, users: [] };
      const campaigns = campaignsRes.status === 'fulfilled' ? campaignsRes.value : { total: 0, campaigns: [] };
      const transactions = transactionsRes.status === 'fulfilled' ? transactionsRes.value : { total: 0, transactions: [] };
      const withdrawals = withdrawalsRes.status === 'fulfilled' ? withdrawalsRes.value : { total: 0, withdrawals: [] };

      // Handle different response structures
      const totalUsers = users.total || (Array.isArray(users) ? users.length : 0);
      const totalCampaigns = campaigns.total || (Array.isArray(campaigns) ? campaigns.length : 0);
      const totalTransactions = transactions.total || (Array.isArray(transactions) ? transactions.length : 0);
      
      const withdrawalsList = Array.isArray(withdrawals) ? withdrawals : (withdrawals.withdrawals || withdrawals.data || []);
      const pendingWithdrawals = withdrawalsList.filter(w => w.status === 'pending').length;

      // Calculate detailed stats
      const usersList = Array.isArray(users) ? users : (users.users || users.data || []);
      const totalStudents = usersList.filter(u => u.role === 'student').length;
      const totalCompanies = usersList.filter(u => u.role === 'umkm' || u.role === 'company').length;

      const campaignsList = Array.isArray(campaigns) ? campaigns : (campaigns.campaigns || campaigns.data || []);
      const activeCampaigns = campaignsList.filter(c => c.status === 'active').length;
      const completedCampaigns = campaignsList.filter(c => c.status === 'completed').length;
      const pendingCampaigns = campaignsList.filter(c => c.status === 'pending' || c.status === 'draft').length;

      const approvedWithdrawals = withdrawalsList.filter(w => w.status === 'approved').length;
      const completedWithdrawals = withdrawalsList.filter(w => w.status === 'completed').length;

      const transactionsList = Array.isArray(transactions) ? transactions : (transactions.transactions || transactions.data || []);
      const totalRevenue = transactionsList.reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        totalUsers,
        totalStudents,
        totalCompanies,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        pendingCampaigns,
        totalWithdrawals: withdrawalsList.length,
        pendingWithdrawals,
        approvedWithdrawals,
        completedWithdrawals,
        totalTransactions,
        totalRevenue
      };
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      // Return default values on error
      return {
        totalUsers: 0,
        totalStudents: 0,
        totalCompanies: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        pendingCampaigns: 0,
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        approvedWithdrawals: 0,
        completedWithdrawals: 0,
        totalTransactions: 0,
        totalRevenue: 0
      };
    }
  }
};

export default {
  users: adminUserService,
  campaigns: adminCampaignService,
  review: adminReviewService,
  withdrawals: adminWithdrawalService,
  transactions: adminTransactionService,
  students: adminStudentService,
  analytics: adminAnalyticsService
};
