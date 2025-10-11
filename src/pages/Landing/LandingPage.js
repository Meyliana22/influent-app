import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '20px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo_influent.png" alt="Influent" style={{ height: '36px' }} />
          </div>
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#tentang" style={{ color: '#333', textDecoration: 'none', fontWeight: 500 }}>Tentang</a>
            <a href="#cara-kerja" style={{ color: '#333', textDecoration: 'none', fontWeight: 500 }}>Cara Kerja</a>
            <a href="#mengapa" style={{ color: '#333', textDecoration: 'none', fontWeight: 500 }}>Mengapa Influent?</a>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: '2px solid #6E00BE',
                borderRadius: '8px',
                color: '#6E00BE',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Masuk
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 24px',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '64px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 700, 
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              PLATFORM KOLABORASI UMKM & MAHASISWA PERTAMA DI INDONESIA
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              marginBottom: '32px',
              lineHeight: '1.6',
              opacity: 0.9
            }}>
              Hubungkan bisnis Anda dengan influencer muda berbakat atau mulai karir sebagai influencer
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => navigate('/register-umkm')}
                style={{
                  padding: '16px 32px',
                  background: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#6E00BE',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}
              >
                Daftar Sebagai UMKM
              </button>
              <button
                onClick={() => navigate('/register-student')}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  border: '2px solid #fff',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer'
                }}
              >
                Daftar Sebagai Mahasiswa
              </button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '400px',
              height: '400px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8rem'
            }}>
              🤝
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="tentang" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '64px' }}>
          <div style={{
            width: '400px',
            height: '300px',
            background: '#f0f0f0',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem'
          }}>
            📱
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '24px', color: '#2d3748' }}>
              Tentang Kami
            </h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '16px' }}>
              Influent adalah platform inovatif yang menghubungkan UMKM dengan mahasiswa influencer. 
              Kami percaya bahwa kolaborasi antara bisnis lokal dan talenta muda dapat menciptakan 
              dampak positif untuk ekonomi digital Indonesia.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568' }}>
              Dengan Influent, UMKM dapat menemukan influencer yang tepat untuk mempromosikan produk mereka, 
              sementara mahasiswa dapat mengembangkan skill dan mendapatkan penghasilan.
            </p>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" style={{ padding: '80px 24px', background: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            marginBottom: '64px', 
            textAlign: 'center',
            color: '#2d3748'
          }}>
            Cara Kerja
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '3rem',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}>
                📝
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                Buat Akun
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#6c757d' }}>
                Daftar sebagai UMKM atau Mahasiswa dengan mengisi form pendaftaran yang mudah dan cepat
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '3rem',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(240, 147, 251, 0.3)'
              }}>
                🔍
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                Cari atau Buat Campaign
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#6c757d' }}>
                UMKM membuat campaign, Mahasiswa mencari campaign yang sesuai dengan kriteria mereka
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '3rem',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(67, 233, 123, 0.3)'
              }}>
                🤝
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                Kolaborasi
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#6c757d' }}>
                Mahasiswa apply, UMKM review dan approve, lalu kolaborasi dimulai dengan pembayaran yang aman
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mengapa Influent Section */}
      <section id="mengapa" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            marginBottom: '64px', 
            textAlign: 'center',
            color: '#2d3748'
          }}>
            Mengapa Influent?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px' }}>
            {/* Filter */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                🎯
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                  Filter
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#6c757d' }}>
                  Cari influencer berdasarkan kategori, followers, gender, dan usia. 
                  Temukan partner yang tepat untuk brand Anda dengan sistem filter yang canggih.
                </p>
              </div>
            </div>

            {/* Pembayaran */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                💳
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                  Pembayaran
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#6c757d' }}>
                  Sistem pembayaran yang aman dan terpercaya. Dana ditahan hingga campaign selesai 
                  untuk melindungi kedua belah pihak.
                </p>
              </div>
            </div>

            {/* Komunikasi */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                💬
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                  Komunikasi
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#6c757d' }}>
                  Chat terintegrasi untuk komunikasi yang mudah antara UMKM dan influencer. 
                  Diskusi brief, revisi, dan feedback dalam satu platform.
                </p>
              </div>
            </div>

            {/* Review & Rating */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                ⭐
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', color: '#2d3748' }}>
                  Review & Rating
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#6c757d' }}>
                  Sistem review dan rating untuk membangun kepercayaan. 
                  Lihat track record influencer sebelum memulai kolaborasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '24px' }}>
            📢 Gabung Sekarang dan Bangun Kolaborasi yang Berdampak!
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.9, lineHeight: '1.6' }}>
            Mulailah perjalanan Anda bersama ribuan UMKM dan mahasiswa lainnya. 
            Raih peluang kolaborasi yang menguntungkan untuk bisnis atau karir Anda.
          </p>
          <button
            onClick={() => navigate('/register-umkm')}
            style={{
              padding: '16px 48px',
              background: '#fff',
              border: 'none',
              borderRadius: '12px',
              color: '#6E00BE',
              fontWeight: 700,
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            Gabung Sekarang
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a1a2e',
        color: '#fff',
        padding: '48px 24px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '48px',
            marginBottom: '32px'
          }}>
            <div>
              <img src="/logo_influent.png" alt="Influent" style={{ height: '32px', marginBottom: '16px', filter: 'brightness(0) invert(1)' }} />
              <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6' }}>
                Platform kolaborasi UMKM dan mahasiswa pertama di Indonesia
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Link Cepat</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#tentang" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>Tentang Kami</a>
                <a href="#cara-kerja" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>Cara Kerja</a>
                <a href="#mengapa" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>Mengapa Influent?</a>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Kontak</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', opacity: 0.8 }}>
                <p style={{ margin: 0 }}>📧 info@influent.id</p>
                <p style={{ margin: 0 }}>📱 +62 812-3456-7890</p>
                <p style={{ margin: 0 }}>📍 Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '0.9rem',
            opacity: 0.7
          }}>
            © 2025 Influent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
