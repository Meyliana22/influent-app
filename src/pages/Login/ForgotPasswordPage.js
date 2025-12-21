import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitButton, Input } from '../../components/common';
import lockIcon from '../../assets/auth/lock.svg';
import authService from '../../services/authService';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  // Stages: 'email' (request OTP), 'reset' (submit OTP + new password), 'success' (done)
  const [stage, setStage] = useState('email'); 
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !validateEmail(email)) {
      setError('Format email tidak valid');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStage('reset'); // Move to next stage
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Gagal mengirim OTP. Pastikan email terdaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
        setError('OTP wajib diisi');
        return;
    }
    if (!newPassword || newPassword.length < 6) {
        setError('Password minimal 6 karakter');
        return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setStage('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
        console.error('Reset password error:', err);
        setError(err.message || 'Gagal mereset password. Cek OTP Anda.');
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
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(110, 0, 190, 0.15)',
        border: '1px solid rgba(110, 0, 190, 0.15)',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(20px)'
      }}>
        {/* Render Logic based on Stage */}
        {stage !== 'success' && (
             <div style={{ textAlign: 'center', marginBottom: '16px' }}>
               <div style={{ position: 'relative', display: 'inline-block' }}>               
                   <img src={lockIcon} alt="Lock" style={{ width: '100px', height: '100px', marginBottom: '16px' }} />
               </div>
               <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: '#2d3748' }}>
                 {stage === 'email' ? 'Lupa Password?' : 'Reset Password'}
               </h1>
               <p style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.6' }}>
                 {stage === 'email' 
                    ? 'Masukkan email Anda untuk menerima kode OTP.' 
                    : `Masukkan kode OTP yang dikirim ke ${email} dan password baru Anda.`}
               </p>
             </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '12px', padding: '12px',
            marginBottom: '20px', color: '#c53030', fontSize: '0.9rem', textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* STAGE 1: EMAIL FORM */}
        {stage === 'email' && (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: '24px' }}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  disabled={isLoading}
                />
              </div>
              <SubmitButton isLoading={isLoading} text="Kirim OTP" loadingText="Mengirim..." />
            </form>
        )}

        {/* STAGE 2: RESET FORM (OTP + NEW PASS) */}
        {stage === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '16px' }}>
                <Input
                  label="Kode OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  disabled={isLoading}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <Input
                  label="Password Baru"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  disabled={isLoading}
                />
              </div>
              <SubmitButton isLoading={isLoading} text="Simpan Password" loadingText="Menyimpan..." />
            </form>
        )}

        {/* STAGE 3: SUCCESS */}
        {stage === 'success' && (
           <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: '#48bb78',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#2d3748' }}>
                Password Berhasil Diubah!
              </h2>
              <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                Anda sekarang dapat login menggunakan password baru Anda.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent', border: '2px solid #6E00BE', borderRadius: '12px',
                  color: '#6E00BE', padding: '10px 24px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Login Sekarang
              </button>
           </div>
        )}

        {/* Back Link (Only for email/reset stages) */}
        {stage !== 'success' && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => stage === 'reset' ? setStage('email') : navigate('/login')}
                  style={{ background: 'transparent', border: 'none', color: '#6E00BE', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {stage === 'reset' ? 'Kembali ke Email' : 'Kembali ke Login'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
}

export default ForgotPasswordPage;
