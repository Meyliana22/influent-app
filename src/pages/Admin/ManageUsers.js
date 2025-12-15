import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from '../../components/common';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  InputLabel,
  FormControl,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  School as StudentIcon,
  Business as CompanyIcon,
  AdminPanelSettings as AdminIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import adminService from '../../services/adminService';

function ManageUsers() {
  const theme = useTheme();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  // Filters
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.users.getAllUsers();
      console.log('Fetched users:', response);
      
      // Handle different response structures
      let allUsers = [];
      if (Array.isArray(response)) {
        allUsers = response;
      } else if (response.users && Array.isArray(response.users)) {
        allUsers = response.users;
      } else if (response.data && Array.isArray(response.data)) {
        allUsers = response.data;
      }

      setUsers(allUsers);
      setTotalUsers(allUsers.length);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({ 
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      password: '' // Don't pre-fill password
    });
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    console.log('Preparing to delete user:', user);
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setSubmitting(true);
      console.log(userToDelete);
      await adminService.users.deleteUser(userToDelete.user_id);
      setSuccessMessage('User deleted successfully');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveUser = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!formData.name || !formData.email) {
        setError('Name and email are required');
        return;
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      await adminService.users.updateUser(selectedUser._id, updateData);
      setSuccessMessage('User updated successfully');
      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <StudentIcon sx={{ fontSize: 20, color: '#1e40af' }} />;
      case 'company':
        return <CompanyIcon sx={{ fontSize: 20, color: '#9f1239' }} />;
      case 'admin':
        return <AdminIcon sx={{ fontSize: 20, color: '#7c3aed' }} />;
      default:
        return <PersonIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'inactive':
        return { bg: '#fee2e2', color: '#991b1b' };
      case 'suspended':
        return { bg: '#fef3c7', color: '#d97706' };
      default:
        return { bg: '#e5e7eb', color: '#374151' };
    }
  };

  // Filter users based on role, status, and search
  const filteredUsers = users.filter(user => {
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Frontend pagination
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);
  const calculatedTotalPages = Math.ceil(filteredUsers.length / limit);

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        sx={{
          marginLeft: isDesktop && sidebarOpen ? 32.5 : 0,
          width: isDesktop && sidebarOpen ? 'calc(100% - 260px)' : '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <Topbar />
        <Box sx={{ mt: 9, p: 4, backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 72px)' }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontSize: 32 }}>
                Manage Users
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#6c757d' }}>
                Total: {totalUsers} users
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5568d3',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6c757d' }} />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 100
                }}
              >
                Search
              </Button>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filterRole}
                  label="Role"
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Users Table */}
          <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={60} />
              </Box>
            ) : users.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PersonIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                <Typography sx={{ fontSize: 18, color: '#6c757d', fontWeight: 500 }}>
                  No users found
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#a0aec0', mt: 1 }}>
                  {searchQuery || filterRole || filterStatus ? 'Try adjusting your filters' : 'Users will appear here once registered'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f7fafc' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14 }}>Joined</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#1a1f36', fontSize: 14, textAlign: 'center' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers.map((user) => {
                        const statusColors = getStatusColor(user.status || 'active');
                        return (
                          <TableRow
                            key={user._id}
                            sx={{
                              '&:hover': { bgcolor: '#f7fafc' },
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: user.role === 'student' ? '#dbeafe' : (user.role === 'umkm' || user.role === 'company') ? '#fce7f3' : '#ede9fe',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {getRoleIcon(user.role)}
                                </Box>
                                <Typography sx={{ fontWeight: 600, color: '#1a1f36', fontSize: 14 }}>
                                  {user.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#6c757d', fontSize: 14 }}>{user.email}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                size="small"
                                sx={{
                                  fontSize: 12,
                                  textTransform: 'capitalize',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.status || 'active'}
                                size="small"
                                sx={{
                                  bgcolor: statusColors.bg,
                                  color: statusColors.color,
                                  fontSize: 12,
                                  textTransform: 'capitalize',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ color: '#6c757d', fontSize: 14 }}>
                                {user.created_at || user.createdAt 
                                  ? new Date(user.created_at || user.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditUser(user)}
                                  sx={{
                                    color: '#667eea',
                                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(user)}
                                  sx={{
                                    color: '#ef4444',
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Pagination
                    count={calculatedTotalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              </>
            )}
          </Paper>

          {/* Edit User Dialog */}
          <Dialog
            open={showModal}
            onClose={() => !submitting && setShowModal(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
              Edit User
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3} sx={{ pt: 1 }}>
                <TextField
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Password (leave blank to keep current)"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  placeholder="••••••••"
                />
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUser}
                variant="contained"
                disabled={submitting}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={showDeleteDialog}
            onClose={() => !submitting && setShowDeleteDialog(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ color: '#ef4444' }} />
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Confirm Delete</Typography>
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ color: '#6c757d', fontSize: 15 }}>
                Are you sure you want to delete user <strong>{userToDelete?.name}</strong>? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setShowDeleteDialog(false)}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: '#ef4444',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#dc2626' }
                }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}

export default ManageUsers;
