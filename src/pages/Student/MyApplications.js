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

import { Modal } from '../../components/common';

const MyApplications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal state for cancellation
  const [cancelModal, setCancelModal] = useState({ 
    open: false, 
    appId: null 
  });

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

  const initiateCancel = (applicationId) => {
    setCancelModal({ open: true, appId: applicationId });
  };

  const confirmCancel = async () => {
    const applicationId = cancelModal.appId;
    if (!applicationId) return;

    try {
      await campaignService.cancelCampaignUser(applicationId);
      showToast('Application cancelled', 'success');
      setCancelModal({ open: false, appId: null });
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
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, borderLeft: '5px solid #6E00BE', pl: 2 }}>
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
                <TableHead sx={{ bgcolor: '#6E00BE' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Campaign</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }}>Date Applied</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#fff' }} align="right">Actions</TableCell>
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
                             <Button 
                               variant="outlined" 
                               size="small"
                               color="error"
                               onClick={() => initiateCancel(app.id || app.campaign_user_id)}
                               startIcon={<CancelIcon />}
                               sx={{ borderRadius: 2, textTransform: 'none' }}
                             >
                               Cancel
                             </Button>
                          )}
                          
                          <Button 
                            variant="outlined"
                            size="small"
                            startIcon={app.application_status === 'accepted' ? <AssignmentIcon /> : <VisibilityIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#6E00BE', color: '#6E00BE', '&:hover': { borderColor: '#5a009e', bgcolor: '#f3e5f5' } }}
                            onClick={() => {
                              if (app.application_status === 'accepted') {
                                 navigate(`/student/campaign/${app.campaign_id || app.campaign?.id}/work`);
                              } else {
                                 showToast('Wait for acceptance to submit work', 'info');
                              }
                            }}
                          >
                            {app.application_status === 'accepted' ? 'Submit Work' : 'Details'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Cancel Confirmation Modal */}
          <Modal
             isOpen={cancelModal.open}
             onClose={() => setCancelModal({ ...cancelModal, open: false })}
             title="Cancel Application"
             onConfirm={confirmCancel}
             confirmText="Yes, Cancel Application"
             cancelText="No, Keep It"
             variant="danger"
          >
             <Typography>
                Are you sure you want to cancel your application? This action cannot be undone.
             </Typography>
          </Modal>

        </Container>
      </Box>
    </Box>
  );
};

export default MyApplications;
