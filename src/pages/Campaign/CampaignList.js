import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import { formatCurrency } from '../../utils/helpers';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { BarChart3 } from 'lucide-react';
import campaignService from '../../services/campaignService';
import FaceIcon from '@mui/icons-material/Face';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MovieIcon from '@mui/icons-material/Movie';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FlightIcon from '@mui/icons-material/Flight';
import CampaignIcon from '@mui/icons-material/Campaign';

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
    const loadCampaigns = async () => {
      try {
        const response = await campaignService.getCampaigns();
        setCampaigns(response.data);
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
      'active': { 
        background: '#d1fae5', 
        color: '#155724',
        boxShadow: '0 2px 8px rgba(132, 250, 176, 0.3)'
      },
      'inactive': { 
        background: '#e2e8f0', 
        color: '#6c757d',
        boxShadow: '0 2px 8px rgba(143, 143, 143, 0.3)'
      }
    };
    return styles[status?.toLowerCase()] || styles['inactive'];
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Beauty & Fashion': FaceIcon,
      'Gaming': SportsEsportsIcon,
      'Technology': PhoneAndroidIcon,
      'Food & Beverages': RestaurantIcon,
      'Family & Parenting': FamilyRestroomIcon,
      'Entertainment': MovieIcon,
      'Health & Sport': FitnessCenterIcon,
      'Lifestyle & Travel': FlightIcon
    };
    return icons[category] || CampaignIcon;
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (b.created_at && a.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return b.campaign_id - a.campaign_id;
  });

  const filteredCampaigns = sortedCampaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter ? (c.status && c.status.toLowerCase() === filter.toLowerCase()) : true)
  );

  return (
    <div style={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ 
        flex: 1,
        marginLeft: !isMobile ? '260px' : '0',
        overflow: 'hidden'
      }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div style={{ 
          marginTop: '72px', 
          background: '#f7fafc', 
          minHeight: 'calc(100vh - 72px)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '32px', 
            maxWidth: '100%', 
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
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
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 auto', minWidth: '250px' }}>
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
                  <SearchIcon
                    sx={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 22,
                      opacity: 0.6,
                      pointerEvents: 'none',
                      color: COLORS.textSecondary
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: '0 0 auto', minWidth: '150px' }}>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
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
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* Decorative line */}
                {/* <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '4px',background: COLORS.gradient}}></div> */}
                
                <div 
                  onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    background: getCategoryGradient(campaign.campaign_category),
                    borderRadius: '20px', 
                    marginRight: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {campaign.banner_image ? (
                    <img src={campaign.banner_image} alt={campaign.title} style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      borderRadius: '18px'
                    }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <div style={{ marginBottom: '4px', opacity: 0.9 }}>
                        {React.createElement(getCategoryIcon(campaign.campaign_category), {
                          sx: { fontSize: 40, color: '#fff' }
                        })}
                      </div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500' }}>
                        {(campaign.campaign_category || '').split(' ')[0]}
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
                        {/* Display campaign_category from API */}
                        {campaign.campaign_category || 'No Category'}
                      </div>
                    </div>
                    
                    <div style={{
                      ...getStatusStyle(campaign.status),
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
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
                      <PeopleIcon sx={{ fontSize: 16, color: COLORS.textSecondary }} />
                      <span style={{ fontSize: '0.8rem', color: COLORS.textSecondary, fontWeight: '500' }}>
                        {campaign.influencer_count || 0} influencers
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AttachMoneyIcon sx={{ fontSize: 16, color: COLORS.textSecondary }} />
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
                      onClick={() => {
                        // If active, go to read-only detail view
                        // If inactive, go to edit mode (to continue payment)
                        if (campaign.status && campaign.status.toLowerCase() === 'active') {
                          navigate(`/campaign/${campaign.campaign_id}/detail`);
                        } else {
                          navigate(`/campaign-edit/${campaign.campaign_id}`);
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      Details
                    </Button>
                    {campaign.status && campaign.status.toLowerCase() === 'active' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
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
