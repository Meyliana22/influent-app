import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import { useToast } from '../../hooks/useToast';
import { SubmitButton } from '../../components/common';
import eyeIcon from '../../assets/auth/eye.svg';
import eyeOffIcon from '../../assets/auth/eye-off.svg';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({ email: [], password: [] });

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setEmail(location.state.email);
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const newErrors = { email: [], password: [] };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email.push('Email tidak boleh kosong');
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email.push('Format email tidak valid');
      hasError = true;
    }

    if (!password) {
      newErrors.password.push('Password tidak boleh kosong');
      hasError = true;
    } else if (password.length < 4) {
      newErrors.password.push('Password minimal 4 karakter');
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;
    setIsLoading(true);
    
    try {
      // Call real API
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // Store user data
      const userData = data.user || data.data || {};
      const userRole = userData.role || 'student';
      const userName = userData.name || userData.email || 'User';
      
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        email: userData.email || email,
        role: userRole,
        name: userName,
        rememberMe
      }));

      // Store refresh token if provided
      if (data.refresh_token) {
        localStorage.setItem('refreshToken', data.refresh_token);
      }

      showToast(`Selamat datang, ${userName}!`, 'success');

      // Redirect based on role
      let dashboardPath = '/umkm/dashboard';
      if (userRole === 'admin') dashboardPath = '/admin/dashboard';
      if (userRole === 'student') dashboardPath = '/student/dashboard';
      
      setTimeout(() => navigate(dashboardPath), 1000);

    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Email atau password salah. Coba lagi.');
      showToast('Login gagal. Periksa kembali kredensial Anda.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9ff 0%, #fef5ff 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px', 
      fontFamily: "'Montserrat', sans-serif"
    }}>
      {/* Login Card */}
      <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '48px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.15)', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: '#2d3748', letterSpacing: '-0.5px', fontFamily: "'Montserrat', sans-serif" }}>Masuk ke Akun Influent</h1>
          <p style={{ color: '#6c757d', fontSize: '0.95rem', fontWeight: 400, fontFamily: "'Montserrat', sans-serif" }}>Kelola campaign dan kolaborasi dengan mudah</p>
        </div>

        {successMessage && (
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircleIcon sx={{ fontSize: '1.25rem', color: '#16a34a' }} />
            <span style={{ color: '#16a34a', fontSize: '0.9rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>{successMessage}</span>
          </div>
        )}

        {loginError && (
          <div style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)', border: '1px solid #fc8181', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LockOutlineIcon sx={{ fontSize: '1.25rem', color: '#c53030' }} />
            <span style={{ color: '#c53030', fontSize: '0.9rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#2d3748', fontFamily: "'Montserrat', sans-serif" }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => { 
                setEmail(e.target.value); 
                setLoginError(''); 
                if (errors.email.length > 0) setErrors({ ...errors, email: [] }); 
              }} 
              placeholder="nama@example.com" 
              disabled={isLoading} 
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                fontSize: '0.95rem', 
                border: `2px solid ${errors.email.length > 0 ? '#fc8181' : '#e2e8f0'}`, 
                borderRadius: '12px', 
                outline: 'none', 
                transition: 'all 0.2s', 
                fontFamily: "'Montserrat', sans-serif", 
                backgroundColor: isLoading ? '#f7fafc' : '#fff', 
                cursor: isLoading ? 'not-allowed' : 'text',
                boxSizing: 'border-box'
              }} 
            />
            {errors.email.length > 0 && <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#e53e3e', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>{errors.email[0]}</div>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#2d3748', fontFamily: "'Montserrat', sans-serif" }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => { 
                  setPassword(e.target.value); 
                  setLoginError(''); 
                  if (errors.password.length > 0) setErrors({ ...errors, password: [] }); 
                }} 
                placeholder="Masukkan password"
                disabled={isLoading} 
                style={{ 
                  width: '100%', 
                  padding: '14px 48px 14px 16px', 
                  fontSize: '0.95rem', 
                  border: `2px solid ${errors.password.length > 0 ? '#fc8181' : '#e2e8f0'}`, 
                  borderRadius: '12px', 
                  outline: 'none', 
                  transition: 'all 0.2s', 
                  fontFamily: "'Montserrat', sans-serif", 
                  backgroundColor: isLoading ? '#f7fafc' : '#fff', 
                  cursor: isLoading ? 'not-allowed' : 'text',
                  boxSizing: 'border-box'
                }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                disabled={isLoading} 
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: isLoading ? 'not-allowed' : 'pointer', 
                  fontSize: '1.25rem', 
                  padding: '4px', 
                  opacity: isLoading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <img src={eyeIcon} alt="Hide password" style={{ width: '20px', height: '20px' }} /> : <img src={eyeOffIcon} alt="Show password" style={{ width: '20px', height: '20px' }} />}
              </button>
            </div>
            {errors.password.length > 0 && <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#e53e3e', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>{errors.password[0]}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#6c757d', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading} style={{ width: '18px', height: '18px', cursor: isLoading ? 'not-allowed' : 'pointer', accentColor: '#667eea' }} />
              Ingat saya
            </label>
            <button type="button" onClick={() => navigate('/forget-password')} disabled={isLoading} style={{ background: 'transparent', border: 'none', color: '#667eea', fontSize: '0.9rem', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 600, textDecoration: 'none', opacity: isLoading ? 0.5 : 1, fontFamily: "'Montserrat', sans-serif" }}>Lupa password?</button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <SubmitButton
              isLoading={isLoading}
              text="Masuk Sekarang"
              loadingText="Memproses..."
            />
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#6c757d', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>
            Belum punya akun? Daftar sekarang sebagai{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register/umkm')} 
              disabled={isLoading} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#667eea', 
                fontWeight: 700, 
                cursor: isLoading ? 'not-allowed' : 'pointer', 
                fontSize: '0.95rem', 
                opacity: isLoading ? 0.5 : 1, 
                fontFamily: "'Montserrat', sans-serif",
                padding: 0,
                margin: 0
              }}
            >
              UMKM
            </button>
            {' / '}
            <button 
              type="button" 
              onClick={() => navigate('/register/influencer')} 
              disabled={isLoading} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#667eea', 
                fontWeight: 700, 
                cursor: isLoading ? 'not-allowed' : 'pointer', 
                fontSize: '0.95rem', 
                opacity: isLoading ? 0.5 : 1, 
                fontFamily: "'Montserrat', sans-serif",
                padding: 0,
                margin: 0
              }}
            >
              Influencer
            </button>
          </div>
        </form>

        {/* <div style={{ marginTop: '32px', padding: '16px', background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)', borderRadius: '12px', border: '1px solid #cbd5e0' }}>
          <div style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, marginBottom: '8px', fontFamily: "'Montserrat', sans-serif" }}>?? Demo Credentials:</div>
          <div style={{ fontSize: '0.8rem', color: '#6c757d', lineHeight: '1.6', fontFamily: "'Montserrat', sans-serif" }}>
            <div><strong>UMKM:</strong> umkm@influent.com / umkm123</div>
            <div><strong>Admin:</strong> admin@influent.com / admin123</div>
          </div>
        </div> */}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="button" onClick={() => navigate('/')} disabled={isLoading} style={{ background: 'transparent', border: 'none', color: '#6c757d', fontSize: '0.9rem', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s', opacity: isLoading ? 0.5 : 1, fontFamily: "'Montserrat', sans-serif" }}>? Kembali ke Beranda</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
