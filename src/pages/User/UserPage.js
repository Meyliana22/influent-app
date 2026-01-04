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
import { Avatar, IconButton, Badge, Divider, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import adminService from '../../services/adminService';

function UserPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiImage = process.env.REACT_APP_API_IMAGE_URL;
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Profile Data States
  const [studentData, setStudentData] = useState({
    name: '',
    university: '',
    major: '',
    gpa: '',
    year: '',
    phone_number: '',
    instagram_username: '',
    domicile: '',
    age: '',
    gender: '',
    instagram_profile_link: '',
    content_category: '',
    instagram_followers_count: '',
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

  const [adminData, setAdminData] = useState({
    name: '',
    name: '',
    email: '',
    user: { name: '', email: '', profile_image: null }
  });

  // Handler for admin changes
  const handleAdminChange = (field, value) => {
    setAdminData(prev => ({
        ...prev,
        [field]: value
    }));
  };

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
        // Handle nested structure from /auth/me response
        const userData = user.data?.user 
        const role = userData?.role
        setUserRole(role);
        
        if (role === 'student') {
            setStudentData(prev => ({ ...prev, name: userData.name }));
            fetchStudentProfile();
            setProfileImage(userData.profile_image);
        } else if (role === 'admin') {
            setAdminData({
                name: userData.name || '',
                email: userData.email || '',
                user: userData
            });
            setProfileImage(userData.profile_image);
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
           setStudentData(prev => ({
               ...prev,
               ...res.data,
               // name: res.data.user?.name || '', // Don't overwrite name from user data
               year: yearVal,
               user: res.data.user || {}
           }));
          //  console.log(res.data);
          //  setProfileImage(res.data.user?.profile_image);
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
              const userId = studentData.user_id || studentData.user?.id;
              if (userId) {
                  await studentService.updateProfileImage(userId, file);
                  fetchStudentProfile();
              } else {
                  showToast('Gagal: ID User tidak ditemukan', 'error');
              }
          } else if(userRole === 'company') {
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
          }else if (userRole === 'admin') {
              let userId = adminData.user?.user_id || adminData.user?.id;
              
              // Fallback to localStorage if state id is missing
              if (!userId) {
                  try {
                      const storedUser = JSON.parse(localStorage.getItem('user'));
                      userId = storedUser?.user_id || storedUser?.id;
                      console.log("Retrieved ID from localStorage:", userId);
                  } catch (e) {
                      console.error("Error parsing user from localStorage", e);
                  }
              }

              console.log("Admin Upload - UserID:", userId, "AdminData:", adminData);

              if (userId) {
                  await adminService.users.updateProfileImage(userId, file);
                  fetchUserData();
              } else {
                 console.error("User ID not found for upload. AdminData:", adminData);
                 showToast('Gagal: ID User tidak ditemukan', 'error');
                 return;
              }
          }
          showToast('Foto profil berhasil diperbarui', 'success');
      } catch (error) {
          console.error("Upload Error Details:", error);
          showToast(`Gagal upload foto: ${error.message || 'Error tidak diketahui'}`, 'error');
      }
  };

  const handleSaveProfile = async () => {
    try {
        setLoading(true);
        if (userRole === 'student') {
            const payload = {
                name: studentData.name,
                university: studentData.university,
                major: studentData.major,
                year: studentData.year,
                phone_number: studentData.phone_number,
                gpa: studentData.gpa,
                instagram_username: studentData.instagram_username,
                domicile: studentData.domicile,
                age: parseInt(studentData.age, 10),
                gender: studentData.gender,
                instagram_profile_link: studentData.instagram_profile_link,
                content_category: studentData.content_category,
                instagram_followers_count: parseInt(studentData.instagram_followers_count, 10)
            };
            // Use user_id from fetched data (similar to company logic)
            console.log(studentData);
            const userId = studentData?.user_id 
            if (userId) {
              console.log("User ID found for student update:", userId);
                await studentService.updateProfile(userId, payload);
                
                // Update User entity for name change
                if (studentData.name) {
                    await authService.updateUser(studentData.user.user_id || studentData.user.id || userId, { name: studentData.name });
                }
            } else {
                 throw new Error("User ID not found for student update");
            }
        } else if (userRole === 'admin') {
             // Admin update
             const userId = adminData.user.user_id || adminData.user.id;
             if (!userId) { // fallback
                 const stored = JSON.parse(localStorage.getItem('user'));
                 if (stored) userId = stored.user_id || stored.id;
             }
             
             if (userId) {
                 await adminService.users.updateProfile(userId, { name: adminData.name });
             } else {
                 throw new Error("Admin ID not found");
             }
        } else {
            const payload = {
                business_name: companyData.namaUsaha,
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
        showToast('Mohon isi semua field kata sandi', 'error');
        return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Kata sandi baru tidak cocok!', 'error');
      return;
    }

    try {
        setLoading(true);
        await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
        showToast('Kata sandi berhasil diubah!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
        console.error("Change password error:", error);
        showToast(error.message || 'Gagal mengubah kata sandi', 'error');
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

  const getImageUrl = (imageName) => {
    return `${imageName}`;
  };

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', flex: 1, overflowX: 'hidden' }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ marginTop: '72px', padding: '32px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            
            {/* Page Header */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                Pengaturan Akun
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                Kelola informasi profil dan preferensi akun Anda.
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
                      {userRole === 'student' ? studentData.user?.name : userRole === 'admin' ? adminData.user?.name : companyData.user?.name || companyData.namaUsaha}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                       {userRole === 'student' ? studentData.user?.email : userRole === 'admin' ? adminData.user?.email : companyData.user?.email}
                  </p>
                </Card>

                <Card style={{ padding: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { id: 'profile', label: 'Profil Saya', icon: PersonIcon },
                      { id: 'password', label: 'Keamanan', icon: LockIcon },
                      // { id: 'notifications', label: 'Notifikasi', icon: NotificationsIcon },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            borderRadius: '12px',
                            background: isActive ? '#F3E5F5' : 'transparent',
                            color: isActive ? '#6E00BE' : '#64748b',
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                             if (!isActive) {
                               e.currentTarget.style.background = '#f8fafc';
                               e.currentTarget.style.color = '#1e293b';
                             }
                          }}
                          onMouseLeave={(e) => {
                             if (!isActive) {
                               e.currentTarget.style.background = 'transparent';
                               e.currentTarget.style.color = '#64748b';
                             }
                          }}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                  
                  <Divider sx={{ my: 2 }} />
                  
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
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                  >
                    <LogoutIcon sx={{ fontSize: 20 }} />
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
                                <Input label="Nama Lengkap" value={studentData.name} onChange={(e) => handleStudentChange('name', e.target.value)} />
                                <Input label="Universitas" value={studentData.university} onChange={(e) => handleStudentChange('university', e.target.value)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input label="Jurusan" value={studentData.major} onChange={(e) => handleStudentChange('major', e.target.value)} />
                                    <Input label="Tahun Masuk" type="date" value={studentData.year} onChange={(e) => handleStudentChange('year', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input label="GPA / IPK" type="number" value={studentData.gpa} onChange={(e) => handleStudentChange('gpa', e.target.value)} />
                                    <Input label="No. Telepon" value={studentData.phone_number} onChange={(e) => handleStudentChange('phone_number', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                   <Input label="Instagram Username" value={studentData.instagram_username} onChange={(e) => handleStudentChange('instagram_username', e.target.value)} placeholder="@username" />
                                   <Input label="Jumlah Pengikut Instagram" type="number" value={studentData.instagram_followers_count} onChange={(e) => handleStudentChange('instagram_followers_count', e.target.value)} placeholder="Contoh: 1000" />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                   <Input label="Domisili" value={studentData.domicile} onChange={(e) => handleStudentChange('domicile', e.target.value)} placeholder="Contoh: Jakarta Selatan" />
                                   <Input label="Umur" type="number" value={studentData.age} onChange={(e) => handleStudentChange('age', e.target.value)} />
                                </div>

                                <FormControl fullWidth>
                                    <InputLabel id="gender-select-label">Jenis Kelamin</InputLabel>
                                    <Select
                                        labelId="gender-select-label"
                                        value={studentData.gender}
                                        label="Jenis Kelamin"
                                        onChange={(e) => handleStudentChange('gender', e.target.value)}
                                        sx={{ borderRadius: '12px' }}
                                    >
                                        <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                                        <MenuItem value="Perempuan">Perempuan</MenuItem>
                                    </Select>
                                </FormControl>

                                <Input label="Link Profil Instagram" value={studentData.instagram_profile_link} onChange={(e) => handleStudentChange('instagram_profile_link', e.target.value)} placeholder="https://instagram.com/username" />
                                <Input label="Kategori Konten" value={studentData.content_category} onChange={(e) => handleStudentChange('content_category', e.target.value)} placeholder="Contoh: Lifestyle, Tech" />
                            </div>
                          </>
                      ) : userRole === 'admin' ? (
                        <>
                          <div style={{ display: 'grid', gap: '20px' }}>
                              <Input 
                                label="Nama Lengkap" 
                                value={adminData.name} 
                                onChange={(e) => handleAdminChange('name', e.target.value)}
                              />
                              <Input 
                                label="Email" 
                                value={adminData.email} 
                                disabled 
                                style={{ backgroundColor: '#f8fafc', color: '#94a3b8' }} 
                              />
                          </div>
                        </>
                      ) : (
                          <>
                            <div style={{ display: 'grid', gap: '24px' }}>
                                <div>
                                  <div style={{ display: 'grid', gap: '20px' }}>
                                    <Input label="Nama Usaha" value={companyData.namaUsaha} onChange={(e) => handleCompanyChange('namaUsaha', e.target.value)} />
                                    <Input label="Email Akun" value={companyData.email} disabled style={{ backgroundColor: '#f8fafc', color: '#94a3b8' }} />
                                    <Input label="Nomor Telepon" value={companyData.noTelp} onChange={(e) => handleCompanyChange('noTelp', e.target.value)} />
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
                          background: '#6E00BE', 
                          border: 'none', 
                          borderRadius: '10px', 
                          color: '#fff', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(110, 0, 190, 0.1), 0 2px 4px -1px rgba(110, 0, 190, 0.06)'
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
                      Keamanan & Kata Sandi
                    </h3>
                    <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                      <Input label="Kata Sandi Saat Ini" type="password" value={passwordData.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} />
                      <Input label="Kata Sandi Baru" type="password" value={passwordData.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} />
                      <Input label="Konfirmasi Kata Sandi Baru" type="password" value={passwordData.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} />
                    </div>
                    <div style={{ marginTop: '32px' }}>
                      <Button onClick={handleSavePassword} style={{ padding: '12px 24px', background: '#6E00BE', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600 }}>
                        Ubah Kata Sandi
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
                                backgroundColor: notifPreferences[item.key] ? '#6E00BE' : '#cbd5e1',
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
