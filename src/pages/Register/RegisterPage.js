import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import { useToast } from '../../hooks/useToast';
import { SubmitButton } from '../../components/common';
import eyeIcon from '../../assets/auth/eye.svg';
import eyeOffIcon from '../../assets/auth/eye-off.svg';

function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
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
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    namaUsaha: [],
    namaPemilik: [],
    email: [],
    noTelp: [],
    password: [],
    confirmPassword: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors untuk field yang sedang diubah
    if (errors[name].length > 0) {
      setErrors({
        ...errors,
        [name]: []
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordErrors = [];
    
    if (password.length < 8) {
      passwordErrors.push('Minimal 8 karakter');
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('Harus ada minimal 1 huruf besar');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('Harus ada minimal 1 huruf kecil');
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push('Harus ada minimal 1 angka');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordErrors.push('Harus ada minimal 1 karakter spesial (!@#$%^&*...)');
    }
    
    return passwordErrors;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      namaUsaha: [],
      namaPemilik: [],
      email: [],
      noTelp: [],
      password: [],
      confirmPassword: []
    };
    
    let hasError = false;

    // Validasi Nama Usaha
    if (!formData.namaUsaha.trim()) {
      newErrors.namaUsaha.push('Nama usaha tidak boleh kosong');
      hasError = true;
    } else if (formData.namaUsaha.trim().length < 3) {
      newErrors.namaUsaha.push('Nama usaha minimal 3 karakter');
      hasError = true;
    }

    // Validasi Nama Pemilik
    if (!formData.namaPemilik.trim()) {
      newErrors.namaPemilik.push('Nama pemilik tidak boleh kosong');
      hasError = true;
    } else if (formData.namaPemilik.trim().length < 3) {
      newErrors.namaPemilik.push('Nama pemilik minimal 3 karakter');
      hasError = true;
    }

    // Validasi Email
    if (!formData.email.trim()) {
      newErrors.email.push('Email tidak boleh kosong');
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email.push('Format email tidak valid');
      hasError = true;
    }

    // Validasi No Telepon
    if (!formData.noTelp.trim()) {
      newErrors.noTelp.push('Nomor telepon tidak boleh kosong');
      hasError = true;
    } else if (!validatePhone(formData.noTelp)) {
      newErrors.noTelp.push('Format nomor telepon tidak valid (contoh: 08123456789)');
      hasError = true;
    }

    // Validasi Password
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors;
      hasError = true;
    }

    // Validasi Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword.push('Konfirmasi password tidak boleh kosong');
      hasError = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword.push('Password tidak sama');
      hasError = true;
    }

    // Set errors
    setErrors(newErrors);

    // Jika ada error, stop
    if (hasError) {
      return;
    }

    setIsLoading(true);
    
    // Simulasi registrasi
    setTimeout(() => {
      // Simpan data user jika rememberMe diaktifkan
      const userData = {
        email: formData.email,
        role: 'umkm',
        name: formData.namaPemilik,
        namaUsaha: formData.namaUsaha,
        noTelp: formData.noTelp,
        rememberMe: rememberMe
      };
      
      if (rememberMe) {
        // Simpan kredensial ke localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberedPassword', formData.password); // Note: Dalam production, jangan simpan password plain text!
      }
      
      showToast('Registrasi berhasil! Silakan login.', 'success');
      setIsLoading(false);
      
      // Navigate setelah 1 detik
      setTimeout(() => {
        navigate('/login-umkm');
      }, 1000);
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9ff 0%, #fef5ff 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Montserrat', sans-serif"
    }}>
      {/* Register Card */}
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(20px)'
      }}>
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/login-umkm')}
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            opacity: isLoading ? 0.5 : 1,
            transition: 'transform 0.2s, opacity 0.2s',
          }}
          onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateX(-4px)')}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
          ← 
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#1a1f36',
            margin: '0 0 8px 0',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Daftar Akun UMKM
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: '#6c757d',
            margin: 0,
            lineHeight: '1.5',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Daftarkan usaha Anda dan mulai berkolaborasi dengan influencer
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>
          {/* Nama Usaha */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1f36',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              Nama Usaha <span style={{ color: '#fc8181' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama usaha"
              name="namaUsaha"
              value={formData.namaUsaha}
              onChange={handleChange}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                border: errors.namaUsaha.length > 0 ? '2px solid #fc8181' : '2px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: isLoading ? '#f7fafc' : 'white',
                cursor: isLoading ? 'not-allowed' : 'text',
                boxSizing: 'border-box',
                fontFamily: "'Montserrat', sans-serif"
              }}
              onFocus={(e) => !errors.namaUsaha.length && (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => !errors.namaUsaha.length && (e.target.style.borderColor = '#e2e8f0')}
            />
            {errors.namaUsaha.length > 0 && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#c53030',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                ⚠️ {errors.namaUsaha[0]}
              </div>
            )}
          </div>

          {/* Nama Pemilik */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1f36',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              Nama Pemilik <span style={{ color: '#fc8181' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama pemilik"
              name="namaPemilik"
              value={formData.namaPemilik}
              onChange={handleChange}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                border: errors.namaPemilik.length > 0 ? '2px solid #fc8181' : '2px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: isLoading ? '#f7fafc' : 'white',
                cursor: isLoading ? 'not-allowed' : 'text',
                boxSizing: 'border-box',
                fontFamily: "'Montserrat', sans-serif"
              }}
              onFocus={(e) => !errors.namaPemilik.length && (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => !errors.namaPemilik.length && (e.target.style.borderColor = '#e2e8f0')}
            />
            {errors.namaPemilik.length > 0 && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#c53030',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                ⚠️ {errors.namaPemilik[0]}
              </div>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1f36',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              Email <span style={{ color: '#fc8181' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="Masukkan email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                border: errors.email.length > 0 ? '2px solid #fc8181' : '2px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: isLoading ? '#f7fafc' : 'white',
                cursor: isLoading ? 'not-allowed' : 'text',
                boxSizing: 'border-box',
                fontFamily: "'Montserrat', sans-serif"
              }}
              onFocus={(e) => !errors.email.length && (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => !errors.email.length && (e.target.style.borderColor = '#e2e8f0')}
            />
            {errors.email.length > 0 && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#c53030',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                ⚠️ {errors.email[0]}
              </div>
            )}
          </div>

          {/* No Telepon */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1f36',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              No. Telepon <span style={{ color: '#fc8181' }}>*</span>
            </label>
            <input
              type="tel"
              placeholder="08123456789"
              name="noTelp"
              value={formData.noTelp}
              onChange={handleChange}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                border: errors.noTelp.length > 0 ? '2px solid #fc8181' : '2px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: isLoading ? '#f7fafc' : 'white',
                cursor: isLoading ? 'not-allowed' : 'text',
                boxSizing: 'border-box',
                fontFamily: "'Montserrat', sans-serif"
              }}
              onFocus={(e) => !errors.noTelp.length && (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => !errors.noTelp.length && (e.target.style.borderColor = '#e2e8f0')}
            />
            {errors.noTelp.length > 0 && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#c53030',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                ⚠️ {errors.noTelp[0]}
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1f36',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              Password <span style={{ color: '#fc8181' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  paddingRight: '50px',
                  fontSize: '0.95rem',
                  border: errors.password.length > 0 ? '2px solid #fc8181' : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: isLoading ? '#f7fafc' : 'white',
                  cursor: isLoading ? 'not-allowed' : 'text',
                  boxSizing: 'border-box',
                fontFamily: "'Montserrat', sans-serif"
                }}
                onFocus={(e) => !errors.password.length && (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => !errors.password.length && (e.target.style.borderColor = '#e2e8f0')}
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
            {errors.password.length > 0 && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#c53030',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                {errors.password.map((error, idx) => (
                  <div key={idx} style={{ marginBottom: idx < errors.password.length - 1 ? '4px' : '0' }}>
                    ⚠️ {error}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1f36',
              fontFamily: "'Montserrat', sans-serif"
            }}>
              Konfirmasi Password <span style={{ color: '#fc8181' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ketik ulang password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  paddingRight: '50px',
                  fontSize: '0.95rem',
                  border: errors.confirmPassword.length > 0 ? '2px solid #fc8181' : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: isLoading ? '#f7fafc' : 'white',
                  cursor: isLoading ? 'not-allowed' : 'text',
                  boxSizing: 'border-box',
                fontFamily: "'Montserrat', sans-serif"
                }}
                onFocus={(e) => !errors.confirmPassword.length && (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => !errors.confirmPassword.length && (e.target.style.borderColor = '#e2e8f0')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  opacity: isLoading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showConfirmPassword ? <img src={eyeIcon} alt="Hide password" style={{ width: '20px', height: '20px' }} /> : <img src={eyeOffIcon} alt="Show password" style={{ width: '20px', height: '20px' }} />}
              </button>
            </div>
            {errors.confirmPassword.length > 0 && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#c53030',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                ⚠️ {errors.confirmPassword[0]}
              </div>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#6c757d',
              fontWeight: 500,
              fontFamily: "'Montserrat', sans-serif"
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  accentColor: '#667eea'
                }}
              />
              Ingat saya
            </label>
          </div>

          {/* Submit Button */}
          <SubmitButton
            isLoading={isLoading}
            text="Daftar Sekarang"
            loadingText="Mendaftar..."
          />
        </form>

        {/* Login Link */}
        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '0.95rem',
          color: '#6c757d',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={() => navigate('/login-umkm')}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              padding: 0,
              textDecoration: 'underline',
              opacity: isLoading ? 0.5 : 1,
              fontFamily: "'Montserrat', sans-serif"
            }}
          >
            Login di sini
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

