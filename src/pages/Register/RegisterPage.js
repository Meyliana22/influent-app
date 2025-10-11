import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/common';
import { COLORS } from '../../constants/colors';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaUsaha: '',
    namaPemilik: '',
    email: '',
    noTelp: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validasi
    if (formData.password !== formData.confirmPassword) {
      alert('Password dan konfirmasi password tidak sama!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    // Simulasi registrasi - bisa diganti dengan API call
    alert('Registrasi berhasil! Silakan login.');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Montserrat, Arial, sans-serif'
    }}>
      <div style={{
        background: COLORS.white,
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        margin: '24px 0'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            marginBottom: '8px',
            color: COLORS.textPrimary
          }}>
            Daftar Akun Usaha
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: '0.95rem' }}>
            Mulai kolaborasi dengan influencer berbakat
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister}>
          {/* Nama Usaha */}
          <Input
            label="Nama Usaha"
            type="text"
            name="namaUsaha"
            value={formData.namaUsaha}
            onChange={handleChange}
            placeholder="Contoh: Toko Kue Ibu"
            required
            style={{ marginBottom: '20px' }}
          />

          {/* Nama Pemilik */}
          <Input
            label="Nama Pemilik"
            type="text"
            name="namaPemilik"
            value={formData.namaPemilik}
            onChange={handleChange}
            placeholder="Nama lengkap pemilik"
            required
            style={{ marginBottom: '20px' }}
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
            style={{ marginBottom: '20px' }}
          />

          {/* No Telepon */}
          <Input
            label="Nomor Telepon"
            type="tel"
            name="noTelp"
            value={formData.noTelp}
            onChange={handleChange}
            placeholder="08123456789"
            required
            style={{ marginBottom: '20px' }}
          />

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              color: COLORS.textPrimary,
              fontSize: '0.9rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingRight: '48px',
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              color: COLORS.textPrimary,
              fontSize: '0.9rem'
            }}>
              Konfirmasi Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingRight: '48px',
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            style={{ marginBottom: '24px' }}
          >
            DAFTAR
          </Button>

          {/* Login Link */}
          <div style={{ 
            textAlign: 'center',
            fontSize: '0.95rem',
            color: COLORS.textSecondary
          }}>
            Sudah punya akun? {' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.primary,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Masuk di sini
            </button>
          </div>
        </form>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            ← Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
