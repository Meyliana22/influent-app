import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Stack, Grid, Card, CardContent, Typography, Button, TextField, Select, MenuItem, InputAdornment, Paper } from '@mui/material';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await campaignService.getCampaigns();
        setCampaigns(response.data);
      } catch (err) {
        setCampaigns([]);
      }
    };
    loadCampaigns();
    const handleStorageChange = () => loadCampaigns();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, ml: isMobile ? 0 : 32.5, overflow: 'hidden' }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ mt: 9, bgcolor: '#f7fafc', minHeight: 'calc(100vh - 72px)', overflow: 'hidden' }}>
            <Container
              maxWidth={false}
              sx={{
                py: { xs: 2, md: 4 },
                maxWidth: 1,
                height: 'calc(100vh - 72px)',
                overflow: 'auto',
              }}
            >
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <Button
                variant="contained"
                onClick={() => navigate('/campaign-create')}
                sx={{
                  bgcolor: '#667eea',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 16,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#5568d3' }
                }}
              >
                New
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                Campaign List
              </Typography>
            </Stack>
            {/* Search & Filter */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4} flexWrap="wrap">
              <Box sx={{ flex: '1 1 auto', minWidth: 250 }}>
                <TextField
                  fullWidth
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.textSecondary, opacity: 0.6 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#fff',
                    boxShadow: 1,
                    fontSize: 15,
                  }}
                />
              </Box>
              <Box sx={{ flex: '0 0 auto', minWidth: 150 }}>
                <Select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  fullWidth
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#fff',
                    fontSize: 16,
                    boxShadow: 1,
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </Box>
            </Stack>
            {/* Campaign Cards */}
            {filteredCampaigns.map(campaign => (
              <Card
                key={campaign.campaign_id}
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  width: 1,
                  boxSizing: 'border-box',
                  borderRadius: 3,
                  boxShadow: 1
                }}
              >
                {/* Image/Icon */}
                <Box
                  onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                  sx={{
                    width: { xs: 20, sm: 30 },
                    height: { xs: 20, sm: 30 },
                    background: getCategoryGradient(campaign.campaign_category),
                    borderRadius: 3,
                    mr: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 2,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {campaign.banner_image ? (
                    <Box component="img" src={campaign.banner_image} alt={campaign.title} sx={{ width: 1, height: 1, objectFit: 'cover', borderRadius: 2.5 }} />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#fff' }}>
                      <Box sx={{ mb: 0.5, opacity: 0.9 }}>
                        {React.createElement(getCategoryIcon(campaign.campaign_category), {
                          sx: { fontSize: 20, color: '#fff' }
                        })}
                      </Box>
                      <Typography sx={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>
                        {(campaign.campaign_category || '').split(' ')[0]}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {/* Card Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5, color: COLORS.textPrimary, lineHeight: 1.3 }}>
                        {campaign.title}
                      </Typography>
                      <Typography sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 500 }}>
                        {campaign.campaign_category || 'No Category'}
                      </Typography>
                    </Box>
                    <Box sx={{
                      ...getStatusStyle(campaign.status),
                      px: 2,
                      py: 0.5,
                      borderRadius: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      letterSpacing: '0.5px',
                      alignSelf: 'flex-start'
                    }}>
                      {campaign.status}
                    </Box>
                  </Box>
                  <Box
                    onClick={() => navigate(`/campaign-edit/${campaign.campaign_id}`)}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PeopleIcon sx={{ fontSize: 13, color: COLORS.textSecondary }} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>
                        {campaign.influencer_count || 0} influencers
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoneyIcon sx={{ fontSize: 13, color: COLORS.textSecondary }} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>
                        Rp {parseInt(campaign.price_per_post || 0).toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BarChart3 size={13} color={COLORS.textSecondary} />
                      <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 500 }}>
                        {campaign.min_followers ? `${parseInt(campaign.min_followers).toLocaleString('id-ID')}+ followers` : 'No min followers'}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1.5} mt={1} pt={1.5} sx={{ borderTop: 1, borderColor: COLORS.border }}> 
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (campaign.status && campaign.status.toLowerCase() === 'active') {
                          navigate(`/campaign/${campaign.campaign_id}/detail`);
                        } else {
                          navigate(`/campaign-edit/${campaign.campaign_id}`);
                        }
                      }}
                      sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                      Details
                    </Button>
                    {campaign.status && campaign.status.toLowerCase() === 'active' && (
                      <Button
                        variant="contained"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/campaign/${campaign.campaign_id}/applicants`);
                        }}
                        sx={{
                          bgcolor: '#667eea',
                          color: '#fff',
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: 16,
                          boxShadow: 'none',
                          flex: 1,
                          '&:hover': { bgcolor: '#5568d3' }
                        }}
                      >
                        View applicants
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Card>
            ))}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default CampaignList;
