import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import { FaCheckCircle } from 'react-icons/fa';
import { FileText, ClipboardList, Notebook, FileEdit } from 'lucide-react';

function PaymentSuccess() {
  const navigate = useNavigate();
  const { id } = useParams(); // Campaign ID from URL

  // Add confetti animation effect
  useEffect(() => {
    // Simple confetti animation using emojis
    const confettiEmojis = ['🎉', '✨', '🎊', '⭐', '💫'];
    const confettiElements = [];

    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.innerText = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-20px';
      confetti.style.fontSize = '2rem';
      confetti.style.opacity = '0.8';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
      
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    // Add keyframes for animation
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fall {
        to {
          top: 100vh;
          transform: rotate(${Math.random() * 360}deg);
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      confettiElements.forEach(el => el.remove());
      style.remove();
    };
  }, []);

  return (
    <div style={{ 
      background: COLORS.background, 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, Arial, sans-serif',
      padding: '24px'
    }}>
      <div style={{ 
        maxWidth: '550px', 
        width: '100%',
        background: COLORS.white,
        borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        padding: '48px 32px',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 32px auto',
          background: '#43e97b',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(67, 233, 123, 0.3)',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <FaCheckCircle style={{ 
            fontSize: '4rem', 
            color: COLORS.white 
          }} />
        </div>

        {/* Success Message */}
        <h2 style={{ 
          fontWeight: 700, 
          fontSize: '1.8rem',
          marginBottom: '16px',
          color: COLORS.textPrimary,
          lineHeight: '1.3'
        }}>
          Pembayaran Berhasil!
        </h2>
        
        <p style={{ 
          fontSize: '1.1rem',
          color: COLORS.textSecondary,
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          Campaign kamu sedang diproses dan akan segera aktif. Influencer dapat mulai mendaftar ke campaign Anda.
        </p>

        {/* Info Box */}
        <div style={{
          padding: '16px',
          background: COLORS.primaryLight,
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <p style={{ 
            margin: '0 0 8px 0', 
            fontSize: '0.9rem',
            color: COLORS.textPrimary,
            fontWeight: 600,
            display: 'flex', 
            alignItems: 'center',
          }}>
            <FileText size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Apa selanjutnya?
          </p>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '0.85rem',
            color: COLORS.textSecondary,
            lineHeight: '1.8'
          }}>
            <li>Influencer akan melihat dan mendaftar ke campaign Anda</li>
            <li>Anda dapat melihat dan memilih influencer yang sesuai</li>
            <li>Campaign akan berjalan sesuai timeline yang ditentukan</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => navigate('/campaigns')}
            style={{
              background: '#667eea 100%',
              borderRadius: '12px',
              fontWeight: 700,
              padding: '16px',
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
              mpaign Saya
          </button>
          
          <button
            onClick={() => navigate(`/campaign/${id}/applicants`)}
            style={{
              borderRadius: '12px',
              fontWeight: 600,
              padding: '16px',
              fontSize: '1rem',
              border: `2px solid ${COLORS.primary}`,
              color: COLORS.primary,
              background: 'transparent',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.primary;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = COLORS.primary;
            }}
          >
           Lihat Pelamar
          </button>
        </div>

        {/* Additional Info */}
        <p style={{ 
          marginTop: '24px',
          fontSize: '0.75rem',
          color: COLORS.textLight,
          lineHeight: '1.5'
        }}>
          Terima kasih telah menggunakan Influent!<br />
          Notifikasi akan dikirim ketika ada influencer yang mendaftar.
        </p>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default PaymentSuccess;
