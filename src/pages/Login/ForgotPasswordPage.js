import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulasi kirim email reset password
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Montserrat, Arial, sans-serif'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔐</div>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: '#2d3748'
              }}>
                Ganti Password
              </h1>
              <p style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Masukkan email yang terdaftar, kami akan mengirimkan link untuk reset password Anda
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  marginBottom: '16px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                }}
              >
                Ganti Password
              </button>

              {/* Back to Login */}
              <div style={{ 
                textAlign: 'center',
                fontSize: '0.95rem',
                color: '#6c757d'
              }}>
                Ingat password Anda? {' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#667eea',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem'
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
              <div style={{ fontSize: '5rem', marginBottom: '24px' }}>✅</div>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                marginBottom: '16px',
                color: '#28a745'
              }}>
                Email Terkirim!
              </h2>
              <p style={{ 
                color: '#6c757d', 
                fontSize: '1rem', 
                lineHeight: '1.7',
                marginBottom: '24px'
              }}>
                Kami telah mengirimkan link reset password ke email <strong>{email}</strong>. 
                Silakan cek inbox atau folder spam Anda.
              </p>
              <p style={{ 
                color: '#999', 
                fontSize: '0.85rem'
              }}>
                Anda akan diarahkan ke halaman login dalam beberapa detik...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
