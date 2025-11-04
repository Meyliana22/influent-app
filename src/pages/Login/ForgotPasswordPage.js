import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitButton } from '../../components/common';
import lockIcon from '../../assets/auth/lock.svg';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validasi email
    if (!email.trim()) {
      setError('Email tidak boleh kosong');
      return;
    }

    if (!validateEmail(email)) {
      setError('Format email tidak valid');
      return;
    }

    setIsLoading(true);
    
    // Simulasi kirim email reset password
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      
      // Redirect setelah 4 detik
      setTimeout(() => {
        navigate('/login-umkm');
      }, 4000);
    }, 1500);
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
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.15)',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(20px)'
      }}>
        {!isSubmitted ? (
          <>
            {/* Lock Illustration */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {/* Lock SVG Illustration */}
              <div style={{ 
                position: 'relative',
                display: 'inline-block',
              }}>               
                  {/* Lock Icon from SVG */}
                  <img 
                    src={lockIcon} 
                    alt="Lock" 
                    style={{ 
                      width: '120px', 
                      height: '120px',
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    }} 
                  />
              </div>

              {/* Title */}
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: '#2d3748',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Ganti Password
              </h1>
              
              {/* Description */}
              <p style={{ 
                color: '#6c757d', 
                fontSize: '0.95rem', 
                lineHeight: '1.6', 
                fontFamily: "'Montserrat', sans-serif",
                maxWidth: '340px',
                margin: '0 auto'
              }}>
                Masukkan email yang terdaftar, kami akan mengirimkan link untuk reset password Anda
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                border: '1px solid #fc8181',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <span style={{ 
                  color: '#c53030', 
                  fontSize: '0.9rem', 
                  fontWeight: 500, 
                  fontFamily: "'Montserrat', sans-serif" 
                }}>
                  {error}
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#2d3748',
                  fontSize: '0.9rem',
                  fontFamily: "'Montserrat', sans-serif"
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="email@example.com"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${error ? '#fc8181' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    fontFamily: "'Montserrat', sans-serif",
                    backgroundColor: isLoading ? '#f7fafc' : '#fff',
                    cursor: isLoading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => !error && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !error && (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>

              {/* Submit Button */}
              <div style={{ marginBottom: '16px' }}>
                <SubmitButton
                  isLoading={isLoading}
                  text="Ganti Password"
                  loadingText="Mengirim..."
                />
              </div>

              {/* Back to Login */}
              <div style={{ 
                textAlign: 'center',
                fontSize: '0.95rem',
                color: '#6c757d',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Ingat password Anda? {' '}
                <button
                  type="button"
                  onClick={() => navigate('/login-umkm')}
                  disabled={isLoading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#667eea',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontFamily: "'Montserrat', sans-serif",
                    opacity: isLoading ? 0.5 : 1,
                    textDecoration: 'underline'
                  }}
                >
                  Kembali ke Login
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div style={{ textAlign: 'center' }}>
              {/* Success Icon */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 10px 30px rgba(72, 187, 120, 0.3)'
              }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 700, 
                marginBottom: '16px',
                color: '#2d3748',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Email Terkirim!
              </h2>
              
              <p style={{ 
                color: '#6c757d', 
                fontSize: '0.95rem', 
                lineHeight: '1.7',
                marginBottom: '8px',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Kami telah mengirimkan link reset password ke email
              </p>
              
              <p style={{
                color: '#667eea',
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '24px',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                {email}
              </p>
              
              <div style={{
                background: 'linear-gradient(135deg, #ebf4ff 0%, #e0e7ff 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid #c3dafe'
              }}>
                <p style={{ 
                  color: '#4a5568', 
                  fontSize: '0.9rem',
                  margin: 0,
                  fontFamily: "'Montserrat', sans-serif",
                  lineHeight: '1.6'
                }}>
                  📧 Silakan cek <strong>inbox</strong> atau folder <strong>spam</strong> Anda
                </p>
              </div>
              
              <p style={{ 
                color: '#999', 
                fontSize: '0.85rem',
                fontFamily: "'Montserrat', sans-serif",
                marginBottom: '20px'
              }}>
                Anda akan diarahkan ke halaman login dalam beberapa detik...
              </p>

              <button
                onClick={() => navigate('/login-umkm')}
                style={{
                  background: 'transparent',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  color: '#667eea',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Montserrat', sans-serif",
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                }}
              >
                Kembali ke Login Sekarang
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
