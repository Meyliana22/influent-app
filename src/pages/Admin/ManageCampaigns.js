import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { COLORS } from '../../constants/colors';
import ApplicantIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import CompletedIcon from '@mui/icons-material/CheckCircle';
import OngoingIcon from '@mui/icons-material/HourglassEmpty';

function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, filterStatus, searchQuery]);

  const loadCampaigns = () => {
    const campaignsData = JSON.parse(localStorage.getItem('campaigns') || '[]');
    setCampaigns(campaignsData);
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    if (filterStatus !== 'All') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.campaign_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCampaigns(filtered);
  };

  const handleViewDetail = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  const handleApproveCampaign = () => {
    if (selectedCampaign) {
      const updated = campaigns.map(c =>
        c.id === selectedCampaign.id ? { ...c, status: 'Active' } : c
      );
      setCampaigns(updated);
      localStorage.setItem('campaigns', JSON.stringify(updated));
      setShowDetailModal(false);
    }
  };

  const handleRejectCampaign = () => {
    if (selectedCampaign) {
      const updated = campaigns.map(c =>
        c.id === selectedCampaign.id ? { ...c, status: 'Cancelled' } : c
      );
      setCampaigns(updated);
      localStorage.setItem('campaigns', JSON.stringify(updated));
      setShowDetailModal(false);
    }
  };

  const handleDeactivate = (campaignId) => {
    const updated = campaigns.map(c =>
      c.id === campaignId ? { ...c, status: 'Completed' } : c
    );
    setCampaigns(updated);
    localStorage.setItem('campaigns', JSON.stringify(updated));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'Draft':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'Completed':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'Cancelled':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'Active').length,
    completed: campaigns.filter(c => c.status === 'Completed').length,
    draft: campaigns.filter(c => c.status === 'Draft').length
  };

  return (
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <AdminSidebar />
      
      <div style={{ marginLeft: '260px', width: 'calc(100% - 260px)' }}>
        <AdminTopbar />
        
        <div style={{ marginTop: '72px', padding: '32px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1a1f36',
              marginBottom: '8px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Manage Campaigns
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#6c757d',
              fontFamily: "'Inter', sans-serif"
            }}>
              Monitor and manage all campaigns on the platform
            </p>
          </div>

          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Total Campaigns', value: stats.total, IconComponent: CampaignIcon, bgColor: '#e0e7ff', iconColor: '#4338ca' },
              { label: 'Active', value: stats.active, IconComponent: OngoingIcon, bgColor: '#ffebebff', iconColor: '#dc2626' },
              { label: 'Completed', value: stats.completed, IconComponent: CompletedIcon, bgColor: '#fcffd1ff', iconColor: '#bdaa33ff' },
              { label: 'Pending', value: stats.draft, IconComponent: ApplicantIcon, bgColor: '#f9e9ffff', iconColor: '#6f3ec5ff' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.IconComponent sx={{ fontSize: 28, color: stat.iconColor }} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#6c757d',
                    marginBottom: '4px',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {stat.label}
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1a1f36',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  minWidth: '150px'
                }}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Campaigns Table */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Inter', sans-serif"
            }}>
              <thead>
                <tr style={{ background: '#f7fafc' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Campaign Title</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>UMKM Name</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Influencers</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => {
                    const statusStyle = getStatusColor(campaign.status);
                    return (
                      <tr
                        key={campaign.id}
                        style={{ borderBottom: '1px solid #e2e8f0' }}
                      >
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#2d3748' }}>#{campaign.id}</td>
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#1a1f36' }}>
                          {campaign.campaign_title || 'Untitled Campaign'}
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#6c757d' }}>
                          {campaign.business_name || 'N/A'}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: statusStyle.bg,
                            color: statusStyle.color
                          }}>
                            {campaign.status}
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#6c757d' }}>
                          {campaign.influencer_count || 0}
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleViewDetail(campaign)}
                              style={{
                                padding: '8px 16px',
                                background: '#667eea',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              View
                            </button>
                            {campaign.status === 'Active' && (
                              <button
                                onClick={() => handleDeactivate(campaign.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#f59e0b',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: '#fff',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign Detail Modal */}
      {showDetailModal && selectedCampaign && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '32px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1a1f36',
                    marginBottom: '8px',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {selectedCampaign.campaign_title}
                  </h2>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#6c757d',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {selectedCampaign.business_name}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: '#f7fafc',
                    border: 'none',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#1a1f36',
                  marginBottom: '12px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Campaign Description
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#6c757d',
                  lineHeight: '1.6',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {selectedCampaign.description || 'No description provided.'}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Budget</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1f36' }}>
                    Rp {(selectedCampaign.total_budget || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Price Per Post</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1f36' }}>
                    Rp {(selectedCampaign.price_per_post || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Influencers Needed</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1f36' }}>
                    {selectedCampaign.influencer_count || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Status</div>
                  <div>
                    <span style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      background: getStatusColor(selectedCampaign.status).bg,
                      color: getStatusColor(selectedCampaign.status).color,
                      display: 'inline-block'
                    }}>
                      {selectedCampaign.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                {selectedCampaign.status === 'Draft' && (
                  <>
                    <button
                      onClick={handleApproveCampaign}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      ✅ Approve Campaign
                    </button>
                    <button
                      onClick={handleRejectCampaign}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      ❌ Reject Campaign
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    flex: selectedCampaign.status === 'Draft' ? 0 : 1,
                    padding: '14px',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#2d3748',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    minWidth: selectedCampaign.status === 'Draft' ? 'auto' : '100%'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCampaigns;
