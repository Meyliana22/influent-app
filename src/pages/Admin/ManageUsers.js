import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { COLORS } from '../../constants/colors';

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
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <AdminSidebar />
      
      <div style={{ marginLeft: '260px', width: 'calc(100% - 260px)' }}>
        <AdminTopbar />
        
        <div style={{ marginTop: '72px', padding: '32px' }}>
          {/* Page Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#1a1f36',
                marginBottom: '8px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Manage Users
              </h1>
              <p style={{
                fontSize: '0.95rem',
                color: '#6c757d',
                fontFamily: "'Inter', sans-serif"
              }}>
                Total: {filteredUsers.length} users
              </p>
            </div>
            <button
              onClick={handleAddUser}
              style={{
                padding: '12px 24px',
                background: COLORS.gradient,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>➕</span>
              Add User
            </button>
          </div>

          {/* Filters */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  minWidth: '150px'
                }}
              >
                <option value="All">All Roles</option>
                <option value="UMKM">UMKM</option>
                <option value="Influencer">Influencer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Inter', sans-serif"
            }}>
              <thead>
                <tr style={{ background: '#f7fafc' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid #e2e8f0' }}
                  >
                    <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#2d3748' }}>#{user.id}</td>
                    <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#1a1f36' }}>{user.name}</td>
                    <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#6c757d' }}>{user.email}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: user.role === 'Admin' ? '#fef3c7' : user.role === 'UMKM' ? '#dbeafe' : '#d1fae5',
                        color: user.role === 'Admin' ? '#92400e' : user.role === 'UMKM' ? '#1e40af' : '#065f46'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: user.status === 'Active' ? '#d1fae5' : '#fee2e2',
                        color: user.status === 'Active' ? '#065f46' : '#991b1b'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditUser(user)}
                          style={{
                            padding: '8px 16px',
                            background: '#667eea',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                          onMouseLeave={(e) => e.target.style.background = '#667eea'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          style={{
                            padding: '8px 16px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1f36',
              marginBottom: '24px',
              fontFamily: "'Inter', sans-serif"
            }}>
              {modalMode === 'add' ? 'Add New User' : 'Edit User'}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <option value="UMKM">UMKM</option>
                <option value="Influencer">Influencer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <option value="Active">Active</option>
                <option value="Banned">Banned</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#2d3748',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: COLORS.gradient,
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1f36',
              marginBottom: '12px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Delete User?
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: '#6c757d',
              marginBottom: '24px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#2d3748',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
