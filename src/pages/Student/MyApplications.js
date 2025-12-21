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
  Chip,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  Cancel as CancelIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import * as campaignService from '../../services/campaignService';
import { useToast } from '../../hooks/useToast';

const MyApplications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast(); // Fix destructuring
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
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (applicationId) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return;
    
    try {
      await campaignService.updateCampaignUser(applicationId, {
        application_status: 'cancelled'
      });
      showToast('Application cancelled', 'success');
      fetchApplications();
    } catch (error) {
      console.error('Cancel error:', error);
      showToast('Failed to cancel application', 'error');
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
                  bgcolor: '#6E00BE',
                  '&:hover': { bgcolor: '#5a009e' }
                }}
              >
                Browse Campaigns
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Campaign</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date Applied</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow 
                      key={app.id || app.campaign_user_id}
                      sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                    >
                      <TableCell>
                         <Typography variant="body1" fontWeight={600}>
                            {app.campaign?.title || app.campaign_title || `Campaign #${app.campaign_id}`}
                         </Typography>
                         {app.campaign?.price_per_post && (
                            <Typography variant="caption" color="textSecondary">
                              Rp {Number(app.campaign.price_per_post).toLocaleString('id-ID')} / post
                            </Typography>
                         )}
                      </TableCell>
                      <TableCell>
                         <Chip 
                            label={app.campaign?.campaign_category || 'Campaign'} 
                            size="small" 
                            variant="outlined" 
                            sx={{ borderRadius: 1 }}
                         />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={app.application_status || 'Pending'} 
                          color={getStatusColor(app.application_status)}
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(app.created_at || app.applied_at || Date.now()).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {app.application_status === 'pending' && (
                            <Tooltip title="Cancel Application">
                               <IconButton 
                                 size="small" 
                                 color="error"
                                 onClick={() => handleCancel(app.id || app.campaign_user_id)}
                               >
                                 <CancelIcon fontSize="small" />
                               </IconButton>
                            </Tooltip>
                          )}
                          
                          <Button 
                            variant="outlined"
                            size="small"
                            startIcon={app.application_status === 'accepted' ? <AssignmentIcon /> : <VisibilityIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                            onClick={() => {
                              if (app.application_status === 'accepted') {
                                 navigate(`/student/campaign/${app.campaign_id || app.campaign?.id}/work`);
                              } else {
                                 // Original detail or maybe just a summary view?
                                 // For now let's show info or navigate to public detail if available
                                 showToast('Wait for acceptance to submit work', 'info');
                              }
                            }}
                          >
                            {app.application_status === 'accepted' ? 'Work' : 'Details'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default MyApplications;
