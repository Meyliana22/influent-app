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
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';

import { useToast } from '../../hooks/useToast';

const API_BASE_URL = process.env.REACT_APP_API_IMAGE_URL

// const getImageUrl = (imageName) => {
 
//   return `${imageName}`;
// };

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

  // Helper to safely parse reference images
  const parseReferenceImages = (images) => {
    if (!images) return [];
    try {
      let parsed = images;
      // Handle double stringification
      if (typeof parsed === 'string' && (parsed.startsWith('"') || parsed.startsWith("'"))) {
         parsed = JSON.parse(parsed);
      }
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse reference images:', e);
      return [];
    }
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

  // Helper to safely parse influencer categories
  const parseInfluencerCategory = (categoryData) => {
    if (!categoryData) return [];
    if (Array.isArray(categoryData)) return categoryData;
    if (typeof categoryData === 'string') {
      try {
        if (categoryData.startsWith('[')) {
          return JSON.parse(categoryData);
        }
        return [categoryData];
      } catch (e) {
        return [categoryData];
      }
    }
    return [];
  };

  // Get all unique influencer categories
  const getInfluencerCategories = () => {
    const categories = new Set();
    campaigns.forEach(c => {
      const cats = parseInfluencerCategory(c.influencer_category);
      cats.forEach(cat => categories.add(cat));
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

  // Translate status helper
  const translateStatus = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'completed': return 'Selesai';
      case 'closed': return 'Selesai';
      default: return status;
    }
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
      : (() => {
          const cats = parseInfluencerCategory(c.influencer_category);
          return cats.some(cat => selectedInfluencerCategories.includes(cat));
        })();
    
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
      toast.showToast('Silakan masuk untuk melamar', 'error');
      navigate('/login');
      return;
    }
    const user = JSON.parse(userString);
    console.log(user);
    const studentId = user.user_id  
    console.log(studentId)

    if (!studentId) {
      toast.showToast('Profil siswa tidak ditemukan. Harap lengkapi profil Anda.', 'error');
      return;
    }

    try {
      await campaignService.applyToCampaign({
        campaign_id: campaign.id || campaign.campaign_id,
        student_id: studentId,
        application_notes: `Applying to ${campaign.title}` // Can be enhanced with a modal for notes later
      });
      toast.showToast(`Berhasil melamar ke ${campaign.title}!`, 'success');
      navigate('/student/my-applications');
      // Update local state to reflect application (optional, dependent on how we want to track 'applied' status locally)
    } catch (error) {
      console.error('Apply error:', error);
      toast.showToast(error.message || 'Gagal melamar ke kampanye', 'error');
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
              Jelajahi Kampanye
            </Typography>
            <Typography sx={{ m: 0, fontSize: '1rem', color: '#6c757d' }}>
              Temukan dan lamar kampanye yang sesuai dengan profil Anda
            </Typography>
          </Box>

          {/* Search Bar - Full Width */}
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', mb: '20px' }}>
            <TextField
              placeholder="Cari kampanye..."
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
                  '&:hover fieldset': { borderColor: '#6E00BE' },
                  '&.Mui-focused fieldset': { borderColor: '#6E00BE' }
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
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="inactive">Tidak Aktif</MenuItem>
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
                Kategori Kampanye
              </Button>

              {showCampaignCategoryFilter && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '2px solid #6E00BE', borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 100, mt: '8px', maxHeight: '300px', overflowY: 'auto', p: 0 }}>
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
                      sx={{ flex: 1, p: '8px 12px', background: '#6E00BE', color: '#fff', fontWeight: 600, fontSize: '0.85rem', borderRadius: '8px', '&:hover': { opacity: 0.95, background: '#5a009e' } }}
                    >
                      Terapkan
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCampaignCategoryFilter(false);
                        setTempCampaignCategories(selectedCampaignCategories);
                      }}
                      variant="outlined"
                      sx={{ flex: 1, p: '8px 12px', borderRadius: '8px', color: '#6E00BE', borderColor: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      Batal
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
                Kategori Influencer
              </Button>

              {showInfluencerCategoryFilter && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '2px solid #6E00BE', borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 100, mt: '8px', maxHeight: '300px', overflowY: 'auto', p: 0 }}>
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
                      sx={{ flex: 1, p: '8px 12px', background: '#6E00BE', color: '#fff', fontWeight: 600, fontSize: '0.85rem', borderRadius: '8px', '&:hover': { opacity: 0.95, background: '#5a009e' } }}
                    >
                      Terapkan
                    </Button>
                    <Button
                      onClick={() => {
                        setShowInfluencerCategoryFilter(false);
                        setTempInfluencerCategories(selectedInfluencerCategories);
                      }}
                      variant="outlined"
                      sx={{ flex: 1, p: '8px 12px', borderRadius: '8px', color: '#6E00BE', borderColor: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      Batal
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
                <Typography variant="h6" sx={{ m: 0, mb: '8px', color: '#1a1f36' }}>Tidak ada kampanye ditemukan</Typography>
                <Typography sx={{ m: 0 }}>Coba sesuaikan pencarian atau filter Anda</Typography>
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
                    <Box sx={{ background: campaign.banner_image ? `url(${campaign.banner_image}) center/cover` : '#6E00BE', height: '160px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', p: '12px', position: 'relative' }}>
                      <Box sx={{ ...statusStyle, p: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{translateStatus(campaign.status)}</Box>

                      {campaign.rating && (
                        <Box sx={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', p: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <StarIcon sx={{ fontSize: '1rem', color: '#fbbf24' }} />
                          {campaign.rating}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ p: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
                        <CategoryIcon sx={{ fontSize: '1.2rem', color: '#6E00BE' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#6E00BE', fontWeight: 600 }}>{campaign.campaign_category || 'Umum'}</Typography>
                      </Box>

                      <Typography sx={{ m: 0, mb: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#1a1f36', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{campaign.title}</Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', mt: 'auto', pt: '12px', borderTop: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* <AttachMoneyIcon sx={{ fontSize: '1.2rem', color: '#6E00BE' }} /> */}
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6c757d' }}>Pembayaran</Typography>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1f36' }}>{campaign.price_per_post ? `Rp ${Number(campaign.price_per_post).toLocaleString('id-ID')}` : 'TBD'}</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PeopleIcon sx={{ fontSize: '1.2rem', color: '#6E00BE' }} />
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6c757d' }}>Influencer</Typography>
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
                      <Button onClick={() => handleViewDetails(campaign)} variant="outlined" sx={{ flex: 1, p: '10px 12px', background: '#f7fafc', border: '2px solid #e2e8f0', borderRadius: '8px', color: '#6E00BE', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', '&:hover': { background: '#e0e7ff', borderColor: '#6E00BE' } }}>Detail</Button>
                      <Button onClick={() => handleApply(campaign)} sx={{ flex: 1, p: '10px 12px', background: '#6E00BE', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', opacity: campaign.status === 'active' ? 1 : 0.5, pointerEvents: campaign.status === 'active' ? 'auto' : 'none', '&:hover': { opacity: campaign.status === 'active' ? 0.95 : 0.5, background: '#5a009e' } }} disabled={campaign.status !== 'active'}>Lamar</Button>
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
                <Typography sx={{ fontSize: '0.95rem', color: '#6c757d', fontWeight: 600, whiteSpace: 'nowrap' }}>Tampilkan:</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <Select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} sx={{ p: '8px 12px', borderRadius: '8px', background: '#fff', border: '2px solid #e2e8f0', fontSize: '0.95rem', color: '#1a1f36', fontWeight: 600 }}>
                    <MenuItem value={6}>6 per halaman</MenuItem>
                    <MenuItem value={12}>12 per halaman</MenuItem>
                    <MenuItem value={18}>18 per halaman</MenuItem>
                    <MenuItem value={24}>24 per halaman</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Typography sx={{ fontSize: '0.9rem', color: '#6c757d', order: isMobile ? 1 : 0, textAlign: isMobile ? 'center' : 'auto', flex: isMobile ? '1 0 100%' : 'auto' }}>
                Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredItems)} hingga {Math.min(currentPage * itemsPerPage, totalFilteredItems)} dari {totalFilteredItems} kampanye
              </Typography>

              <Box sx={{ display: 'flex', gap: '8px', order: isMobile ? 3 : 0 }}>
                <Button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} sx={{ p: '8px 12px', background: currentPage === 1 ? '#e2e8f0' : '#fff', border: '2px solid #e2e8f0', borderRadius: '8px', color: currentPage === 1 ? '#a0aec0' : '#6E00BE', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', '&:hover': { background: currentPage === 1 ? '#e2e8f0' : '#e0e7ff', borderColor: '#6E00BE' } }}>← Sebelumnya</Button>

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
                      <Button key={pageNum} onClick={() => setCurrentPage(pageNum)} sx={{ p: '8px 12px', background: isCurrentPage ? '#6E00BE' : '#fff', border: `2px solid ${isCurrentPage ? '#6E00BE' : '#e2e8f0'}`, borderRadius: '8px', color: isCurrentPage ? '#fff' : '#6E00BE', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', minWidth: '40px', textAlign: 'center', '&:hover': { background: isCurrentPage ? '#5a009e' : '#e0e7ff', borderColor: '#6E00BE' } }}>{pageNum}</Button>
                    );
                  })}
                </Box>

                <Button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} sx={{ p: '8px 12px', background: currentPage === totalPages || totalPages === 0 ? '#e2e8f0' : '#fff', border: '2px solid #e2e8f0', borderRadius: '8px', color: currentPage === totalPages || totalPages === 0 ? '#a0aec0' : '#6E00BE', fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', '&:hover': { background: currentPage === totalPages || totalPages === 0 ? '#e2e8f0' : '#e0e7ff', borderColor: '#6E00BE' } }}>Selanjutnya →</Button>
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
          title="Detail Kampanye"
          maxWidth="lg"
          showActions={false}
        >
          <Box sx={{ maxHeight: '75vh', overflowY: 'auto', p: 1 }}>
            
            {/* 1. Header Section */}
            <Box sx={{ mb: 4 }}>
              {selectedCampaign.banner_image && (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: { xs: '160px', md: '240px' }, 
                    background: `url(${selectedCampaign.banner_image}) center/cover`, 
                    borderRadius: '16px', 
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
              )}
              
              <Stack direction={{ xs: 'column', md: 'column' }} spacing={2} justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Stack direction="row" spacing={1} mb={1}>
                    <Chip 
                      label={translateStatus(selectedCampaign.status)} 
                      sx={{ 
                        ...getStatusStyle(selectedCampaign.status), 
                        fontWeight: 700, 
                        height: 24,
                        fontSize: '0.75rem'
                      }} 
                    />
                    <Chip 
                      label={selectedCampaign.campaign_category || 'Umum'} 
                      sx={{ bgcolor: '#f3e5f5', color: '#6E00BE', fontWeight: 600, height: 24, fontSize: '0.75rem' }} 
                    />
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1f36', mb: 1, lineHeight: 1.2 }}>
                    {selectedCampaign.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Dibuat oleh <strong style={{ color: '#6E00BE' }}>{selectedCampaign.user?.name || 'Perusahaan'}</strong>
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    FEE PER POSTINGAN
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#6E00BE' }}>
                    Rp {Number(selectedCampaign.price_per_post || 0).toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Grid container spacing={3} alignItems="stretch">
              {/* Row 1: Product & Requirements */}
              {selectedCampaign.has_product && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'visible', height: '100%' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                      <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Informasi Produk</Typography>
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                      <Stack spacing={3}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>NAMA PRODUK</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>{selectedCampaign.product_name}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 0.5, display: 'block' }}>NILAI PRODUK</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>Rp {Number(selectedCampaign.product_value || 0).toLocaleString('id-ID')}</Typography>
                          </Box>
                          <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 1, display: 'block' }}>DESKRIPSI PRODUK</Typography>
                          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>{selectedCampaign.product_desc || '-'}</Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12} md={selectedCampaign.has_product ? 6 : 12}>
                <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                    <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Kriteria Influencer</Typography>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>Kategori</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
                            {parseInfluencerCategory(selectedCampaign.influencer_category).map((cat, idx) => (
                              <Chip key={idx} label={cat} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.7rem' }} />
                            ))}
                          </Box>
                        </Box>
                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>Min. Pengikut</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {(selectedCampaign.min_followers || 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>Target Gender</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>
                            {selectedCampaign.selected_gender === 'all' ? 'Semua' : selectedCampaign.selected_gender}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>Target Usia</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {(() => {
                                if (!selectedCampaign.selected_age) return 'Semua';
                                try {
                                    let parsed = selectedCampaign.selected_age;
                                    if (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                                        parsed = JSON.parse(parsed);
                                        if (typeof parsed === 'string' && parsed.startsWith('[')) parsed = JSON.parse(parsed);
                                    }
                                    return Array.isArray(parsed) ? parsed.join(', ') : parsed;
                                } catch (e) { return selectedCampaign.selected_age; }
                              })()}
                          </Typography>
                        </Box>
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* Row 2: Guidelines & Timeline */}
              <Grid item xs={12} md={6}>
                 <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                      <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Panduan & Aturan</Typography>
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 1, display: 'block' }}>PANDUAN KONTEN</Typography>
                          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {selectedCampaign.content_guidelines || 'Tidak ada panduan spesifik.'}
                          </Typography>
                        </Box>
                          <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 0.5, mb: 1, display: 'block' }}>PANDUAN CAPTION</Typography>
                          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {selectedCampaign.caption_guidelines || 'Tidak ada aturan spesifik.'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                    <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Tenggat Waktu</Typography>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Stack spacing={2.5}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#eff6ff', color: '#3b82f6', height: 'fit-content' }}>
                            <CampaignIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>PERIODE KAMPANYE</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) : '-'} 
                              {' - '}
                              {selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                            </Typography>
                          </Box>
                      </Box>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#fff1f2', color: '#f43f5e', height: 'fit-content' }}>
                            <CalendarTodayIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>TENGGAT WAKTU REGISTRASI</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#e11d48' }}>
                              {selectedCampaign.submission_deadline ? new Date(selectedCampaign.submission_deadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'}
                            </Typography>
                          </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                  {parseReferenceImages(selectedCampaign.reference_images).length > 0 && (
                    <Card variant="outlined" sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', mt: 3, mb: 1 }}>
                       <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                         <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem' }}>Referensi Visual</Typography>
                       </Box>
                       <Box sx={{ p: 2.5, display: 'flex', gap: 2, overflowX: 'auto', pb: 3 }}>
                          {parseReferenceImages(selectedCampaign.reference_images).map((img, idx) => (
                             <Box 
                               key={idx} 
                               component="img"
                               src={img}
                               alt={`Reference ${idx + 1}`}
                               sx={{ 
                                 width: 120, 
                                 height: 120, 
                                 objectFit: 'cover', 
                                 borderRadius: '8px',
                                 border: '1px solid #e2e8f0',
                                 flexShrink: 0,
                                 cursor: 'pointer',
                                 '&:hover': { transform: 'scale(1.02)' }
                               }}
                               onClick={() => window.open(img, '_blank')}
                             />
                          ))}
                       </Box>
                    </Card>
                  )}
              </Grid>

              {/* Row 3: Stats */}
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: '16px', bgcolor: '#F3F0FF', border: '1px solid #E9D5FF' }}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#6B21A8', fontWeight: 700, letterSpacing: 1 }}>KUOTA INFLUENCER</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#6E00BE', my: 1 }}>
                        {selectedCampaign.influencer_count || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7E22CE' }}>Orang Dibutuhkan</Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Paper 
              elevation={3} 
              sx={{ 
                position: 'sticky', 
                bottom: -20, 
                mx: -3, 
                mb: -3, 
                p: 3, 
                mt: 4, 
                borderTop: '1px solid #e2e8f0', 
                backgroundColor: '#fff',
                zIndex: 10
              }}
            >
              <Stack direction="row" spacing={2}>
                 <Button 
                    onClick={() => setShowDetailModal(false)} 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      py: 1.5, 
                      borderRadius: '12px', 
                      color: '#64748b', 
                      borderColor: '#cbd5e1', 
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                    }}
                  >
                    Tutup
                  </Button>
                  <Button 
                    onClick={() => { handleApply(selectedCampaign); setShowDetailModal(false); }} 
                    variant="contained"
                    fullWidth
                    disabled={selectedCampaign.status !== 'active'}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: '#6E00BE', 
                      color: '#fff', 
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 14px rgba(110, 0, 190, 0.3)',
                      '&:hover': { bgcolor: '#5a009e', transform: 'translateY(-1px)' },
                      '&:disabled': { bgcolor: '#cbd5e1', color: '#94a3b8', boxShadow: 'none' }
                    }}
                  >
                    {selectedCampaign.status === 'active' ? 'Lamar Sekarang' : 'Tidak Tersedia'}
                  </Button>
              </Stack>
            </Paper>

          </Box>
        </Modal>
      )}
    </Box>
  );
}

export default BrowseCampaigns;
