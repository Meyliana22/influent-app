import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import personDashboard from '../../assets/dashboard/person.svg';
import personInfluent from '../../assets/dashboard/person_influent.svg';
import searchIcon from '../../assets/dashboard/searchIcon.svg';
import accountIcon from '../../assets/dashboard/account.svg';
import collabIcon from '../../assets/dashboard/collab.svg';
import filterIcon from '../../assets/dashboard/filter.svg';
import paymentIcon from '../../assets/dashboard/payment.svg';
import reviewIcon from '../../assets/dashboard/review.svg';
import chatIcon from '../../assets/dashboard/chat.svg';
import logoFooter from '../../assets/dashboard/footerLogo.svg';
import emailIcon from '../../assets/dashboard/email.svg';
import phoneIcon from '../../assets/dashboard/phone.svg';
import locationIcon from '../../assets/dashboard/location.svg';
import broadcastIcon from '../../assets/dashboard/broadcast.svg';

function LandingPage() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 800;
  const isTablet = windowWidth < 1020 && windowWidth >= 800;

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
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <img src={logo} alt="Influent" style={{ height: '28px' }} />
          </div>
          <nav style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '32px', 
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            {!isMobile && (
              <>
                <a href="#tentang" style={{ color: '#333', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Tentang</a>
                <a href="#cara-kerja" style={{ color: '#333', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Cara Kerja</a>
                <a href="#mengapa" style={{ color: '#333', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Mengapa Influent?</a>
              </>
            )}
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: isMobile ? '8px 16px' : '10px 24px',
                background: 'transparent',
                border: '2px solid #6E00BE',
                borderRadius: '8px',
                color: '#6E00BE',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
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
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '48px',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: isMobile ? '2rem' : '3rem', 
              fontWeight: 700, 
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              PLATFORM KOLABORASI UMKM & MAHASISWA UNTUK PROMOSI DIGITAL
            </h1>
            <p style={{ 
              fontSize: isMobile ? '1rem' : '1.2rem', 
              marginBottom: '32px',
              lineHeight: '1.6',
              opacity: 0.9
            }}>
             Influent mempertemukan UMKM dengan mahasiswa influencer untuk menciptakan promosi digital yang efektif dan berdampak.
              Gabung sekarang sebagai UMKM atau mahasiswa influencer!
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <button
                onClick={() => navigate('/register/umkm')}
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
                onClick={() => navigate('/register/influencer')}
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
                Daftar Sebagai Influencer
              </button>
            </div>
          </div>
          {!isMobile && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: isTablet ? '300px' : '400px',
                height: isTablet ? '300px' : '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8rem',
                transition: 'all 0.3s ease'
              }}>
                <img 
                  src={personDashboard} 
                  alt="Dashboard"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="tentang" style={{ padding: isMobile ? '40px 24px' : '80px 24px', background: '#fff' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '32px' : '64px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {!isMobile && (
            <div style={{
              width: isTablet ? '350px' : '500px',
              height: isTablet ? '280px' : '400px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              flexShrink: 0,
              transition: 'all 0.3s ease'
            }}>
              <img src={personInfluent} alt="About Us" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.8rem' : (isTablet ? '2rem' : '2.5rem'), 
              fontWeight: 700, 
              marginBottom: '24px', 
              color: '#2d3748' 
            }}>
              Tentang Kami
            </h2>
            <p style={{ 
              fontSize: isMobile ? '0.95rem' : '1.1rem', 
              lineHeight: '1.8', 
              color: '#4a5568', 
              marginBottom: '16px' 
            }}>
              Influent adalah platform inovatif yang menghubungkan UMKM dengan mahasiswa influencer. 
              Kami percaya bahwa kolaborasi antara pelaku bisnis lokal dan talenta muda dapat menciptakan 
              dampak positif untuk ekonomi digital Indonesia.
            </p>
            <p style={{ 
              fontSize: isMobile ? '0.95rem' : '1.1rem', 
              lineHeight: '1.8', 
              color: '#4a5568' 
            }}>
              Dengan Influent, UMKM dapat menemukan mahasiswa influencer yang tepat untuk mempromosikan produk mereka, 
              sementara mahasiswa influencer dapat mengembangkan skill dan mendapatkan penghasilan.
            </p>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" style={{ padding: isMobile ? '40px 24px' : '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: isMobile ? '1.8rem' : (isTablet ? '2rem' : '2.5rem'), 
            fontWeight: 700, 
            marginBottom: isMobile ? '32px' : '64px', 
            textAlign: 'center',
            color: '#2d3748'
          }}>
            Cara Kerja
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
            gap: isMobile ? '32px' : '48px'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: isMobile ? '100px' : '120px',
                height: isMobile ? '100px' : '120px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '3rem'
              }}>
                <img src={accountIcon} alt="Buat Akun" style={{ width: '80%', height: '80%' }} />
              </div>
              <h3 style={{ 
                fontSize: isMobile ? '1.2rem' : '1.5rem', 
                fontWeight: 600, 
                marginBottom: '12px', 
                color: '#2d3748' 
              }}>
                Buat Akun
              </h3>
              <p style={{ 
                fontSize: isMobile ? '0.9rem' : '1rem', 
                lineHeight: '1.6', 
                color: '#6c757d' 
              }}>
                Daftar sebagai UMKM atau Mahasiswa dengan mengisi form pendaftaran yang mudah dan cepat
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: isMobile ? '100px' : '120px',
                height: isMobile ? '100px' : '120px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '3rem'
              }}>
                <img src={searchIcon} alt="Cari atau Buat Campaign" style={{ width: '80%', height: '80%' }} />
              </div>
              <h3 style={{ 
                fontSize: isMobile ? '1.2rem' : '1.5rem', 
                fontWeight: 600, 
                marginBottom: '12px', 
                color: '#2d3748' 
              }}>
                Cari atau Buat Campaign
              </h3>
              <p style={{ 
                fontSize: isMobile ? '0.9rem' : '1rem', 
                lineHeight: '1.6', 
                color: '#6c757d' 
              }}>
                UMKM membuat campaign, Mahasiswa mencari campaign yang sesuai dengan kriteria mereka
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: isMobile ? '100px' : '120px',
                height: isMobile ? '100px' : '120px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '3rem'
              }}>
                <img src={collabIcon} alt="Kolaborasi" style={{ width: '80%', height: '80%' }} />
              </div>
              <h3 style={{ 
                fontSize: isMobile ? '1.2rem' : '1.5rem', 
                fontWeight: 600, 
                marginBottom: '12px', 
                color: '#2d3748' 
              }}>
                Kolaborasi
              </h3>
              <p style={{ 
                fontSize: isMobile ? '0.9rem' : '1rem', 
                lineHeight: '1.6', 
                color: '#6c757d' 
              }}>
                Mahasiswa apply, UMKM review dan approve, lalu kolaborasi dimulai dengan pembayaran yang aman
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mengapa Influent Section */}
      <section id="mengapa" style={{ padding: isMobile ? '40px 24px' : '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: isMobile ? '1.8rem' : (isTablet ? '2rem' : '2.5rem'), 
            fontWeight: 700, 
            marginBottom: isMobile ? '32px' : '64px', 
            textAlign: 'center',
            color: '#2d3748'
          }}>
            Mengapa Influent?
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap: isMobile ? '32px' : '48px' 
          }}>
            {/* Filter */}
            <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px' }}>
              <div style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                <img src={filterIcon} alt="Filter" style={{ width: '80%', height: '80%' }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: isMobile ? '1.2rem' : '1.5rem', 
                  fontWeight: 600, 
                  marginBottom: '12px', 
                  color: '#2d3748' 
                }}>
                  Filter
                </h3>
                <p style={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem', 
                  lineHeight: '1.7', 
                  color: '#6c757d' 
                }}>
                  Cari influencer berdasarkan kategori, followers, gender, dan usia. 
                  Temukan partner yang tepat untuk brand Anda dengan sistem filter.
                </p>
              </div>
            </div>

            {/* Pembayaran */}
            <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px' }}>
              <div style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                <img src={paymentIcon} alt="Pembayaran" style={{ width: '80%', height: '80%' }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: isMobile ? '1.2rem' : '1.5rem', 
                  fontWeight: 600, 
                  marginBottom: '12px', 
                  color: '#2d3748' 
                }}>
                  Pembayaran
                </h3>
                <p style={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem', 
                  lineHeight: '1.7', 
                  color: '#6c757d' 
                }}>
                  Sistem pembayaran yang aman dan terpercaya. Dana ditahan hingga campaign selesai 
                  untuk melindungi kedua belah pihak.
                </p>
              </div>
            </div>

            {/* Komunikasi */}
            <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px' }}>
              <div style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                <img src={chatIcon} alt="Komunikasi" style={{ width: '80%', height: '80%' }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: isMobile ? '1.2rem' : '1.5rem', 
                  fontWeight: 600, 
                  marginBottom: '12px', 
                  color: '#2d3748' 
                }}>
                  Komunikasi
                </h3>
                <p style={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem', 
                  lineHeight: '1.7', 
                  color: '#6c757d' 
                }}>
                  Chat terintegrasi untuk komunikasi yang mudah antara UMKM dan influencer. 
                  Diskusi brief, revisi, dan feedback dalam satu platform.
                </p>
              </div>
            </div>

            {/* Review & Rating */}
            <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px' }}>
              <div style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                background: '#f0f0f0',
                borderRadius: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>
                <img src={reviewIcon} alt="Review & Rating" style={{ width: '80%', height: '80%' }} />
              </div>
              <div>
                <h3 style={{ 
                  fontSize: isMobile ? '1.2rem' : '1.5rem', 
                  fontWeight: 600, 
                  marginBottom: '12px', 
                  color: '#2d3748' 
                }}>
                  Review & Rating
                </h3>
                <p style={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem', 
                  lineHeight: '1.7', 
                  color: '#6c757d' 
                }}>
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
        padding: isMobile ? '40px 24px' : '80px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: isMobile ? '1.5rem' : (isTablet ? '2rem' : '2.5rem'), 
            fontWeight: 700, 
            marginBottom: '24px' 
          }}>
            📢 Gabung Sekarang dan Bangun Kolaborasi yang Berdampak!
          </h2>
          <p style={{ 
            fontSize: isMobile ? '1rem' : '1.2rem', 
            marginBottom: '32px', 
            opacity: 0.9, 
            lineHeight: '1.6' 
          }}>
            Mulailah perjalanan Anda bersama UMKM dan mahasiswa influencer lainnya. 
            Raih peluang kolaborasi yang menguntungkan untuk bisnis atau karir Anda.
          </p>
          <button
            onClick={() => navigate('/register-umkm')}
            style={{
              padding: isMobile ? '12px 32px' : '16px 48px',
              background: '#fff',
              border: 'none',
              borderRadius: '12px',
              color: '#6E00BE',
              fontWeight: 700,
              fontSize: isMobile ? '1rem' : '1.2rem',
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
        padding: isMobile ? '32px 24px 16px' : '48px 24px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'), 
            gap: isMobile ? '32px' : '48px',
            marginBottom: '32px',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <div>
              <img src={logoFooter} alt="Influent" style={{ height: '32px', marginBottom: '16px' }} />
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
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px', 
                fontSize: '0.9rem', 
                opacity: 0.8,
                alignItems: isMobile ? 'center' : 'flex-start'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={emailIcon} alt="Email" style={{ width: '16px', height: '16px' }} />
                  <span>info@influent.id</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={phoneIcon} alt="Telepon" style={{ width: '16px', height: '16px' }} />
                  <span>+62 812-3456-7890</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={locationIcon} alt="Lokasi" style={{ width: '16px', height: '16px' }} />
                  <span>Jakarta, Indonesia</span>
                </div>
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
