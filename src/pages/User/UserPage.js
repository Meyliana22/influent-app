import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Card, Button, Input, Alert } from '../../components/common';
import { COLORS } from '../../constants/colors';

function UserPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSavePopup, setShowSavePopup] = useState(false);

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
    // Simulate save
    setShowSavePopup(true);
    setTimeout(() => setShowSavePopup(false), 2000);
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }
    // Simulate save
    setShowSavePopup(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setShowSavePopup(false), 2000);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      navigate('/login');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: COLORS.background,
      fontFamily: 'Montserrat, Arial, sans-serif'
    }}>
      {/* Header */}
      <Navbar userType="umkm" />

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ 
          margin: '0 0 32px 0', 
          fontSize: '2rem', 
          fontWeight: 700,
          color: '#2d3748'
        }}>
          Pengaturan Akun
        </h2>

        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Sidebar */}
          <Card padding="large" style={{ width: '280px', height: 'fit-content' }}>
            <nav>
              {[
                { id: 'profile', label: 'Profil Akun', icon: '👤' },
                { id: 'password', label: 'Ubah Password', icon: '🔒' },
                { id: 'notifications', label: 'Notifikasi', icon: '🔔' },
                { id: 'privacy', label: 'Privasi', icon: '🛡️' }
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
                  variant="primary"
                  onClick={handleSaveProfile}
                  style={{ marginTop: '24px' }}
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
                  variant="primary"
                  onClick={handleSavePassword}
                  style={{ marginTop: '24px' }}
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
                      onClick={() => {
                        if (window.confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan!')) {
                          alert('Akun akan dihapus');
                        }
                      }}
                    >
                      Hapus Akun
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Save Success Popup */}
      {showSavePopup && (
        <Alert
          type="success"
          message="✓ Perubahan berhasil disimpan!"
          position="top-right"
        />
      )}
    </div>
  );
}

export default UserPage;
