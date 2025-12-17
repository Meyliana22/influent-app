import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar, Modal } from '../../components/common';
import { COLORS } from '../../constants/colors';
import { formatCurrency } from '../../utils/helpers';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CampaignIcon from '@mui/icons-material/Campaign';
import FaceIcon from '@mui/icons-material/Face';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MovieIcon from '@mui/icons-material/Movie';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FlightIcon from '@mui/icons-material/Flight';
import campaignService from '../../services/campaignService';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

import { useToast } from '../../hooks/useToast';

const API_BASE_URL = 'http://localhost:8000/api/uploads';

const getImageUrl = (imageName) => {
  console.log(`${API_BASE_URL}/${imageName}`);
  return `${API_BASE_URL}/${imageName}`;
};

function BrowseCampaigns() {
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [selectedCampaignCategories, setSelectedCampaignCategories] = useState([]);
  const [selectedInfluencerCategories, setSelectedInfluencerCategories] = useState([]);
  const [tempCampaignCategories, setTempCampaignCategories] = useState([]);
  const [tempInfluencerCategories, setTempInfluencerCategories] = useState([]);
  const [showCampaignCategoryFilter, setShowCampaignCategoryFilter] = useState(false);
  const [showInfluencerCategoryFilter, setShowInfluencerCategoryFilter] = useState(false);
  const [campaignCategoryFilterApplied, setCampaignCategoryFilterApplied] = useState(false);
  const [influencerCategoryFilterApplied, setInfluencerCategoryFilterApplied] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  
  // Responsive state
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

  // Load campaigns from API
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        // Fetch all campaigns for frontend pagination
        const response = await campaignService.getCampaigns({ limit: 1000, offset: 0 }); // Use large limit to get all
        
        let campaignsData = [];
        
        if (Array.isArray(response)) {
          campaignsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          campaignsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          campaignsData = response.data.data;
        }

        setCampaigns(campaignsData);
        setTotalItems(campaignsData.length); // Total items fetched
        setLoading(false);
      } catch (err) {
        console.error('Failed to load campaigns:', err);
        setCampaigns([]);
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []); // Run only once on mount

  // Initialize all categories as selected by default
  useEffect(() => {
    const allCampaignCats = getCampaignCategories();
    const allInfluencerCats = getInfluencerCategories();
    
    if (allCampaignCats.length > 0 && selectedCampaignCategories.length === 0) {
      setSelectedCampaignCategories(allCampaignCats);
      setTempCampaignCategories(allCampaignCats);
      setCampaignCategoryFilterApplied(false); // Not explicitly applied by user
    }
    
    if (allInfluencerCats.length > 0 && selectedInfluencerCategories.length === 0) {
      setSelectedInfluencerCategories(allInfluencerCats);
      setTempInfluencerCategories(allInfluencerCats);
      setInfluencerCategoryFilterApplied(false); // Not explicitly applied by user
    }
  }, [campaigns]);

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

  // Get all unique campaign categories
  const getCampaignCategories = () => {
    const categories = new Set();
    campaigns.forEach(c => {
      if (c.campaign_category) {
        categories.add(c.campaign_category);
      }
    });
    return Array.from(categories).sort();
  };

  // Get all unique influencer categories
  const getInfluencerCategories = () => {
    const categories = new Set();
    campaigns.forEach(c => {
      if (c.influencer_category && Array.isArray(c.influencer_category)) {
        c.influencer_category.forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories).sort();
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    const styles = {
      'active': { 
        background: '#d1fae5', 
        color: '#155724',
        border: '1px solid #84fab0'
      },
      'inactive': { 
        background: '#e2e8f0', 
        color: '#6c757d',
        border: '1px solid #cbd5e0'
      }
    };
    return styles[status?.toLowerCase()] || styles['inactive'];
  };

  // Filter campaigns based on search and filters
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (b.created_at && a.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return b.campaign_id - a.campaign_id;
  });

  const filteredCampaigns = sortedCampaigns.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' 
      ? true 
      : c.status && c.status.toLowerCase() === filter.toLowerCase();
    
    // If campaign category filter hasn't been explicitly applied, show all
    const matchCampaignCategory = !campaignCategoryFilterApplied
      ? true 
      : selectedCampaignCategories.includes(c.campaign_category);
    
    // If influencer category filter hasn't been explicitly applied, show all
    const matchInfluencerCategory = !influencerCategoryFilterApplied
      ? true
      : c.influencer_category && Array.isArray(c.influencer_category) && 
        c.influencer_category.some(cat => selectedInfluencerCategories.includes(cat));
    
    return matchSearch && matchStatus && matchCampaignCategory && matchInfluencerCategory;
  });

  // Calculate pagination
  const totalFilteredItems = filteredCampaigns.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, campaignCategoryFilterApplied, influencerCategoryFilterApplied]);

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  const handleApply = async (campaign) => {
    // Check if user is logged in (basic check, could be more robust)
    const userString = localStorage.getItem('user');
    if (!userString) {
      toast.showToast('Please login to apply', 'error');
      navigate('/login');
      return;
    }
    const user = JSON.parse(userString);
    console.log(user);
    const studentId = user.user_id  
    console.log(studentId)

    if (!studentId) {
      toast.showToast('Student profile not found. Please complete your profile.', 'error');
      return;
    }

    try {
      await campaignService.applyToCampaign({
        campaign_id: campaign.id || campaign.campaign_id,
        student_id: studentId,
        application_notes: `Applying to ${campaign.title}` // Can be enhanced with a modal for notes later
      });
      toast.showToast(`Successfully applied to ${campaign.title}!`, 'success');
      // Update local state to reflect application (optional, dependent on how we want to track 'applied' status locally)
    } catch (error) {
      console.error('Apply error:', error);
      toast.showToast(error.message || 'Failed to apply to campaign', 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Box sx={{ flex: 1, marginLeft: !isMobile ? '260px' : '0', overflow: 'hidden' }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <Box sx={{ marginTop: '72px', background: '#f7fafc', minHeight: 'calc(100vh - 72px)', p: isMobile ? '20px' : '32px' }}>
          {/* Header Section */}
          <Box sx={{ mb: '32px' }}>
            <Typography component="h1" sx={{ m: 0, mb: '8px', fontSize: '2rem', fontWeight: 700, color: '#1a1f36' }}>
              Browse Campaigns
            </Typography>
            <Typography sx={{ m: 0, fontSize: '1rem', color: '#6c757d' }}>
              Discover and apply for campaigns that match your profile
            </Typography>
          </Box>

          {/* Search Bar - Full Width */}
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', mb: '20px' }}>
            <TextField
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#a0aec0', fontSize: '1.5rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#fff',
                  '& fieldset': { borderColor: '#e2e8f0', borderWidth: 2 },
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                fontSize: '1rem'
              }}
            />
          </Box>

          {/* Filters Section */}
          <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px', mb: '32px' }}>
            {/* Status Filter Dropdown */}
            <FormControl fullWidth>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  borderRadius: '10px',
                  '& .MuiSelect-select': { padding: '10px 12px', fontSize: '0.9rem' },
                  background: '#fff',
                  border: '2px solid #e2e8f0'
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            {/* Campaign Category Filter - Multi-Select */}
            <Box sx={{ position: 'relative' }}>
              <Button
                onClick={() => {
                  setShowCampaignCategoryFilter(!showCampaignCategoryFilter);
                  setTempCampaignCategories(selectedCampaignCategories);
                }}
                variant="outlined"
                sx={{ width: '100%', justifyContent: 'flex-start', textTransform: 'none', color: '#6c757d', fontWeight: 400, borderRadius: '10px', borderColor: '#e2e8f0', p: '10px 12px' }}
              >
                Campaign Categories
              </Button>

              {showCampaignCategoryFilter && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '2px solid #667eea', borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 100, mt: '8px', maxHeight: '300px', overflowY: 'auto', p: 0 }}>
                  <Box>
                    {getCampaignCategories().map((cat) => (
                      <Box key={cat} sx={{ display: 'flex', alignItems: 'center', p: '10px 12px', cursor: 'pointer', bgcolor: tempCampaignCategories.includes(cat) ? '#f0f3ff' : 'transparent' }}>
                        <FormControlLabel
                          control={<Checkbox checked={tempCampaignCategories.includes(cat)} onChange={(e) => {
                            if (e.target.checked) {
                              setTempCampaignCategories([...tempCampaignCategories, cat]);
                            } else {
                              setTempCampaignCategories(tempCampaignCategories.filter(c => c !== cat));
                            }
                          }} />}
                          label={<Typography sx={{ fontSize: '0.9rem', color: '#1a1f36' }}>{cat}</Typography>}
                        />
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ p: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                    <Button
                      onClick={() => {
                        setShowCampaignCategoryFilter(false);
                        setSelectedCampaignCategories(tempCampaignCategories);
                        setCampaignCategoryFilterApplied(true);
                      }}
                      sx={{ flex: 1, p: '8px 12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', borderRadius: '8px', '&:hover': { opacity: 0.95 } }}
                    >
                      Apply
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCampaignCategoryFilter(false);
                        setTempCampaignCategories(selectedCampaignCategories);
                      }}
                      variant="outlined"
                      sx={{ flex: 1, p: '8px 12px', borderRadius: '8px', color: '#667eea', borderColor: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* Influencer Category Filter - Multi-Select */}
            <Box sx={{ position: 'relative' }}>
              <Button
                onClick={() => {
                  setShowInfluencerCategoryFilter(!showInfluencerCategoryFilter);
                  setTempInfluencerCategories(selectedInfluencerCategories);
                }}
                variant="outlined"
                sx={{ width: '100%', justifyContent: 'flex-start', textTransform: 'none', color: '#6c757d', fontWeight: 400, borderRadius: '10px', borderColor: '#e2e8f0', p: '10px 12px' }}
              >
                Influencer Categories
              </Button>

              {showInfluencerCategoryFilter && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '2px solid #667eea', borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 100, mt: '8px', maxHeight: '300px', overflowY: 'auto', p: 0 }}>
                  <Box>
                    {getInfluencerCategories().map((cat) => (
                      <Box key={cat} sx={{ display: 'flex', alignItems: 'center', p: '10px 12px', cursor: 'pointer', bgcolor: tempInfluencerCategories.includes(cat) ? '#f0f3ff' : 'transparent' }}>
                        <FormControlLabel
                          control={<Checkbox checked={tempInfluencerCategories.includes(cat)} onChange={(e) => {
                            if (e.target.checked) {
                              setTempInfluencerCategories([...tempInfluencerCategories, cat]);
                            } else {
                              setTempInfluencerCategories(tempInfluencerCategories.filter(c => c !== cat));
                            }
                          }} />}
                          label={<Typography sx={{ fontSize: '0.9rem', color: '#1a1f36' }}>{cat}</Typography>}
                        />
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ p: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                    <Button
                      onClick={() => {
                        setShowInfluencerCategoryFilter(false);
                        setSelectedInfluencerCategories(tempInfluencerCategories);
                        setInfluencerCategoryFilterApplied(true);
                      }}
                      sx={{ flex: 1, p: '8px 12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', borderRadius: '8px', '&:hover': { opacity: 0.95 } }}
                    >
                      Apply
                    </Button>
                    <Button
                      onClick={() => {
                        setShowInfluencerCategoryFilter(false);
                        setTempInfluencerCategories(selectedInfluencerCategories);
                      }}
                      variant="outlined"
                      sx={{ flex: 1, p: '8px 12px', borderRadius: '8px', color: '#667eea', borderColor: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>

          {/* Loading State - Skeleton Cards */}
          {loading && (
            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {[1, 2, 3, 4, 5].map((idx) => (
                <Paper key={idx} elevation={0} sx={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <Box sx={{ background: '#e2e8f0', height: '160px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

                  <Box sx={{ p: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ height: '20px', background: '#e2e8f0', borderRadius: '6px', mb: '12px', width: '40%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    <Box sx={{ height: '24px', background: '#e2e8f0', borderRadius: '6px', mb: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    <Box sx={{ height: '20px', background: '#e2e8f0', borderRadius: '6px', mb: '12px', width: '60%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', mt: 'auto', pt: '12px', borderTop: '1px solid #e2e8f0' }}>
                      <Box sx={{ height: '60px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                      <Box sx={{ height: '60px', background: '#e2e8f0', borderRadius: '6px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    </Box>

                    <Box sx={{ height: '40px', background: '#e2e8f0', borderRadius: '6px', mt: '12px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                  </Box>

                  <Box sx={{ p: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                    <Box sx={{ flex: 1, height: '40px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    <Box sx={{ flex: 1, height: '40px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {/* Add CSS Animation */}
          <style>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }
          `}</style>

          {/* Empty State */}
          {!loading && paginatedCampaigns.length === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#6c757d' }}>
              <Box sx={{ textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: '3rem', mb: '16px' }} />
                <Typography variant="h6" sx={{ m: 0, mb: '8px', color: '#1a1f36' }}>No campaigns found</Typography>
                <Typography sx={{ m: 0 }}>Try adjusting your search or filters</Typography>
              </Box>
            </Box>
          )}

          {/* Campaigns Grid */}
          {!loading && paginatedCampaigns.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {paginatedCampaigns.map((campaign) => {
                const CategoryIcon = getCategoryIcon(campaign.campaign_category);
                const statusStyle = getStatusStyle(campaign.status);

                return (
                  <Paper key={campaign.campaign_id} elevation={0} sx={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', cursor: 'pointer', height: '100%', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' } }}>
                    <Box sx={{ background: campaign.banner_image ? `url(${getImageUrl(campaign.banner_image)}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', height: '160px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', p: '12px', position: 'relative' }}>
                      <Box sx={{ ...statusStyle, p: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{campaign.status}</Box>

                      {campaign.rating && (
                        <Box sx={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', p: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <StarIcon sx={{ fontSize: '1rem', color: '#fbbf24' }} />
                          {campaign.rating}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ p: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
                        <CategoryIcon sx={{ fontSize: '1.2rem', color: '#667eea' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 600 }}>{campaign.campaign_category || 'General'}</Typography>
                      </Box>

                      <Typography sx={{ m: 0, mb: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#1a1f36', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{campaign.title}</Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', mt: 'auto', pt: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AttachMoneyIcon sx={{ fontSize: '1.2rem', color: '#667eea' }} />
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6c757d' }}>Price</Typography>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1f36' }}>{campaign.price_per_post ? `Rp ${Number(campaign.price_per_post).toLocaleString('id-ID')}` : 'TBD'}</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PeopleIcon sx={{ fontSize: '1.2rem', color: '#667eea' }} />
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6c757d' }}>Influencers</Typography>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1f36' }}>{campaign.influencer_count || 0}</Typography>
                          </Box>
                        </Box>
                      </Box>

                      {campaign.start_date && campaign.end_date && (
                        <Box sx={{ mt: '12px', p: '8px 12px', background: '#f7fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#6c757d' }}>
                          <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                          <Typography>{new Date(campaign.start_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} - {new Date(campaign.end_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ p: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                      <Button onClick={() => handleViewDetails(campaign)} variant="outlined" sx={{ flex: 1, p: '10px 12px', background: '#f7fafc', border: '2px solid #e2e8f0', borderRadius: '8px', color: '#667eea', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', '&:hover': { background: '#e0e7ff', borderColor: '#667eea' } }}>Details</Button>
                      <Button onClick={() => handleApply(campaign)} sx={{ flex: 1, p: '10px 12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', opacity: campaign.status === 'active' ? 1 : 0.5, pointerEvents: campaign.status === 'active' ? 'auto' : 'none', '&:hover': { opacity: campaign.status === 'active' ? 0.95 : 0.5 } }} disabled={campaign.status !== 'active'}>Apply</Button>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* Pagination Controls */}
          {!loading && totalFilteredItems > 0 && (
            <Paper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '40px', p: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '16px' }} elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', order: isMobile ? 2 : 0 }}>
                <Typography sx={{ fontSize: '0.95rem', color: '#6c757d', fontWeight: 600, whiteSpace: 'nowrap' }}>Show:</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <Select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} sx={{ p: '8px 12px', borderRadius: '8px', background: '#fff', border: '2px solid #e2e8f0', fontSize: '0.95rem', color: '#1a1f36', fontWeight: 600 }}>
                    <MenuItem value={6}>6 per page</MenuItem>
                    <MenuItem value={12}>12 per page</MenuItem>
                    <MenuItem value={18}>18 per page</MenuItem>
                    <MenuItem value={24}>24 per page</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Typography sx={{ fontSize: '0.9rem', color: '#6c757d', order: isMobile ? 1 : 0, textAlign: isMobile ? 'center' : 'auto', flex: isMobile ? '1 0 100%' : 'auto' }}>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredItems)} to {Math.min(currentPage * itemsPerPage, totalFilteredItems)} of {totalFilteredItems} campaigns
              </Typography>

              <Box sx={{ display: 'flex', gap: '8px', order: isMobile ? 3 : 0 }}>
                <Button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} sx={{ p: '8px 12px', background: currentPage === 1 ? '#e2e8f0' : '#fff', border: '2px solid #e2e8f0', borderRadius: '8px', color: currentPage === 1 ? '#a0aec0' : '#667eea', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', '&:hover': { background: currentPage === 1 ? '#e2e8f0' : '#e0e7ff', borderColor: '#667eea' } }}>← Previous</Button>

                <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    const isCurrentPage = pageNum === currentPage;
                    const isVisible = Math.abs(pageNum - currentPage) <= 1 || pageNum === 1 || pageNum === totalPages;

                    if (!isVisible && (pageNum === 2 || pageNum === totalPages - 1)) {
                      return <Typography key={`dots-${idx}`} sx={{ color: '#a0aec0' }}>...</Typography>;
                    }

                    if (!isVisible) return null;

                    return (
                      <Button key={pageNum} onClick={() => setCurrentPage(pageNum)} sx={{ p: '8px 12px', background: isCurrentPage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff', border: `2px solid ${isCurrentPage ? '#667eea' : '#e2e8f0'}`, borderRadius: '8px', color: isCurrentPage ? '#fff' : '#667eea', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', minWidth: '40px', textAlign: 'center', '&:hover': { background: isCurrentPage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e7ff', borderColor: '#667eea' } }}>{pageNum}</Button>
                    );
                  })}
                </Box>

                <Button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} sx={{ p: '8px 12px', background: currentPage === totalPages || totalPages === 0 ? '#e2e8f0' : '#fff', border: '2px solid #e2e8f0', borderRadius: '8px', color: currentPage === totalPages || totalPages === 0 ? '#a0aec0' : '#667eea', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', '&:hover': { background: currentPage === totalPages || totalPages === 0 ? '#e2e8f0' : '#e0e7ff', borderColor: '#667eea' } }}>Next →</Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedCampaign ? selectedCampaign.title : ''}
          maxWidth="lg"
          showActions={false}
        >
          <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Banner Image */}
            {selectedCampaign.banner_image && (
              <Box sx={{ width: '100%', height: '200px', background: `url(${getImageUrl(selectedCampaign.banner_image)}) center/cover`, borderRadius: '12px', mb: '24px' }} />
            )}

            {/* Campaign Details Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', mb: '24px' }}>
              {/* Left Column */}
              <Box>
                <Typography sx={{ m: 0, mb: '12px', color: '#1a1f36', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Information</Typography>

                {selectedCampaign.has_product && (
                  <>
                    <Box sx={{ mb: '16px' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Product Name</Typography>
                      <Typography sx={{ mt: '4px', fontSize: '1rem', color: '#1a1f36', fontWeight: 600 }}>{selectedCampaign.product_name}</Typography>
                    </Box>

                    <Box sx={{ mb: '16px' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Product Value</Typography>
                      <Typography sx={{ mt: '4px', fontSize: '1rem', color: '#1a1f36', fontWeight: 600 }}>Rp {Number(selectedCampaign.product_value).toLocaleString('id-ID')}</Typography>
                    </Box>

                    <Box sx={{ mb: '16px' }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Description</Typography>
                      <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36', lineHeight: 1.5 }}>{selectedCampaign.product_desc}</Typography>
                    </Box>
                  </>
                )}

                <Box sx={{ mb: '16px' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Category</Typography>
                  <Typography sx={{ mt: '4px', fontSize: '1rem', color: '#1a1f36', fontWeight: 600 }}>{selectedCampaign.campaign_category}</Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Influencer Categories</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: '8px' }}>
                    {selectedCampaign.influencer_category && selectedCampaign.influencer_category.map((cat, idx) => (
                      <Box key={idx} sx={{ background: '#e0e7ff', color: '#667eea', px: '12px', py: '6px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{cat}</Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Right Column */}
              <Box>
                <Typography sx={{ m: 0, mb: '12px', color: '#1a1f36', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campaign Details</Typography>

                <Box sx={{ mb: '16px' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Price Per Post</Typography>
                  <Typography sx={{ mt: '4px', fontSize: '1.2rem', color: '#667eea', fontWeight: 700 }}>Rp {Number(selectedCampaign.price_per_post).toLocaleString('id-ID')}</Typography>
                </Box>

                <Box sx={{ mb: '16px' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Status</Typography>
                  <Typography sx={{ mt: '4px', fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', color: selectedCampaign.status === 'active' ? '#155724' : '#6c757d' }}>{selectedCampaign.status}</Typography>
                </Box>

                <Box sx={{ mb: '16px' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Dates</Typography>
                  <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36' }}>{selectedCampaign.start_date && new Date(selectedCampaign.start_date).toLocaleDateString('id-ID')} - {selectedCampaign.end_date && new Date(selectedCampaign.end_date).toLocaleDateString('id-ID')}</Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Requirements</Typography>
                  <Box sx={{ mt: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Box sx={{ background: '#f7fafc', p: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <Typography component="span" sx={{ fontWeight: 600, color: '#1a1f36' }}>Min Followers: </Typography>
                      <Typography component="span" sx={{ color: '#6c757d' }}>{selectedCampaign.min_followers?.toLocaleString('id-ID') || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ background: '#f7fafc', p: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <Typography component="span" sx={{ fontWeight: 600, color: '#1a1f36' }}>Gender: </Typography>
                      <Typography component="span" sx={{ color: '#6c757d' }}>{selectedCampaign.selected_gender || 'Any'}</Typography>
                    </Box>
                    <Box sx={{ background: '#f7fafc', p: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <Typography component="span" sx={{ fontWeight: 600, color: '#1a1f36' }}>Age: </Typography>
                      <Typography component="span" sx={{ color: '#6c757d' }}>{selectedCampaign.selected_age || 'Any'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Guidelines */}
            {(selectedCampaign.content_guidelines || selectedCampaign.caption_guidelines) && (
              <Box sx={{ mb: '24px' }}>
                <Typography sx={{ m: 0, mb: '12px', color: '#1a1f36', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guidelines</Typography>

                {selectedCampaign.content_guidelines && (
                  <Box sx={{ mb: '12px' }}>
                    <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Content Guidelines</Typography>
                    <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{selectedCampaign.content_guidelines}</Typography>
                  </Box>
                )}

                {selectedCampaign.caption_guidelines && (
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600 }}>Caption Guidelines</Typography>
                    <Typography sx={{ mt: '4px', fontSize: '0.95rem', color: '#1a1f36', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{selectedCampaign.caption_guidelines}</Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Action Buttons - At Bottom */}
            <Box sx={{ display: 'flex', gap: '12px', pt: '24px', borderTop: '1px solid #e2e8f0', mt: '24px' }}>
              <Button onClick={() => setShowDetailModal(false)} variant="outlined" sx={{ flex: 1, p: '12px 24px', background: '#f7fafc', border: '2px solid #e2e8f0', borderRadius: '8px', color: '#667eea', fontWeight: 600, fontSize: '1rem', textTransform: 'none', '&:hover': { background: '#e0e7ff', borderColor: '#667eea' } }}>Close</Button>
              <Button onClick={() => { handleApply(selectedCampaign); setShowDetailModal(false); }} sx={{ flex: 1, p: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '1rem', textTransform: 'none', opacity: selectedCampaign.status === 'active' ? 1 : 0.5, pointerEvents: selectedCampaign.status === 'active' ? 'auto' : 'none', '&:hover': { opacity: selectedCampaign.status === 'active' ? 0.95 : 0.5 } }} disabled={selectedCampaign.status !== 'active'}>Apply Now</Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
}

export default BrowseCampaigns;
