import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, StatCard, Button, SelectionConfirmModal, ApplicantDetailModal } from '../../components/common';
import ApplicantCard from '../../components/common/ApplicantCard';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import SearchIcon from '../../assets/search.svg';
import BackIcon from '../../assets/back.svg';
import applicantStorageHelper from '../../utils/applicantStorageHelper';

function ViewApplicants() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  
  console.log('🎯 ViewApplicants - Received campaignId:', campaignId, 'Type:', typeof campaignId);
  
  const [campaign, setCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, selected: 0 });
  
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
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: null,
    variant: 'default'
  });

  // New modal states for selection and detail
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = () => {
    // Load campaign details from localStorage
    try {
      console.log('🔍 Loading data for campaign:', campaignId);
      
      if (!campaignId) {
        console.error('❌ No campaignId provided!');
        setTimeout(() => navigate('/campaigns'), 100);
        return;
      }
      
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      console.log('📋 Found campaigns:', campaigns.length);
      
      if (campaigns.length === 0) {
        console.error('❌ No campaigns in localStorage - seeding data...');
        // Try to seed data if missing
        if (window.campaignStorage && window.campaignStorage.seedDummyData) {
          window.campaignStorage.seedDummyData();
          console.log('✅ Data seeded, reloading...');
          setTimeout(() => window.location.reload(), 500);
        }
        return;
      }
      
      // Debug: Show all campaign IDs with types
      console.log('Campaign IDs:', campaigns.map(c => ({ 
        id: c.campaign_id, 
        type: typeof c.campaign_id,
        title: c.title
      })));
      
      // Try to find campaign with flexible matching
      const campaignData = campaigns.find(c => 
        c.campaign_id === campaignId || 
        String(c.campaign_id) === String(campaignId) ||
        parseInt(c.campaign_id) === parseInt(campaignId)
      );
      
      if (campaignData) {
        console.log('✅ Campaign found:', campaignData.title);
        setCampaign(campaignData);
      } else {
        console.error('❌ Campaign not found with ID:', campaignId);
        console.log('Available campaigns:', campaigns.map(c => ({ 
          id: c.campaign_id, 
          type: typeof c.campaign_id,
          title: c.title
        })));
        // Campaign not found, redirect back
        setTimeout(() => navigate('/campaigns'), 100);
        return;
      }

      // Load applicants for this campaign from localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      console.log('👥 Total applicants:', allApplicants.length);
      
      // Use the found campaign's ID for filtering
      const actualCampaignId = campaignData.campaign_id;
      const applicantsData = allApplicants.filter(a => 
        a.campaignId === actualCampaignId || 
        String(a.campaignId) === String(actualCampaignId) ||
        parseInt(a.campaignId) === parseInt(actualCampaignId)
      );
      console.log('👥 Applicants for campaign', actualCampaignId, ':', applicantsData.length);
      
      setApplicants(applicantsData);

      // Calculate statistics
      const total = applicantsData.length;
      const pending = applicantsData.filter(a => a.status === 'Pending').length;
      const accepted = applicantsData.filter(a => a.status === 'Accepted').length;
      const rejected = applicantsData.filter(a => a.status === 'Rejected').length;
      const selected = applicantsData.filter(a => a.isSelected === true).length;
      
      console.log('📊 Stats:', { total, pending, accepted, rejected, selected });
      
      setStats({ total, pending, accepted, rejected, selected });
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      setTimeout(() => navigate('/campaigns'), 100);
    }
  };

  // Handle Accept applicant
  const handleAccept = (applicantId) => {
    const applicant = applicants.find(a => a.id === applicantId);
    setModalConfig({
      title: 'Accept Applicant',
      message: `Are you sure you want to accept ${applicant.fullName} (${applicant.influencerName}) for this campaign?`,
      action: () => confirmAccept(applicantId),
      variant: 'success'
    });
    setShowModal(true);
  };

  const confirmAccept = (applicantId) => {
    try {
      // Update applicant status in localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updatedApplicants = allApplicants.map(a => 
        a.id === applicantId ? { ...a, status: 'Accepted' } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to accept applicant:', error);
    }
  };

  // Handle Reject applicant
  const handleReject = (applicantId) => {
    const applicant = applicants.find(a => a.id === applicantId);
    setModalConfig({
      title: 'Reject Applicant',
      message: `Are you sure you want to reject ${applicant.fullName} (${applicant.influencerName})? This action can be reversed later.`,
      action: () => confirmReject(applicantId),
      variant: 'danger'
    });
    setShowModal(true);
  };

  const confirmReject = (applicantId) => {
    try {
      // Update applicant status in localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updatedApplicants = allApplicants.map(a => 
        a.id === applicantId ? { ...a, status: 'Rejected' } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to reject applicant:', error);
    }
  };

  // Handle Cancel (revert to Pending)
  const handleCancel = (applicantId) => {
    const applicant = applicants.find(a => a.id === applicantId);
    setModalConfig({
      title: 'Revert to Pending',
      message: `Do you want to move ${applicant.fullName} (${applicant.influencerName}) back to pending status?`,
      action: () => confirmCancel(applicantId),
      variant: 'default'
    });
    setShowModal(true);
  };

  const confirmCancel = (applicantId) => {
    try {
      // Update applicant status in localStorage
      const allApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      const updatedApplicants = allApplicants.map(a => 
        a.id === applicantId ? { ...a, status: 'Pending' } : a
      );
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to revert applicant status:', error);
    }
  };

  // Handle Toggle Selection
  const handleToggleSelection = (applicant) => {
    setSelectedApplicant(applicant);
    setShowSelectionModal(true);
  };

  const confirmToggleSelection = () => {
    if (selectedApplicant) {
      const newSelectionState = !selectedApplicant.isSelected;
      applicantStorageHelper.toggleSelection(selectedApplicant.id, newSelectionState);
      loadData();
      setShowSelectionModal(false);
      setSelectedApplicant(null);
    }
  };

  // Handle Show Detail
  const handleShowDetail = (applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailModal(true);
  };

  // Handle Chat - Open WhatsApp
  const handleChat = (applicant) => {
    const phone = applicant.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const message = encodeURIComponent(
      `Halo ${applicant.fullName}, saya tertarik untuk berkolaborasi dengan Anda untuk campaign "${campaign.title}". Apakah Anda tersedia untuk diskusi lebih lanjut?`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Filter applicants
  const filteredApplicants = applicants
    .filter(a => {
      const matchesSearch = 
        a.influencerName.toLowerCase().includes(search.toLowerCase()) ||
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter ? a.status === filter : true;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Sort priority: Pending > Accepted > Rejected
      const statusPriority = { 'Pending': 1, 'Accepted': 2, 'Rejected': 3 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      // Then sort by applied date (newest first)
      return new Date(b.appliedDate) - new Date(a.appliedDate);
    });

  if (!campaign) {
    return (
      <div style={{ background: COLORS.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={{
          background: COLORS.white,
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: `0 8px 32px ${COLORS.shadowLarge}`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: COLORS.gradient
          }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '16px',
              background: COLORS.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              📋
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '2rem',
                fontWeight: '700',
                color: COLORS.textPrimary
              }}>
                View Applicants
              </h1>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: COLORS.primary
              }}>
                {campaign.title}
              </h2>
              <div style={{
                fontSize: '0.9rem',
                color: COLORS.textSecondary
              }}>
                Campaign Status: <span style={{ 
                  fontWeight: '600', 
                  color: campaign.status === 'Active' ? '#28a745' : '#6c757d' 
                }}>
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Total Applicants"
            value={stats.total}
            icon="👥"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            title="Selected"
            value={stats.selected}
            icon="⭐"
            gradient="linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon="⏳"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
          <StatCard
            title="Accepted"
            value={stats.accepted}
            icon="✅"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon="❌"
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          />
        </div>

        {/* Search & Filter */}
        <div style={{
          display: 'flex',
          gap: '18px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 400px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name, username, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 44px 14px 44px',
                borderRadius: '12px',
                border: `1px solid ${COLORS.border}`,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                boxSizing: 'border-box'
              }}
            />
            <img
              src={SearchIcon}
              alt="Search"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                opacity: 0.6,
                pointerEvents: 'none'
              }}
            />
          </div>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              padding: '14px 24px',
              borderRadius: '12px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              background: COLORS.white,
              cursor: 'pointer',
              color: COLORS.textPrimary,
              minWidth: '200px'
            }}
          >
            <option value="">All Status</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Accepted">✅ Selected</option>
            <option value="Rejected">❌ Rejected</option>
          </select>

          {/* Select All Button - Only show for campaign owner */}
          <Button
            variant="primary"
            onClick={() => navigate(`/campaign/${campaignId}/select-applicants`)}
            style={{
              padding: '14px 24px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '200px'
            }}
          >
            ✓ Select Applicants
          </Button>
        </div>

        {/* Results Count */}
        <div style={{
          marginBottom: '20px',
          fontSize: '0.95rem',
          color: COLORS.textSecondary,
          fontWeight: '600'
        }}>
          Showing {filteredApplicants.length} of {applicants.length} applicants
        </div>

        {/* Applicants List */}
        {filteredApplicants.length === 0 ? (
          <div style={{
            background: COLORS.white,
            borderRadius: '16px',
            padding: '64px 32px',
            textAlign: 'center',
            boxShadow: `0 4px 20px ${COLORS.shadowMedium}`
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😔</div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '1.3rem', 
              fontWeight: '600',
              color: COLORS.textPrimary 
            }}>
              No Applicants Found
            </h3>
            <p style={{ 
              margin: 0, 
              color: COLORS.textSecondary,
              fontSize: '0.95rem'
            }}>
              {search || filter 
                ? 'Try adjusting your search or filter criteria' 
                : 'No one has applied to this campaign yet'}
            </p>
          </div>
        ) : (
          <div>
            {filteredApplicants.map(applicant => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
                onToggleSelection={handleToggleSelection}
                onChat={handleChat}
                onShowDetail={handleShowDetail}
                showActions={true}
                showSelection={true}
              />
            ))}
          </div>
        )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        onConfirm={modalConfig.action}
        confirmText="Confirm"
        cancelText="Cancel"
        variant={modalConfig.variant}
      >
        <p style={{ 
          margin: 0, 
          fontSize: '1rem', 
          lineHeight: '1.6',
          color: COLORS.textSecondary 
        }}>
          {modalConfig.message}
        </p>
      </Modal>

      {/* Selection Confirmation Modal */}
      <SelectionConfirmModal
        isOpen={showSelectionModal}
        onClose={() => {
          setShowSelectionModal(false);
          setSelectedApplicant(null);
        }}
        applicantName={selectedApplicant?.fullName}
        influencerName={selectedApplicant?.influencerName}
        currentSelection={selectedApplicant?.isSelected || false}
        onConfirm={confirmToggleSelection}
      />

      {/* Applicant Detail Modal */}
      <ApplicantDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedApplicant(null);
        }}
        applicant={selectedApplicant}
      />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewApplicants;
