import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import campaignDB from '../../data/campaignDatabase';
import applicantDB from '../../data/applicantDatabase';
import BackIcon from '../../assets/back.svg';

function SelectApplicants() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle window resize for responsive design
  useEffect(() => {
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
  }, [campaignId]);

  const loadData = () => {
    // Load campaign details
    const campaignData = campaignDB.getById(campaignId);
    if (campaignData) {
      setCampaign(campaignData);
    } else {
      navigate('/campaigns');
      return;
    }

    // Load applicants (only show Pending and Accepted)
    const applicantsData = applicantDB.getByCampaignId(campaignId)
      .filter(a => a.status === 'Pending' || a.status === 'Accepted');
    setApplicants(applicantsData);

    // Pre-select already accepted applicants
    const alreadyAccepted = applicantsData
      .filter(a => a.status === 'Accepted')
      .map(a => a.id);
    setSelectedIds(alreadyAccepted);
  };

  // Toggle selection
  const toggleSelection = (applicantId) => {
    if (selectedIds.includes(applicantId)) {
      setSelectedIds(selectedIds.filter(id => id !== applicantId));
    } else {
      setSelectedIds([...selectedIds, applicantId]);
    }
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedIds.length === applicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applicants.map(a => a.id));
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one influencer');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSelection = () => {
    // Update status for all applicants
    applicants.forEach(applicant => {
      const newStatus = selectedIds.includes(applicant.id) ? 'Accepted' : 'Rejected';
      applicantDB.updateStatus(applicant.id, newStatus);
    });

    // Update campaign to set deadline
    const deadlineDate = new Date(campaign.end_date);
    campaignDB.update(campaignId, {
      ...campaign,
      status: 'Ongoing',
      selectedInfluencersCount: selectedIds.length,
      selectionDate: new Date().toISOString(),
      postingDeadline: deadlineDate.toISOString()
    });

    setShowConfirmModal(false);
    navigate(`/campaigns`);
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (!campaign) {
    return (
      <div style={{ 
        background: COLORS.background, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

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
          onClick={() => navigate(`/campaign/${campaignId}/applicants`)}
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <img src={BackIcon} alt="Back" style={{ width: '16px', height: '16px' }} />
          Back to View Applicants
        </Button>

        {/* Header */}
        <div style={{
          background: COLORS.white,
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: `0 8px 32px ${COLORS.shadowLarge}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: COLORS.gradient
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '2rem',
                fontWeight: '700',
                color: COLORS.textPrimary
              }}>
                Select Influencers
              </h1>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: COLORS.primary
              }}>
                {campaign.title}
              </h2>
              <p style={{ 
                margin: 0, 
                color: COLORS.textSecondary,
                fontSize: '0.9rem'
              }}>
                Select influencers you want to work with for this campaign
              </p>
            </div>
            <div style={{
              textAlign: 'right',
              padding: '16px 24px',
              background: COLORS.primaryLight,
              borderRadius: '12px'
            }}>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700',
                color: COLORS.primary
              }}>
                {selectedIds.length}
              </div>
              <div style={{ 
                fontSize: '0.85rem',
                color: COLORS.textSecondary,
                fontWeight: 600
              }}>
                Selected
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{
          background: COLORS.white,
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: `0 4px 16px ${COLORS.shadowMedium}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              checked={selectedIds.length === applicants.length && applicants.length > 0}
              onChange={handleSelectAll}
              style={{ 
                cursor: 'pointer', 
                width: '20px', 
                height: '20px',
                accentColor: COLORS.primary
              }}
            />
            <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>
              {selectedIds.length === applicants.length && applicants.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </span>
          </div>

          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            style={{
              padding: '12px 32px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              background: selectedIds.length === 0 
                ? '#ccc' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ✓ Konfirmasi Pilihan ({selectedIds.length})
          </Button>
        </div>

        {/* Applicants Grid */}
        {applicants.length === 0 ? (
          <div style={{
            background: COLORS.white,
            borderRadius: '16px',
            padding: '64px 32px',
            textAlign: 'center',
            boxShadow: `0 4px 20px ${COLORS.shadowMedium}`
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '1.3rem',
              fontWeight: '600',
              color: COLORS.textPrimary
            }}>
              No Applicants Available
            </h3>
            <p style={{
              margin: 0,
              color: COLORS.textSecondary,
              fontSize: '0.95rem'
            }}>
              There are no pending applicants for this campaign
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {applicants.map(applicant => {
              const isSelected = selectedIds.includes(applicant.id);
              
              return (
                <div
                  key={applicant.id}
                  onClick={() => toggleSelection(applicant.id)}
                  style={{
                    background: COLORS.white,
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: isSelected
                      ? `0 8px 24px rgba(102, 126, 234, 0.3)`
                      : `0 4px 16px ${COLORS.shadowMedium}`,
                    border: isSelected ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.shadowLarge}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.shadowMedium}`;
                    }
                  }}
                >
                  {/* Checkbox */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(applicant.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        cursor: 'pointer', 
                        width: '20px', 
                        height: '20px',
                        accentColor: COLORS.primary
                      }}
                    />
                  </div>

                  {/* Profile Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: COLORS.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontSize: '2.5rem',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}>
                    {applicant.profileImage ? (
                      <img
                        src={applicant.profileImage}
                        alt={applicant.fullName}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      '👤'
                    )}
                  </div>

                  {/* Name */}
                  <h3 style={{
                    margin: '0 0 4px 0',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: COLORS.textPrimary,
                    textAlign: 'center'
                  }}>
                    {applicant.fullName}
                  </h3>

                  {/* Username */}
                  <p style={{
                    margin: '0 0 16px 0',
                    fontSize: '0.85rem',
                    color: COLORS.textSecondary,
                    textAlign: 'center'
                  }}>
                    @{applicant.influencerName}
                  </p>

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '16px 0',
                    borderTop: `1px solid ${COLORS.border}`,
                    borderBottom: `1px solid ${COLORS.border}`,
                    marginBottom: '16px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: COLORS.primary
                      }}>
                        {formatNumber(applicant.followers)}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: COLORS.textSecondary,
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>
                        Followers
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: COLORS.success
                      }}>
                        {applicant.engagement}%
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: COLORS.textSecondary,
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>
                        Engagement
                      </div>
                    </div>
                  </div>

                  {/* Platform & Location */}
                  <div style={{ fontSize: '0.8rem', color: COLORS.textSecondary }}>
                    <div style={{ marginBottom: '4px' }}>
                      📱 {applicant.platform || 'Instagram'}
                    </div>
                    <div>
                      📍 {applicant.location}
                    </div>
                  </div>

                  {/* Current Status Badge */}
                  {applicant.status === 'Accepted' && (
                    <div style={{
                      marginTop: '12px',
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: '#fff',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ✓ Already Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Selection"
        onConfirm={confirmSelection}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="success"
      >
        <div>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '1rem',
            lineHeight: '1.6',
            color: COLORS.textSecondary
          }}>
            You are about to select <strong>{selectedIds.length}</strong> influencer(s) for this campaign.
          </p>
          <div style={{
            padding: '16px',
            background: COLORS.primaryLight,
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: COLORS.textPrimary
            }}>
              What happens next:
            </p>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '0.85rem',
              color: COLORS.textSecondary,
              lineHeight: '1.8'
            }}>
              <li>Selected influencers will be notified</li>
              <li>Campaign status will change to "Ongoing"</li>
              <li>Posting deadline will be set based on campaign end date</li>
              <li>Unselected applicants will be rejected</li>
            </ul>
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: COLORS.textLight,
            fontStyle: 'italic'
          }}>
            This action cannot be undone. Are you sure you want to proceed?
          </p>
        </div>
      </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectApplicants;
