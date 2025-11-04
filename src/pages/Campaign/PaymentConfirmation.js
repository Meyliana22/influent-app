import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { COLORS } from '../../constants/colors';
import BackIcon from '../../assets/back.svg';
import PaymentIcon from '../../assets/payment_white.svg';
import InfoIcon from '@mui/icons-material/Info';

function PaymentConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams(); // Campaign ID from URL
  const [campaign, setCampaign] = useState(null);

  // Load campaign data from localStorage
  useEffect(() => {
    const fetchCampaign = () => {
      try {
        const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        const data = existingCampaigns.find(c => c.campaign_id === id);
        
        if (!data) {
          console.error('Campaign not found');
          navigate('/campaigns');
          return;
        }
        
        setCampaign(data);
      } catch (err) {
        console.error('Error loading campaign:', err);
        navigate('/campaigns');
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id, navigate]);

  // Calculate campaign costs
  const calculateCosts = () => {
    if (!campaign) return { total: 0 };
    
    const pricePerPost = parseFloat(campaign.price_per_post) || 0;
    const influencerCount = parseInt(campaign.influencer_count) || 1;
    
    // Calculate total posts from content items
    let totalPosts = 0;
    if (campaign.contentItems && Array.isArray(campaign.contentItems)) {
      totalPosts = campaign.contentItems.reduce((sum, item) => sum + (parseInt(item.post_count) || 0), 0);
    } else {
      totalPosts = 1; // default
    }
    
    const total = pricePerPost * totalPosts * influencerCount;
    
    return { 
      total,
      pricePerPost,
      totalPosts,
      influencerCount
    };
  };

  const costs = calculateCosts();

  // Handle payment process
  const handlePayment = () => {
    try {
      // Update campaign in localStorage
      const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const updatedCampaigns = existingCampaigns.map(c => 
        c.campaign_id === id ? {
          ...c,
          status: 'Active',
          isPaid: true,
          paidAt: new Date().toISOString(),
          paymentAmount: costs.total
        } : c
      );
      localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
      
      // Navigate to success page
      navigate(`/campaign/${id}/payment-success`);
    } catch (err) {
      console.error('Payment error:', err);
      alert('Gagal memproses pembayaran. Silakan coba lagi.');
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!campaign) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: COLORS.background,
        fontFamily: 'Montserrat, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: COLORS.textSecondary }}>Loading campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: COLORS.background, 
      minHeight: '100vh', 
      paddingBottom: '48px',
      fontFamily: 'Montserrat, Arial, sans-serif' 
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '48px', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ 
          background: COLORS.white, 
          borderRadius: '20px', 
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', 
          padding: '32px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => navigate(`/campaign-edit/${id}`)}
              aria-label="Kembali"
              style={{
                background: 'rgba(102,126,234,0.12)',
                border: 'none',
                borderRadius: '18px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 24px rgba(102,126,234,0.08)',
                cursor: 'pointer',
              }}
            >
              <img src={BackIcon} alt="Back" style={{ width: '16px', height: '16px' }} />
            </button>
            <h2 style={{ fontWeight: 600, margin: 0, fontSize: '1.5rem', color: COLORS.textPrimary }}>
              Konfirmasi Campaign
            </h2>
          </div>

          {/* Campaign Info */}
          <div style={{ 
            padding: '16px', 
            background: COLORS.backgroundLight, 
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              color: COLORS.textPrimary
            }}>
              {campaign.title}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '0.9rem', 
              color: COLORS.textSecondary 
            }}>
              {Array.isArray(campaign.category) 
                ? campaign.category.join(', ') 
                : campaign.category}
            </p>
          </div>

          {/* Cost Breakdown */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              fontWeight: 600, 
              marginBottom: '16px',
              fontSize: '1.1rem',
              color: COLORS.textPrimary
            }}>
              Biaya Campaign
            </h3>
            
            {/* Breakdown Details */}
            <div style={{ 
              padding: '20px', 
              background: COLORS.backgroundLight, 
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    color: COLORS.textSecondary,
                    fontSize: '0.9rem'
                  }}>
                    Jumlah Post
                  </span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: COLORS.textPrimary,
                    fontSize: '1rem'
                  }}>
                    {costs.totalPosts} post
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    color: COLORS.textSecondary,
                    fontSize: '0.9rem'
                  }}>
                    Jumlah Influencer
                  </span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: COLORS.textPrimary,
                    fontSize: '1rem'
                  }}>
                    {costs.influencerCount} influencer
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    color: COLORS.textSecondary,
                    fontSize: '0.9rem'
                  }}>
                    Biaya per Post
                  </span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: COLORS.textPrimary,
                    fontSize: '1rem'
                  }}>
                    {formatCurrency(costs.pricePerPost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '20px',
              background: '#6E00BE',
              borderRadius: '12px'
            }}>
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: 700,
                color: COLORS.white
              }}>
                Total Bayar
              </span>
              <span style={{ 
                fontSize: '1.3rem', 
                fontWeight: 700,
                color: COLORS.white
              }}>
                {formatCurrency(costs.total)}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div style={{ 
            padding: '16px', 
            background: '#fff3cd', 
            borderRadius: '12px',
            border: '1px solid #ffc107',
            marginBottom: '24px',
            display: 'flex', 
            alignItems: 'center'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '0.85rem', 
              color: '#856404',
              lineHeight: '1.5',
              display: 'flex', 
              alignItems: 'center',
              gap: '8px'
            }}>
              <InfoIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '4px' }} /> 
              Biaya campaign yang tidak terpakai akan dikembalikan ke saldo Anda.
            </p>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            style={{
              background: '#6E00BE',
              borderRadius: '12px',
              fontWeight: 700,
              padding: '16px',
              fontSize: '1.1rem',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s',
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
            }}
          >
            <img src={PaymentIcon} alt="Payment Icon" style={{ marginRight: '8px', width: '24px', height: '24px'}} /> Proses Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmation;
