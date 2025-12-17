import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../../components/common';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Grid,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import * as campaignService from '../../services/campaignService';
import { useToast } from '../../hooks/useToast';

const MyApplications = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      const response = await campaignService.getCampaignUsers();
      
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response.result && Array.isArray(response.result)) {
        data = response.result;
      }
      
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCancel = async (applicationId) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return;
    
    try {
      await campaignService.updateCampaignUser(applicationId, {
        application_status: 'cancelled'
      });
      toast.showToast('Application cancelled', 'success');
      fetchApplications();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.showToast('Failed to cancel application', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      case 'pending': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: isMobile ? 0 : '260px',
          marginTop: '72px',
          width: isMobile ? '100%' : 'calc(100% - 260px)',
          minHeight: 'calc(100vh - 72px)',
          bgcolor: '#f8f9fa',
          p: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1 }}>
              My Applications
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Track the status of your campaign applications
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : applications.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 3, 
                bgcolor: '#fff', 
                border: '1px solid #e2e8f0' 
              }}
            >
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                You haven't applied to any campaigns yet.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/student/browse-campaigns')}
                sx={{ 
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5a67d8' }
                }}
              >
                Browse Campaigns
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {applications.map((app) => (
                <Grid item xs={12} md={6} lg={4} key={app.id || app.campaign_user_id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Chip 
                          label={app.campaign?.campaign_category || 'Campaign'} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 20, 
                            mb: 1,
                            bgcolor: '#f0f4ff',
                            color: '#667eea',
                            fontWeight: 600
                          }} 
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3 }}>
                          {app.campaign?.title || app.campaign_title || `Campaign #${app.campaign_id}`}
                        </Typography>
                      </Box>
                      <Chip 
                        label={app.application_status || 'Pending'} 
                        color={getStatusColor(app.application_status)}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
                      />
                    </Box>

                    <Box sx={{ mb: 2, flexGrow: 1 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        Applied: {new Date(app.created_at || app.applied_at || Date.now()).toLocaleDateString()}
                      </Typography>
                      {app.campaign?.price_per_post && (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1f36' }}>
                          Rp {Number(app.campaign.price_per_post).toLocaleString('id-ID')} / post
                        </Typography>
                      )}
                    </Box>
                    
                    {app.application_notes && (
                      <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          My Notes:
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#334155' }}>
                          {app.application_notes}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                      {app.application_status === 'pending' && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          fullWidth
                          onClick={() => handleCancel(app.id || app.campaign_user_id)}
                          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                          Cancel
                        </Button>
                      )}
                      
                      <Button 
                        variant={app.application_status === 'accepted' ? "contained" : "outlined"}
                        size="small"
                        fullWidth
                        sx={{ 
                          borderRadius: 1.5, 
                          textTransform: 'none', 
                          fontWeight: 600,
                          bgcolor: app.application_status === 'accepted' ? '#667eea' : 'transparent',
                          borderColor: app.application_status === 'accepted' ? '#667eea' : '#e2e8f0',
                          color: app.application_status === 'accepted' ? '#fff' : '#64748b',
                          '&:hover': {
                            bgcolor: app.application_status === 'accepted' ? '#5a67d8' : '#f8fafc'
                          }
                        }}
                        onClick={() => navigate(`/campaign/${app.campaign_id}/detail`)} // Verify route exists
                      >
                        Details
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default MyApplications;
