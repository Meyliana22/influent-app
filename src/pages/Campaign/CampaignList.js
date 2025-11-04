import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import { formatCurrency } from '../../utils/helpers';
import SearchIcon from '../../assets/search.svg';
import { Grid } from '@mui/material';
import ApplicantIcon from '../../assets/dashboard-umkm/Applicant.svg';
import DollarIcon from '../../assets/dashboard-umkm/Dollar.svg';
import { BarChart3 } from 'lucide-react';

function CampaignList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  
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

  // Load campaigns from localStorage instead of API
  useEffect(() => {
    const loadCampaigns = () => {
      try {
        const storedCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        console.log('📋 Loaded campaigns:', storedCampaigns.length);
        console.log('Campaign IDs:', storedCampaigns.map(c => ({ 
          id: c.campaign_id, 
          title: c.title,
          type: typeof c.campaign_id 
        })));
        setCampaigns(storedCampaigns);
      } catch (err) {
        console.error('Failed to load campaigns from localStorage:', err);
        setCampaigns([]);
      }
    };

    loadCampaigns();
    
    // Optional: Listen for storage events to sync across tabs
    const handleStorageChange = () => {
      loadCampaigns();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Get category color gradient
  const getCategoryGradient = (category) => {
    // Return white background for all categories
    return 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    const styles = {
      'Active': { 
        background: '#d1fae5', 
        color: '#155724',
        boxShadow: '0 2px 8px rgba(132, 250, 176, 0.3)'
      },
      'Draft': { 
        background: '#e2e8f0', 
        color: '#6c757d',
        boxShadow: '0 2px 8px rgba(143, 143, 143, 0.3)'
      },
      // 'Inactive': { 
      //   background: 'linear-gradient(135deg, #ddd6fe 0%, #e879f9 100%)', 
      //   color: '#6f42c1',
      //   boxShadow: '0 2px 8px rgba(221, 214, 254, 0.3)'
      // }
    };
    return styles[status] || styles['Draft'];
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Beauty & Fashion': '💄',
      'Gaming': '🎮',
      'Technology': '📱',
      'Food & Beverages': '🍽️',
      'Family & Parenting': '👨‍👩‍👧‍👦',
      'Entertainment': '🎬',
      'Health & Sport': '🏃‍♀️',
      'Lifestyle & Travel': '✈️'
    };
    return icons[category] || '📢';
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (b.created_at && a.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return b.campaign_id - a.campaign_id;
  });

  const filteredCampaigns = sortedCampaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter ? c.status === filter : true)
  );

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', flex: 1 }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ marginTop: '72px', background: '#f7fafc', minHeight: 'calc(100vh - 72px)', padding: '32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <Button
            onClick={() => navigate('/campaign-create')}
            style={{ 
              marginRight: '18px',
              padding: '8px 16px',
              background: '#667eea',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            New
          </Button>
          <h2 style={{ fontWeight: 600, fontSize: '1.5rem', margin: 0, color: COLORS.textPrimary }}>Campaign List</h2>
        </div>
        {/* Search & Filter */}
        <Grid container spacing={2} sx={{ marginBottom: '32px', width: '100%' }}>
          <Grid item xs={12} md={9} sx={{ paddingLeft: '0 !important' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 44px',
                  borderRadius: '12px',
                  border: `1px solid ${COLORS.border}`,
                  fontSize: '1.1rem',
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
          </Grid>
          <Grid item xs={12} md={3}>
            <select 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px 22px', 
                borderRadius: '8px', 
                border: `1px solid ${COLORS.border}`, 
                fontSize: '1rem', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                background: COLORS.white, 
                cursor: 'pointer',
                color: COLORS.textPrimary,
                boxSizing: 'border-box'
              }}
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </Grid>
        </Grid>
        {/* Campaign Cards */}
        {filteredCampaigns.map(campaign => (
          <Card
            key={campaign.campaign_id}
            style={{ 
              padding: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: COLORS.gradient
            }}></div>
            
            <div 
              onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
              style={{ 
                width: '120px', 
                height: '120px', 
                background: getCategoryGradient(campaign.category),
                borderRadius: '20px', 
                marginRight: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {campaign.image ? (
                <img src={campaign.image} alt={campaign.title} style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: '18px'
                }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '4px', opacity: 0.9 }}>
                    {getCategoryIcon(Array.isArray(campaign.category) ? campaign.category[0] : campaign.category)}
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500' }}>
                    {Array.isArray(campaign.category) 
                      ? (campaign.category[0] || '').split(' ')[0] 
                      : (campaign.category || '').split(' ')[0]}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div 
                onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '1.1rem', 
                    marginBottom: '6px', 
                    color: COLORS.textPrimary,
                    lineHeight: '1.3'
                  }}>
                    {campaign.title}
                  </div>
                  <div style={{ 
                    color: COLORS.textSecondary, 
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {Array.isArray(campaign.category) 
                      ? campaign.category.join(', ') 
                      : campaign.category}
                  </div>
                </div>
                
                <div style={{
                  ...getStatusStyle(campaign.status),
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {campaign.status}
                </div>
              </div>
              
              <div 
                onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={ApplicantIcon} alt="Influencers" style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.8rem', color: COLORS.textSecondary, fontWeight: '500' }}>
                    {campaign.influencer_count || 0} influencers
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={DollarIcon} alt="Budget" style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.8rem', color: COLORS.textSecondary, fontWeight: '500' }}>
                    Rp {parseInt(campaign.price_per_post || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 size={16} color={COLORS.textSecondary} />
                  <span style={{ fontSize: '0.8rem', color: COLORS.textSecondary, fontWeight: '500' }}>
                    {campaign.min_followers ? `${parseInt(campaign.min_followers).toLocaleString('id-ID')}+ followers` : 'No min followers'}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Show "View applicants" only if Active and Paid */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '8px',
                paddingTop: '12px',
                borderTop: `1px solid ${COLORS.border}`
              }}>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                  style={{ flex: 1 }}
                >
                  Details
                </Button>
                {campaign.status === 'Active' && campaign.isPaid && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      console.log('🔍 Navigating to applicants for campaign:', {
                        id: campaign.campaign_id,
                        type: typeof campaign.campaign_id,
                        title: campaign.title
                      });
                      console.log('Full campaign object:', campaign);
                      navigate(`/campaign/${campaign.campaign_id}/applicants`);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#667eea',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flex: '1'
                    }}
                  >
                    View applicants
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignList;
