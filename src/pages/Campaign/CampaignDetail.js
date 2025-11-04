import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import campaignDB from '../../data/campaignDatabase';
import applicantDB from '../../data/applicantDatabase';
import BackIcon from '../../assets/back.svg';

function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [stats, setStats] = useState({
    totalSelected: 0,
    completed: 0,
    pending: 0,
    progressPercentage: 0
  });
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    // Load campaign from localStorage
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    const campaignData = campaigns.find(c => c.campaign_id === id);
    
    if (!campaignData) {
      navigate('/campaigns');
      return;
    }
    setCampaign(campaignData);

    // Load selected influencers from localStorage
    const applicants = JSON.parse(localStorage.getItem('applicants') || '[]');
    const campaignApplicants = applicants.filter(a => 
      a.campaignId === id && a.status === 'Accepted'
    );
    setSelectedInfluencers(campaignApplicants);

    // Calculate stats
    const totalSelected = campaignApplicants.length;
    const completed = campaignApplicants.filter(a => a.proofUploaded).length;
    const pending = totalSelected - completed;
    const progressPercentage = totalSelected > 0 ? (completed / totalSelected) * 100 : 0;

    setStats({
      totalSelected,
      completed,
      pending,
      progressPercentage
    });
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine campaign phase based on status and dates
  const getCampaignPhase = () => {
    if (!campaign) return 'unknown';
    
    const today = new Date();
    const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
    
    // If status is explicitly set
    if (campaign.status === 'Closed') return 'closed';
    if (campaign.status === 'Draft') return 'draft';
    
    // Check if payment is made
    if (!campaign.isPaid) return 'awaiting-payment';
    
    // Check if influencers are selected
    if (!campaign.selectedInfluencersCount || campaign.selectedInfluencersCount === 0) {
      return 'active'; // Active but no influencers selected yet
    }
    
    // Campaign is ongoing
    if (startDate && endDate) {
      if (today < startDate) return 'scheduled';
      if (today >= startDate && today <= endDate) return 'ongoing';
      if (today > endDate) {
        // Campaign ended, check if payouts are done
        if (campaign.payoutCompleted) return 'closed';
        return 'awaiting-payout';
      }
    }
    
    return 'ongoing';
  };

  const phase = getCampaignPhase();
  const daysRemaining = campaign ? getDaysRemaining(campaign.end_date) : null;

  if (!campaign) {
    return (
      <div style={{
        background: COLORS.background,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: COLORS.textSecondary }}>Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Render based on phase
  const renderPhaseContent = () => {
    switch (phase) {
      case 'awaiting-payment':
        return (
          <Card style={{ padding: '32px', textAlign: 'center', marginTop: '24px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💳</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 600 }}>
              Menunggu Pembayaran
            </h3>
            <p style={{ margin: '0 0 24px 0', color: COLORS.textSecondary }}>
              Selesaikan pembayaran untuk mengaktifkan campaign Anda
            </p>
            <Button
              variant="primary"
              onClick={() => navigate(`/campaign/${id}/payment`)}
              style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}
            >
              Bayar Sekarang
            </Button>
          </Card>
        );

      case 'active':
        return (
          <Card style={{ padding: '32px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                ✅
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 600 }}>
                  Campaign Active
                </h3>
                <p style={{ margin: 0, color: COLORS.textSecondary }}>
                  Menunggu influencer mendaftar
                </p>
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: COLORS.backgroundLight,
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: COLORS.textSecondary }}>
                📅 Campaign Period: <strong>{formatDate(campaign.start_date)}</strong> - <strong>{formatDate(campaign.end_date)}</strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: COLORS.textSecondary }}>
                👥 Target Influencer: <strong>{campaign.influencer_count || 0}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="primary"
                onClick={() => navigate(`/campaign/${id}/applicants`)}
                style={{ flex: 1 }}
              >
                View Applicants
              </Button> 
              <Button
                variant="outline"
                onClick={() => navigate(`/campaign-edit/${id}`)}
                style={{ flex: 1 }}
              >
                Edit Campaign
              </Button>
            </div>
          </Card>
        );

      case 'ongoing':
        return (
          <div style={{ marginTop: '24px' }}>
            {/* Status Card */}
            <Card style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  🚀
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 600 }}>
                    Campaign Ongoing
                  </h3>
                  <p style={{ margin: 0, color: COLORS.textSecondary }}>
                    {daysRemaining !== null && daysRemaining >= 0
                      ? `${daysRemaining} hari lagi sampai deadline`
                      : 'Campaign deadline sudah lewat'}
                  </p>
                </div>
                <div style={{
                  textAlign: 'right',
                  padding: '12px 20px',
                  background: COLORS.primaryLight,
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.primary }}>
                    {Math.round(stats.progressPercentage)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary }}>
                    Progress
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '0.85rem',
                  color: COLORS.textSecondary
                }}>
                  <span>Content Submission Progress</span>
                  <span>{stats.completed} / {stats.totalSelected} completed</span>
                </div>
                <div className="progress" style={{ height: '12px', borderRadius: '6px', background: COLORS.backgroundLight }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${stats.progressPercentage}%`,
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '6px'
                    }}
                    aria-valuenow={stats.progressPercentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              {/* Campaign Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px',
                background: COLORS.backgroundLight,
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '4px' }}>
                    DEADLINE CAMPAIGN
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: COLORS.textPrimary }}>
                    {formatDate(campaign.end_date)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '4px' }}>
                    INFLUENCER AKTIF
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: COLORS.textPrimary }}>
                    {stats.totalSelected} influencers
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '4px' }}>
                    TOTAL BUDGET
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: COLORS.textPrimary }}>
                    {formatCurrency(campaign.price_per_post * stats.totalSelected)}
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => navigate(`/campaign/${id}/applicants`)}
                fullWidth
                style={{ padding: '14px', fontSize: '1rem', fontWeight: 700 }}
              >
                Lihat Detail Campaign
              </Button>
            </Card>

            {/* Influencer Status */}
            {selectedInfluencers.length > 0 && (
              <Card style={{ padding: '32px' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600 }}>
                  Status Influencer
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedInfluencers.map(influencer => (
                    <div
                      key={influencer.id}
                      style={{
                        padding: '16px',
                        background: COLORS.backgroundLight,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: COLORS.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}>
                          👤
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {influencer.fullName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                            @{influencer.influencerName}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: influencer.proofUploaded
                          ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                          : '#ffc107',
                        color: '#fff'
                      }}>
                        {influencer.proofUploaded ? '✅ Sudah Upload' : '⚠️ Belum Upload'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );

      case 'awaiting-payout':
        return (
          <Card style={{ padding: '32px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                ⏰
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 600 }}>
                  Selesai, Menunggu Pembayaran ke Influencer
                </h3>
                <p style={{ margin: 0, color: COLORS.textSecondary }}>
                  Campaign telah selesai dan sedang dalam proses verifikasi
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              padding: '20px',
              background: '#fff3cd',
              borderRadius: '12px',
              border: '1px solid #ffc107',
              marginBottom: '24px'
            }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#856404'
              }}>
                ℹ️ Informasi Penting
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: '#856404',
                lineHeight: '1.6'
              }}>
                Dana akan dicairkan ke influencer dalam <strong>7 hari kerja</strong> setelah verifikasi konten selesai.
              </p>
            </div>

            {/* Influencer List with Upload Status */}
            {selectedInfluencers.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                  Status Upload Konten
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {selectedInfluencers.map(influencer => (
                    <div
                      key={influencer.id}
                      style={{
                        padding: '16px',
                        background: COLORS.backgroundLight,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: COLORS.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}>
                          👤
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {influencer.fullName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                            @{influencer.influencerName}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: influencer.proofUploaded
                          ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                          : '#dc3545',
                        color: '#fff'
                      }}>
                        {influencer.proofUploaded ? '✅ Sudah Upload' : '⚠️ Belum Upload'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{
              padding: '20px',
              background: COLORS.primaryLight,
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: COLORS.textSecondary }}>Total Influencer:</span>
                <span style={{ fontWeight: 600 }}>{stats.totalSelected}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: COLORS.textSecondary }}>Sudah Upload:</span>
                <span style={{ fontWeight: 600, color: COLORS.success }}>{stats.completed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: COLORS.textSecondary }}>Belum Upload:</span>
                <span style={{ fontWeight: 600, color: COLORS.danger }}>{stats.pending}</span>
              </div>
            </div>
          </Card>
        );

      case 'closed':
        return (
          <Card style={{ padding: '32px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                ✔️
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 600 }}>
                  Campaign Closed
                </h3>
                <p style={{ margin: 0, color: COLORS.textSecondary }}>
                  Campaign telah selesai dan semua pembayaran sudah cair
                </p>
              </div>
            </div>

            {/* Campaign Summary */}
            <div style={{
              padding: '24px',
              background: COLORS.backgroundLight,
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
                Ringkasan Campaign
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '4px' }}>
                    TOTAL INFLUENCER
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.primary }}>
                    {stats.totalSelected}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '4px' }}>
                    TOTAL ENGAGEMENT
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.success }}>
                    {selectedInfluencers.reduce((sum, inf) => sum + (inf.engagement || 0), 0).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '4px' }}>
                    TOTAL BIAYA
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.textPrimary }}>
                    {formatCurrency(campaign.price_per_post * stats.totalSelected)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginBottom: '4px' }}>
                    PERIODE CAMPAIGN
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.textPrimary }}>
                    {formatDate(campaign.start_date)}
                    <br />
                    {formatDate(campaign.end_date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #43e97b20 0%, #38f9d720 100%)',
              borderRadius: '12px',
              border: '1px solid #43e97b',
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                color: COLORS.success,
                fontWeight: 600
              }}>
                ✅ Semua pembayaran sudah cair. Terima kasih telah menggunakan Influent!
              </p>
            </div>

            {/* Optional: View Report Button */}
            <Button
              variant="outline"
              onClick={() => {/* Navigate to report */}}
              fullWidth
              style={{ marginTop: '16px', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
            >
              📊 Lihat Laporan Lengkap
            </Button>
          </Card>
        );

      default:
        return (
          <Card style={{ padding: '32px', marginTop: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 12px 0' }}>Campaign Details</h3>
            <p style={{ margin: 0, color: COLORS.textSecondary }}>
              Status: {campaign.status || 'Unknown'}
            </p>
          </Card>
        );
    }
  };

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', flex: 1 }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ marginTop: '72px', background: '#f7fafc', minHeight: 'calc(100vh - 72px)', padding: '32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/campaigns')}
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <img src={BackIcon} alt="Back" style={{ width: '16px', height: '16px' }} />
          Back to Campaigns
        </Button>

        {/* Campaign Header */}
        <Card style={{ padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: COLORS.gradient
          }}></div>

          <h1 style={{
            margin: '0 0 12px 0',
            fontSize: '2rem',
            fontWeight: '700',
            color: COLORS.textPrimary
          }}>
            {campaign.title}
          </h1>
          <div style={{ fontSize: '0.9rem', color: COLORS.textSecondary, marginBottom: '16px' }}>
            {Array.isArray(campaign.category)
              ? campaign.category.join(', ')
              : campaign.category}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: phase === 'closed' ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' :
                       phase === 'ongoing' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                       phase === 'awaiting-payout' ? 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' :
                       'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            color: '#fff'
          }}>
            {phase === 'closed' ? 'Closed' :
             phase === 'ongoing' ? 'Ongoing' :
             phase === 'awaiting-payout' ? 'Awaiting Payout' :
             phase === 'active' ? 'Active' :
             campaign.status}
          </div>
        </Card>

        {/* Phase-specific Content */}
        {renderPhaseContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetail;
