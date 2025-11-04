import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Modal } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import { useToast } from '../../hooks/useToast';

function UserPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Profile State
  const [profileData, setProfileData] = useState({
    namaUsaha: 'Razer Indonesia',
    namaPemilik: 'John Doe',
    email: 'john@razer.com',
    noTelp: '081234567890',
    alamat: 'Jakarta Selatan',
    deskripsi: 'Official Razer Store Indonesia'
  });

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

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleNotifChange = (field) => {
    setNotifPreferences({ ...notifPreferences, [field]: !notifPreferences[field] });
  };

  const handleSaveProfile = () => {
    showToast('Profil berhasil disimpan!', 'success');
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Password baru tidak cocok!', 'error');
      return;
    }
    // Simulate save
    showToast('Password berhasil diubah!', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    showToast('Berhasil keluar', 'success');
    setTimeout(() => {
      navigate('/login-umkm');
    }, 500);
  };

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', flex: 1 }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ marginTop: '72px', background: '#f7fafc', minHeight: 'calc(100vh - 72px)', padding: '32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          margin: '0 0 32px 0', 
          fontSize: isMobile ? '1.5rem' : '2rem', 
          fontWeight: 700,
          color: '#2d3748'
        }}>
          Pengaturan Akun
        </h2>

        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '32px'
        }}>
          {/* Sidebar */}
          <Card padding="large">
            <nav>
              {[
                { id: 'profile', label: 'Profil Akun', icon: '👤' },
                { id: 'password', label: 'Ubah Password', icon: '🔒' },
                // { id: 'notifications', label: 'Notifikasi', icon: '🔔' },
                // { id: 'privacy', label: 'Privasi', icon: '🛡️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    marginBottom: '8px',
                    border: 'none',
                    borderRadius: '12px',
                    background: activeTab === tab.id ? COLORS.gradient : 'transparent',
                    color: activeTab === tab.id ? COLORS.white : COLORS.textPrimary,
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = COLORS.backgroundLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
            
            <hr style={{ margin: '24px 0', border: 'none', borderTop: `1px solid ${COLORS.border}` }} />
            
            <Button
              variant="danger"
              fullWidth
              onClick={handleLogout}
              style={{ justifyContent: 'flex-start' }}
            >
              🚪 Keluar
            </Button>
          </Card>

          {/* Content Area */}
          <div style={{ flex: 1 }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card padding="large">
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  color: COLORS.textPrimary
                }}>
                  Informasi Profil
                </h3>

                <div style={{ display: 'grid', gap: '20px' }}>
                  <Input
                    label="Nama Usaha"
                    type="text"
                    value={profileData.namaUsaha}
                    onChange={(e) => handleProfileChange('namaUsaha', e.target.value)}
                  />

                  <Input
                    label="Nama Pemilik"
                    type="text"
                    value={profileData.namaPemilik}
                    onChange={(e) => handleProfileChange('namaPemilik', e.target.value)}
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />

                  <Input
                    label="No. Telepon"
                    type="tel"
                    value={profileData.noTelp}
                    onChange={(e) => handleProfileChange('noTelp', e.target.value)}
                  />

                  <Input
                    label="Alamat"
                    type="text"
                    value={profileData.alamat}
                    onChange={(e) => handleProfileChange('alamat', e.target.value)}
                  />

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: COLORS.textPrimary }}>
                      Deskripsi Usaha
                    </label>
                    <textarea
                      value={profileData.deskripsi}
                      onChange={(e) => handleProfileChange('deskripsi', e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `2px solid ${COLORS.border}`,
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  style={{ 
                    marginTop: '24px',
                    padding: '8px 16px',
                    background: '#667eea',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Simpan Perubahan
                </Button>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card padding="large">
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  color: COLORS.textPrimary
                }}>
                  Ubah Password
                </h3>

                <div style={{ display: 'grid', gap: '20px', maxWidth: '500px' }}>
                  <Input
                    label="Password Saat Ini"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  />

                  <Input
                    label="Password Baru"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  />

                  <Input
                    label="Konfirmasi Password Baru"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSavePassword}
                  style={{ 
                    marginTop: '24px',
                    padding: '8px 16px',
                    background: '#667eea',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Update Password
                </Button>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card padding="large">
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  color: COLORS.textPrimary
                }}>
                  Preferensi Notifikasi
                </h3>

                <div style={{ display: 'grid', gap: '20px' }}>
                  {[
                    { key: 'emailNotif', label: 'Email Notifikasi', desc: 'Terima notifikasi via email' },
                    { key: 'pushNotif', label: 'Push Notifikasi', desc: 'Terima notifikasi push di browser' },
                    { key: 'applicationNotif', label: 'Notifikasi Aplikasi', desc: 'Notifikasi saat ada aplikasi baru' },
                    { key: 'messageNotif', label: 'Notifikasi Pesan', desc: 'Notifikasi saat ada pesan baru' },
                    { key: 'campaignNotif', label: 'Notifikasi Campaign', desc: 'Notifikasi update campaign' }
                  ].map(item => (
                    <div 
                      key={item.key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        border: `2px solid ${COLORS.border}`,
                        borderRadius: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: COLORS.textPrimary, marginBottom: '4px' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
                          {item.desc}
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={notifPreferences[item.key]}
                          onChange={() => handleNotifChange(item.key)}
                          style={{
                            width: '48px',
                            height: '24px',
                            cursor: 'pointer'
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <Card padding="large">
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  color: COLORS.textPrimary
                }}>
                  Privasi & Keamanan
                </h3>

                <div style={{ display: 'grid', gap: '24px' }}>
                  <div style={{
                    padding: '20px',
                    border: `2px solid ${COLORS.border}`,
                    borderRadius: '10px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: 600, color: COLORS.textPrimary }}>
                      Visibilitas Profil
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: COLORS.textSecondary, fontSize: '0.9rem' }}>
                      Siapa yang dapat melihat profil usaha Anda
                    </p>
                    <select style={{
                      padding: '10px 14px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit'
                    }}>
                      <option>Publik</option>
                      <option>Hanya Student Terdaftar</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div style={{
                    padding: '20px',
                    border: `2px solid ${COLORS.dangerLight}`,
                    borderRadius: '10px',
                    background: `${COLORS.dangerLight}15`
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: 600, color: COLORS.textPrimary }}>
                      Hapus Akun
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: COLORS.textSecondary, fontSize: '0.9rem' }}>
                      Hapus akun dan semua data Anda secara permanen
                    </p>
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Hapus Akun
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Konfirmasi Logout"
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: '24px', color: COLORS.text }}>
            Apakah Anda yakin ingin keluar?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={confirmLogout}>
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Akun"
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: '24px', color: COLORS.text }}>
            Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                setShowDeleteModal(false);
                showToast('Akun berhasil dihapus. Anda akan dialihkan...', 'success');
                setTimeout(() => {
                  navigate('/');
                }, 2000);
              }}
            >
              Ya, Hapus Akun
            </Button>
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
