
import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Modal,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputLabel,
  FormControl,
  Stack
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'UMKM',
    status: 'Active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, filterRole, searchQuery]);

  const loadUsers = () => {
    // Mock users data
    const mockUsers = [
      { id: 1, name: 'Scarlett Beauty', email: 'scarlett@beauty.com', role: 'UMKM', status: 'Active' },
      { id: 2, name: 'Gaming Pro', email: 'gaming@pro.com', role: 'UMKM', status: 'Active' },
      { id: 3, name: 'Sarah Johnson', email: 'sarah@influencer.com', role: 'Influencer', status: 'Active' },
      { id: 4, name: 'Mike Chen', email: 'mike@influencer.com', role: 'Influencer', status: 'Active' },
      { id: 5, name: 'Admin User', email: 'admin@influent.com', role: 'Admin', status: 'Active' },
      { id: 6, name: 'Jessica Lee', email: 'jessica@influencer.com', role: 'Influencer', status: 'Banned' },
    ];
    setUsers(mockUsers);
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (filterRole !== 'All') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', role: 'UMKM', status: 'Active' });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({ ...user });
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setUsers(users.filter(u => u.id !== userToDelete.id));
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleSaveUser = () => {
    if (modalMode === 'add') {
      const newUser = {
        ...formData,
        id: users.length + 1
      };
      setUsers([...users, newUser]);
    } else {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...formData, id: selectedUser.id } : u));
    }
    setShowModal(false);
  };


  return (
    <Box sx={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ ml: 32.5, width: 'calc(100% - 260px)' }}>
        <Topbar />
        <Box sx={{ mt: 9, p: 4 }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontFamily: 'Inter, sans-serif', fontSize: 32 }}>
                Manage Users
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>
                Total: {filteredUsers.length} users
              </Typography>
            </Box>
            <Button
              onClick={handleAddUser}
              sx={{
                px: 3,
                py: 1.5,
                backgroundImage: COLORS.gradientPrimary,
                borderRadius: 2.5,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundImage: COLORS.gradientPrimary,
                  opacity: 0.9,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                }
              }}
              startIcon={<AddIcon sx={{ color: '#fff', fontSize: 16 }} />}
            >
              Add User
            </Button>
          </Box>
          {/* Filters */}
          <Paper elevation={0} sx={{
            background: '#fff',
            borderRadius: 2,
            p: 3,
            mb: 3,
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 2,
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="medium"
                sx={{
                  background: '#fff',
                  borderRadius: 1.5,
                  fontSize: 15,
                  fontFamily: 'Inter, sans-serif',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.25,
                  }
                }}
              />
            </Box>
            <FormControl sx={{ minWidth: 2.375 }}>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                size="medium"
                sx={{
                  borderRadius: 1.25,
                  fontSize: 15,
                  fontFamily: 'Inter, sans-serif',
                  background: '#fff',
                }}
              >
                <MenuItem value="All">All Roles</MenuItem>
                <MenuItem value="UMKM">UMKM</MenuItem>
                <MenuItem value="Influencer">Influencer</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          {/* Users Table */}
          <Paper elevation={0} sx={{
            background: '#fff',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
            <Table sx={{ width: 1, borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
              <TableHead>
                <TableRow sx={{ background: '#f7fafc' }}>
                  <TableCell sx={{ pl: 2, pr: 3, py: 2, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 0.5 }}>ID</TableCell>
                  <TableCell sx={{ pl: 2, pr: 3, py: 2, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</TableCell>
                  <TableCell sx={{ pl: 2, pr: 3, py: 2, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</TableCell>
                  <TableCell sx={{ pl: 2, pr: 3, py: 2, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</TableCell>
                  <TableCell sx={{ pl: 2, pr: 3, py: 2, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
                  <TableCell sx={{ pl: 2, pr: 3, py: 2, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                    <TableCell sx={{ pl: 2, pr: 3, py: 2.5, fontSize: 14, color: '#2d3748' }}>#{user.id}</TableCell>
                    <TableCell sx={{ pl: 2, pr: 3, py: 2.5, fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>{user.name}</TableCell>
                    <TableCell sx={{ pl: 2, pr: 3, py: 2.5, fontSize: 14, color: '#6c757d' }}>{user.email}</TableCell>
                    <TableCell sx={{ pl: 2, pr: 3, py: 2.5 }}>
                      <Box component="span" sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: 13,
                        fontWeight: 600,
                        background: user.role === 'Admin' ? '#fef3c7' : user.role === 'UMKM' ? '#dbeafe' : '#d1fae5',
                        color: user.role === 'Admin' ? '#92400e' : user.role === 'UMKM' ? '#1e40af' : '#065f46',
                        display: 'inline-block'
                      }}>{user.role}</Box>
                    </TableCell>
                    <TableCell sx={{ pl: 2, pr: 3, py: 2.5 }}>
                      <Box component="span" sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: 13,
                        fontWeight: 600,
                        background: user.status === 'Active' ? '#d1fae5' : '#fee2e2',
                        color: user.status === 'Active' ? '#065f46' : '#991b1b',
                        display: 'inline-block'
                      }}>{user.status}</Box>
                    </TableCell>
                    <TableCell sx={{ pl: 2, pr: 3, py: 2.5, textAlign: 'center' }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          onClick={() => handleEditUser(user)}
                          size="small"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            minHeight: 0,
                            background: '#667eea',
                            borderRadius: 2,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            textTransform: 'none',
                            minWidth: 0,
                            '&:hover': {
                              background: '#5568d3',
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(user)}
                          size="small"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            minHeight: 0,
                            background: '#ef4444',
                            borderRadius: 2,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            textTransform: 'none',
                            minWidth: 0,
                            '&:hover': {
                              background: '#dc2626',
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>
      {/* Add/Edit User Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 2.5,
          p: 4,
          maxWidth: 'sm',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1f36', mb: 3, fontFamily: 'Inter, sans-serif', fontSize: 25 }}>
            {modalMode === 'add' ? 'Add New User' : 'Edit User'}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              variant="outlined"
              size="medium"
              sx={{
                background: '#fff',
                borderRadius: 1.25,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.25,
                }
              }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              variant="outlined"
              size="medium"
              sx={{
                background: '#fff',
                borderRadius: 1.25,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.25,
                }
              }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              fullWidth
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              variant="outlined"
              size="medium"
              sx={{
                background: '#fff',
                borderRadius: 1.25,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.25,
                }
              }}
            >
              <MenuItem value="UMKM">UMKM</MenuItem>
              <MenuItem value="Influencer">Influencer</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ mb: 3 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              variant="outlined"
              size="medium"
              sx={{
                background: '#fff',
                borderRadius: 1.25,
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.25,
                }
              }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Banned">Banned</MenuItem>
            </TextField>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => setShowModal(false)}
              sx={{
                flex: 1,
                py: 1.5,
                background: '#e2e8f0',
                borderRadius: 1.25,
                color: '#2d3748',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                '&:hover': {
                  background: '#cbd5e1',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              sx={{
                flex: 1,
                py: 1.5,
                backgroundImage: COLORS.gradientPrimary,
                borderRadius: 1.25,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                '&:hover': {
                  backgroundImage: COLORS.gradientPrimary,
                  opacity: 0.9
                }
              }}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 2.5,
          p: 4,
          maxWidth: 'sm',
          width: '30%',
          textAlign: 'center',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <WarningAmberIcon sx={{ fontSize: 36, color: '#ef4444' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1.5, fontFamily: 'Inter, sans-serif' }}>
            Delete User?
          </Typography>
          <Typography sx={{ fontSize: 15, color: '#6c757d', mb: 3, fontFamily: 'Inter, sans-serif' }}>
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => setShowDeleteModal(false)}
              sx={{
                flex: 1,
                py: 1.5,
                background: '#e2e8f0',
                borderRadius: 1.5,
                color: '#2d3748',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                '&:hover': {
                  background: '#cbd5e1',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              sx={{
                flex: 1,
                py: 1.5,
                background: '#ef4444',
                borderRadius: 1.25,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                '&:hover': {
                  background: '#dc2626',
                }
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}

export default ManageUsers;
