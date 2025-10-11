import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/common';
import { COLORS } from '../../constants/colors';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulasi login - bisa diganti dengan API call
    if (email && password) {
      alert('Login berhasil!');
      navigate('/'); // Redirect ke dashboard UMKM
    }
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
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700, 
            marginBottom: '8px',
            color: COLORS.textPrimary
          }}>
            Masuk ke Akun Usaha
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: '0.95rem' }}>
            Kelola campaign dan kolaborasi Anda
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            style={{ marginBottom: '20px' }}
          />

          {/* Password Input */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ 
                fontWeight: 600,
                color: COLORS.textPrimary,
                fontSize: '0.9rem'
              }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forget-password')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: COLORS.primary,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Lupa Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
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

          {/* Login Button */}
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            style={{ marginBottom: '24px' }}
          >
            MASUK
          </Button>

          {/* Register Link */}
          <div style={{ 
            textAlign: 'center',
            fontSize: '0.95rem',
            color: COLORS.textSecondary
          }}>
            Belum punya akun? {' '}
            <button
              type="button"
              onClick={() => navigate('/register-umkm')}
              style={{
                background: 'transparent',
                border: 'none',
                color: COLORS.primary,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Daftar di sini
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

export default LoginPage;
