import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Modal } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { COLORS } from '../../constants/colors';
import { useToast } from '../../hooks/useToast';
import authService from '../../services/authService';
import studentService from '../../services/studentService';
import companyService from '../../services/companyService';
import { Avatar, IconButton, Badge } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function UserPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Profile Data States
  const [studentData, setStudentData] = useState({
    university: '',
    major: '',
    gpa: '',
    year: '',
    phone_number: '',
    instagram: '',
    user: { name: '', email: '', profile_image: null }
  });

  const [companyData, setCompanyData] = useState({
    namaUsaha: '',
    namaPemilik: '',
    email: '',
    noTelp: '',
    alamat: '',
    deskripsi: '',
    user: { name: '', email: '', profile_image: null }
  });

  // Common Profile Image
  const [profileImage, setProfileImage] = useState(null);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState({
    emailNotif: true,
    pushNotif: true,
    applicationNotif: true,
    messageNotif: true,
    campaignNotif: false
  });

  const fetchUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        console.log(user);
        // Handle nested structure from /auth/me response
        const userData = user.data?.user 
        const role = userData?.role
        setUserRole(role);
        
        if (role === 'student') {
            fetchStudentProfile();
        } else if (role === 'umkm' || role === 'company') {
            setUserRole('umkm'); // standardize
            // Populate company data directly from user data (from /me)
            setCompanyData({
                 namaUsaha: userData.name || '',
                 namaPemilik: userData.username || userData.name || '', 
                 email: userData.email || '',
                 noTelp: userData.phone_number || '', 
                 alamat: userData.address || '',
                 deskripsi: userData.description || '', 
                 user: userData
            });
            setProfileImage(userData.profile_image);
        }
      } catch (err) {
        console.error(err);
        showToast('Gagal memuat profil', 'error');
      }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    
    fetchUserData();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStudentProfile = async () => {
    try {
        setLoading(true);
        const res = await studentService.getProfile();
        if (res.data) {
           let yearVal = '';
           if (res.data.year) {
             const date = new Date(res.data.year);
             yearVal = date.toISOString().split('T')[0];
           }
           setStudentData({
               ...res.data,
               year: yearVal,
               user: res.data.user || {}
           });
           setProfileImage(res.data.user?.profile_image);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // Handlers
  const handleStudentChange = (field, value) => setStudentData(prev => ({...prev, [field]: value}));
  const handleCompanyChange = (field, value) => setCompanyData(prev => ({...prev, [field]: value}));

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleNotifChange = (field) => {
    setNotifPreferences({ ...notifPreferences, [field]: !notifPreferences[field] });
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
          if (userRole === 'student') {
              await studentService.updateProfileImage(file);
              fetchStudentProfile();
          } else {
              // Use user_id from fetched data
              const userId = companyData.user.user_id || companyData.user.id;
              if (userId) {
                  await companyService.updateProfileImage(userId, file);
                  fetchUserData();
              } else {
                 console.error("User ID not found for upload");
                 showToast('Gagal: ID User tidak ditemukan', 'error');
                 return;
              }
          }
          showToast('Foto profil berhasil diperbarui', 'success');
      } catch (error) {
          showToast('Gagal upload foto', 'error');
      }
  };

  const handleSaveProfile = async () => {
    try {
        setLoading(true);
        if (userRole === 'student') {
            const payload = {
                university: studentData.university,
                major: studentData.major,
                year: studentData.year,
                phone_number: studentData.phone_number,
                gpa: studentData.gpa,
                instagram: studentData.instagram
            };
            // Use user_id from fetched data (similar to company logic)
            console.log(studentData);
            const userId = studentData?.user_id 
            if (userId) {
              console.log("User ID found for student update:", userId);
                await studentService.updateProfile(userId, payload);
            } else {
                 throw new Error("User ID not found for student update");
            }
        } else {
            const payload = {
                business_name: companyData.namaUsaha,
                owner_name: companyData.namaPemilik,
                phone_number: companyData.noTelp,
                address: companyData.alamat,
                description: companyData.deskripsi
            };
            // Use user_id from fetched data
            await companyService.updateProfile(companyData.user.user_id || companyData.user.id, payload);
        }
        showToast('Profil berhasil disimpan!', 'success');
    } catch (error) {
      console.log(error)
        showToast('Gagal menyimpan profil', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
        showToast('Mohon isi semua field password', 'error');
        return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Password baru tidak cocok!', 'error');
      return;
    }

    try {
        setLoading(true);
        await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
        showToast('Password berhasil diubah!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
        console.error("Change password error:", error);
        showToast(error.message || 'Gagal mengubah password', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Render Logic
  const SidebarComponent = userRole === 'student' ? Sidebar : UMKMSidebar;
  const TopbarComponent = userRole === 'student' ? Topbar : UMKMTopbar;

  const getImageUrl = (imageName) => {
      if (!imageName) return null;
      if (imageName.startsWith('http')) return imageName;
      return `http://localhost:8000/api/uploads/${imageName}`;
  };

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      <SidebarComponent isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', flex: 1, overflowX: 'hidden' }}>
        <TopbarComponent onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ marginTop: '72px', padding: '32px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            
            {/* Page Header */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                Pengaturan Akun
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                Kelola informasi profil {userRole === 'student' ? 'Student' : 'Bisnis'} dan preferensi akun Anda.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: '32px' }}>
              
              {/* Left Sidebar (Navigation & Avatar) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card style={{ padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                      <Avatar 
                          src={getImageUrl(profileImage)} 
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            border: '4px solid #fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                          }}
                      />
                      <label htmlFor="icon-button-file">
                          <Input accept="image/*" id="icon-button-file" type="file" sx={{ display: 'none' }} onChange={handleImageUpload} />
                          <IconButton 
                            color="primary" 
                            component="span" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 4, 
                              right: 4, 
                              bgcolor: '#fff', 
                              border: '1px solid #e2e8f0',
                              '&:hover': { bgcolor: '#f8fafc' }, 
                              width: 36, 
                              height: 36 
                            }}
                          >
                              <PhotoCamera sx={{ fontSize: 18, color: '#64748b' }} />
                          </IconButton>
                      </label>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                      {userRole === 'student' ? studentData.user?.name : companyData.user?.name || companyData.namaUsaha}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                       {userRole === 'student' ? studentData.user?.email : companyData.user?.email}
                  </p>
                </Card>

                <Card style={{ padding: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '16px' }}>
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { id: 'profile', label: 'Profil Saya', icon: '👤' },
                      { id: 'password', label: 'Keamanan', icon: '🔒' },
                      { id: 'notifications', label: 'Notifikasi', icon: '🔔' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          borderRadius: '12px',
                          background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                          color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                          fontWeight: activeTab === tab.id ? 600 : 500,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                  
                  <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>🚪</span>
                    Keluar
                  </button>
                </Card>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                
                {activeTab === 'profile' && (
                  <Card style={{ padding: '32px', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        Informasi Pribadi
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gap: '24px' }}>
                      {userRole === 'student' ? (
                          <>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <Input label="Universitas" value={studentData.university} onChange={(e) => handleStudentChange('university', e.target.value)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input label="Jurusan" value={studentData.major} onChange={(e) => handleStudentChange('major', e.target.value)} />
                                    <Input label="Tahun Masuk" type="date" value={studentData.year} onChange={(e) => handleStudentChange('year', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input label="GPA / IPK" type="number" value={studentData.gpa} onChange={(e) => handleStudentChange('gpa', e.target.value)} />
                                    <Input label="No. Telepon" value={studentData.phone_number} onChange={(e) => handleStudentChange('phone_number', e.target.value)} />
                                </div>
                                <Input label="Instagram" value={studentData.instagram} onChange={(e) => handleStudentChange('instagram', e.target.value)} placeholder="@username" />
                            </div>
                          </>
                      ) : (
                          <>
                            <div style={{ display: 'grid', gap: '24px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Detail Usaha
                                  </label>
                                  <div style={{ display: 'grid', gap: '20px' }}>
                                    <Input label="Nama Usaha" value={companyData.namaUsaha} onChange={(e) => handleCompanyChange('namaUsaha', e.target.value)} />
                                    <Input label="Alamat Lengkap" value={companyData.alamat} onChange={(e) => handleCompanyChange('alamat', e.target.value)} />
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                                          Deskripsi Usaha
                                        </label>
                                        <textarea
                                          value={companyData.deskripsi}
                                          onChange={(e) => handleCompanyChange('deskripsi', e.target.value)}
                                          rows={4}
                                          style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                          }}
                                          onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                  </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Kontak Pemilik
                                  </label>
                                  <div style={{ display: 'grid', gap: '20px' }}>
                                    <Input label="Nama Pemilik" value={companyData.namaPemilik} onChange={(e) => handleCompanyChange('namaPemilik', e.target.value)} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <Input label="Email Akun" value={companyData.email} disabled style={{ backgroundColor: '#f8fafc', color: '#94a3b8' }} />
                                        <Input label="No. Telepon" value={companyData.noTelp} onChange={(e) => handleCompanyChange('noTelp', e.target.value)} />
                                    </div>
                                  </div>
                                </div>
                            </div>
                          </>
                      )}
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={loading} 
                        style={{ 
                          padding: '12px 32px', 
                          background: '#4f46e5', 
                          border: 'none', 
                          borderRadius: '10px', 
                          color: '#fff', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)'
                        }}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </Button>
                    </div>
                  </Card>
                )}

                {activeTab === 'password' && (
                  <Card style={{ padding: '32px', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 24px 0' }}>
                      Keamanan & Password
                    </h3>
                    <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                      <Input label="Password Saat Ini" type="password" value={passwordData.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} />
                      <Input label="Password Baru" type="password" value={passwordData.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} />
                      <Input label="Konfirmasi Password Baru" type="password" value={passwordData.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} />
                    </div>
                    <div style={{ marginTop: '32px' }}>
                      <Button onClick={handleSavePassword} style={{ padding: '12px 24px', background: '#4f46e5', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600 }}>
                        Update Password
                      </Button>
                    </div>
                  </Card>
                )}

                {activeTab === 'notifications' && (
                  <Card style={{ padding: '32px', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 24px 0' }}>
                      Preferensi Notifikasi
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {[
                        { key: 'emailNotif', label: 'Email Notifikasi', desc: 'Terima pembaruan penting via email' },
                        { key: 'pushNotif', label: 'Push Notifikasi', desc: 'Terima notifikasi langsung di browser' },
                      ].map(item => (
                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.desc}</div>
                          </div>
                          <div style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                            <input 
                              type="checkbox" 
                              checked={notifPreferences[item.key]} 
                              onChange={() => handleNotifChange(item.key)} 
                              style={{ 
                                opacity: 0,
                                width: 0,
                                height: 0
                              }} 
                              id={`toggle-${item.key}`}
                            />
                            <label 
                              htmlFor={`toggle-${item.key}`}
                              style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: notifPreferences[item.key] ? '#4f46e5' : '#cbd5e1',
                                transition: '.4s',
                                borderRadius: '34px'
                              }}
                            >
                              <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '20px',
                                width: '20px',
                                left: notifPreferences[item.key] ? '22px' : '2px',
                                bottom: '2px',
                                backgroundColor: 'white',
                                transition: '.4s',
                                borderRadius: '50%'
                              }} />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar">
              <div style={{ padding: '20px 0' }}>
                <p style={{ marginBottom: '24px', color: '#4b5563' }}>Apakah Anda yakin ingin keluar dari akun ini?</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>Batal</Button>
                  <Button variant="danger" onClick={confirmLogout}>Ya, Keluar</Button>
                </div>
              </div>
            </Modal>

          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;
