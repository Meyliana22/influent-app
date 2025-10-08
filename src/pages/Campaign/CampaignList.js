import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import campaignDB from '../../data/campaignDatabase';
import SearchIcon from '../../assets/search.svg';

function CampaignList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  // Load campaigns from database
  useEffect(() => {
    loadCampaigns();
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
        background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 
        color: '#155724',
        boxShadow: '0 2px 8px rgba(132, 250, 176, 0.3)'
      },
      'Draft': { 
        background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)', 
        color: '#856404',
        boxShadow: '0 2px 8px rgba(255, 234, 167, 0.3)'
      },
      'Inactive': { 
        background: 'linear-gradient(135deg, #ddd6fe 0%, #e879f9 100%)', 
        color: '#6f42c1',
        boxShadow: '0 2px 8px rgba(221, 214, 254, 0.3)'
      }
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

  const loadCampaigns = () => {
    const allCampaigns = campaignDB.getAll();
    console.log('Loaded campaigns:', allCampaigns); // Debug log
    setCampaigns(allCampaigns);
  };

  // Filter campaigns by search and filter
  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter ? c.status === filter : true)
  );

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: 'Montserrat, Arial, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <button
            style={{ background: '#6E00BE', color: '#fff', fontWeight: 600, border: 'none', padding: '8px 22px', fontSize: '1rem', marginRight: '18px', boxShadow: '0 2px 8px #e3e3e3', cursor: 'pointer' }}
            onClick={() => navigate('/campaign-create')}
          >
            New
          </button>
          <h2 style={{ fontWeight: 600, fontSize: '1.5rem', margin: 0 }}>Campaign List</h2>
        </div>
        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '18px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '85%',
                padding: '12px 44px 12px 44px', // left padding untuk icon
                borderRadius: '12px',
                border: '1px solid #ccc',
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px #e3e3e3'
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
            style={{ padding: '12px 22px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', boxShadow: '0 2px 8px #e3e3e3', background: '#fff', cursor: 'pointer' }}
          >
            <option value="">Filter by</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
            {/* Add more status options as needed */}
          </select>
        </div>
        {/* Campaign Cards */}
        {filteredCampaigns.map(campaign => (
          <div 
            key={campaign.id} 
            style={{ 
              background: '#fff', 
              borderRadius: '24px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
              padding: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255,255,255,0.8)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => navigate(`/campaign-edit/${campaign.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
            }}
          >
            {/* Decorative line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: getCategoryGradient(campaign.category)
            }}></div>
            
            <div style={{ 
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
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
                    {getCategoryIcon(campaign.category)}
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500' }}>
                    {campaign.category.split(' ')[0]}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '1.1rem', 
                    marginBottom: '6px', 
                    color: '#2d3748',
                    lineHeight: '1.3'
                  }}>
                    {campaign.title}
                  </div>
                  <div style={{ 
                    color: '#718096', 
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {campaign.category}
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
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9rem' }}>👥</span>
                  <span style={{ fontSize: '0.8rem', color: '#4a5568', fontWeight: '500' }}>
                    {campaign.influencerCount} influencers
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9rem' }}>💰</span>
                  <span style={{ fontSize: '0.8rem', color: '#4a5568', fontWeight: '500' }}>
                    Rp {parseInt(campaign.taskPrice || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9rem' }}>📊</span>
                  <span style={{ fontSize: '0.8rem', color: '#4a5568', fontWeight: '500' }}>
                    {campaign.followersCount ? `${parseInt(campaign.followersCount).toLocaleString('id-ID')}+ followers` : 'No min followers'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CampaignList;
