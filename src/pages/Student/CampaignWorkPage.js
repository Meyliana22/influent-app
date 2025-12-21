import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, Topbar } from '../../components/common';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Launch as LaunchIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import campaignService from '../../services/campaignService';
import workSubmissionService from '../../services/workSubmissionService';
import { useToast } from '../../hooks/useToast';

const CampaignWorkPage = () => {
  const { id } = useParams(); // Campaign ID
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [application, setApplication] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false); 
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Data (Student Fields Only)
  const [formData, setFormData] = useState({
    content_type: 'post',
    content_url: '',
    caption: '',
    hashtags: '',
    platform: 'instagram',
    submission_notes: ''
  });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Get Campaign
      const campaignRes = await campaignService.getCampaignById(id);
      const campaignData = campaignRes.data || campaignRes;
      setCampaign(campaignData);

      // 2. Get Application
      const appsRes = await campaignService.getCampaignUsers();
      const myApps = appsRes.data || appsRes || [];
      const myApp = myApps.find(app => String(app.campaign_id) === String(id));
      
      if (myApp) {
         setApplication(myApp); // This object has 'id' which is 'campaign_user_id'
         
         // 3. Get Submissions
         const subsRes = await workSubmissionService.getCampaignSubmissions(id);
         const subsData = subsRes.data || subsRes || [];
         
         // Filter: IDs must match
         const myId = myApp.id || myApp.campaign_user_id;
         const mySubs = subsData.filter(s => String(s.campaign_user_id) === String(myId));
         setSubmissions(mySubs);
      } else {
         showToast('Application not found', 'error');
         navigate('/student/my-applications');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load campaign data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      content_type: 'post',
      content_url: '',
      caption: '',
      hashtags: '',
      platform: 'instagram',
      submission_notes: ''
    });
    setEditMode(false);
    setViewMode(false);
    setSelectedSubmission(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (submission) => {
    mapSubmissionToForm(submission);
    setEditMode(true);
    setViewMode(false);
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleOpenView = (submission) => {
    mapSubmissionToForm(submission);
    setEditMode(false);
    setViewMode(true);
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const mapSubmissionToForm = (submission) => {
    setFormData({
      content_type: submission.content_type || 'post',
      content_url: submission.content_url || '',
      caption: submission.caption || '',
      hashtags: Array.isArray(submission.hashtags) 
         ? submission.hashtags.join(' ') 
         : (submission.hashtags || ''),
      platform: submission.platform || 'instagram',
      submission_notes: submission.submission_notes || ''
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (status) => {
    if (!application) return;
    
    // Validations: URL required for Final submission
    if (status === 'final') {
       if (!formData.content_url.trim()) {
         showToast('Content URL is required for submission', 'warning');
         return;
       }
    }

    try {
      setSubmitting(true);
      
      // Construct Payload - STRICTLY STUDENT FIELDS only
      const payload = {
        campaign_user_id: application.id || application.campaign_user_id,
        submission_type: status, // 'draft' or 'final'
        content_type: formData.content_type,
        content_url: formData.content_url,
        content_files: [], // Always empty array as per requirement
        caption: formData.caption,
        hashtags: typeof formData.hashtags === 'string' 
           ? formData.hashtags.split(' ').map(tag => tag.trim()).filter(tag => tag.length > 0)
           : formData.hashtags,
        platform: formData.platform,
        submission_notes: formData.submission_notes
      };

      if (editMode && selectedSubmission) {
        // UPDATE
        const subId = selectedSubmission.submission_id || selectedSubmission.id;
        await workSubmissionService.updateWorkSubmission(subId, payload);
        showToast('Submission updated', 'success');
      } else {
        // CREATE
        await workSubmissionService.createWorkSubmission(payload);
        showToast('Submission created', 'success');
      }

      setDialogOpen(false);
      loadData(); // Refresh list

    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save submission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status, type) => {
    if (type === 'draft') return 'default';
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'revision_requested': return 'warning';
      case 'pending': return 'info';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status, type) => {
    if (type === 'draft') return 'Draft';
    // Capitalize status
    return status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Submitted';
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      <Box component="main" sx={{ 
        flexGrow: 1, 
        ml: isMobile ? 0 : '260px', 
        mt: '72px', 
        width: isMobile ? '100%' : 'calc(100% - 260px)', 
        minHeight: 'calc(100vh - 72px)', 
        bgcolor: '#f8f9fa', 
        p: { xs: 2, md: 4 } 
      }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
             <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student/my-applications')}>
               Back
             </Button>
             <Box flex={1}>
               <Typography variant="h5" fontWeight={700}>{campaign?.title}</Typography>
               <Typography variant="caption" color="textSecondary">{campaign?.campaign_category}</Typography>
             </Box>
          </Stack>

          {/* Campaign Guidelines (Brief) */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
             <Typography variant="h6" fontWeight={600} gutterBottom>Requirements & Guidelines</Typography>
             <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
               {campaign?.content_guidelines || 'No content guidelines.'}
             </Typography>
             {campaign?.caption_guidelines && (
                <Box sx={{ bgcolor: '#f1f5f9', p: 2, borderRadius: 1 }}>
                   <Typography variant="subtitle2" gutterBottom>Caption Guidelines:</Typography>
                   <Typography variant="body2">{campaign.caption_guidelines}</Typography>
                </Box>
             )}
          </Paper>

          {/* Submissions Section */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography variant="h6" fontWeight={700}>My Submissions</Typography>
             <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#6E00BE' }}>
               New Submission
             </Button>
          </Stack>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                   <TableCell fontWeight={600}>Date</TableCell>
                   <TableCell fontWeight={600}>Platform</TableCell>
                   <TableCell fontWeight={600}>Type</TableCell>
                   <TableCell fontWeight={600}>Caption</TableCell>
                   <TableCell fontWeight={600}>Hashtags</TableCell>
                   <TableCell fontWeight={600}>Link</TableCell>
                   <TableCell fontWeight={600}>Status</TableCell>
                   <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                       No submissions yet. Create one to get started!
                     </TableCell>
                   </TableRow>
                ) : (
                   submissions.map((sub) => (
                     <TableRow key={sub.submission_id || sub.id}>
                       <TableCell>{new Date(sub.created_at || Date.now()).toLocaleDateString()}</TableCell>
                       <TableCell sx={{ textTransform: 'capitalize' }}>{sub.platform}</TableCell>
                       <TableCell sx={{ textTransform: 'capitalize' }}>{sub.content_type}</TableCell>
                       <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {sub.caption}
                       </TableCell>
                       <TableCell sx={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {Array.isArray(sub.hashtags) ? sub.hashtags.join(', ') : sub.hashtags}
                       </TableCell>
                       <TableCell>
                         {sub.content_url ? (
                           <a href={sub.content_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6E00BE', textDecoration: 'none' }}>
                             View <LaunchIcon fontSize="inherit" />
                           </a>
                         ) : '-'}
                       </TableCell>
                       <TableCell>
                          <Chip 
                            label={getStatusLabel(sub.status, sub.submission_type)}
                            color={getStatusColor(sub.status, sub.submission_type)}
                            size="small"
                          />
                          {(sub.status === 'rejected' || sub.status === 'revision_requested') && sub.review_notes && (
                             <Tooltip title={sub.review_notes}>
                                <IconButton size="small" color="error"><InfoIcon fontSize="small" /></IconButton>
                             </Tooltip>
                          )}
                       </TableCell>
                       <TableCell align="right">
                          {/* Allow Edit if Draft, Revision Requested, or PENDING */}
                          {(sub.submission_type === 'draft' || sub.status === 'revision_requested' || sub.status === 'pending') ? (
                             <Button 
                               startIcon={<EditIcon />} 
                               size="small" 
                               onClick={() => handleOpenEdit(sub)}
                             >
                               Edit
                             </Button>
                          ) : (
                             <Button 
                               startIcon={<VisibilityIcon />} 
                               size="small" 
                               onClick={() => handleOpenView(sub)} 
                             >
                               View
                             </Button>
                          )}
                       </TableCell>
                     </TableRow>
                   ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

        </Container>
      </Box>

      {/* Submission Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
         <DialogTitle>
            {viewMode ? 'View Submission' : (editMode ? 'Edit Submission' : 'Create New Submission')}
            <IconButton
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
         </DialogTitle>
         <DialogContent dividers>
           {/* Feedback Alert for Students (Read Only) */}
           {selectedSubmission && (selectedSubmission.status !== 'pending' && selectedSubmission.submission_type !== 'draft') && (
              <Alert severity={selectedSubmission.status === 'approved' ? 'success' : 'warning'} sx={{ mb: 3 }}>
                 <Typography variant="subtitle2" fontWeight={700}>
                    Status: {getStatusLabel(selectedSubmission.status, selectedSubmission.submission_type)}
                 </Typography>
                 {selectedSubmission.review_notes && (
                    <Typography variant="body2" mt={1}>
                       <strong>Feedback:</strong> {selectedSubmission.review_notes}
                    </Typography>
                 )}
              </Alert>
           )}

           <Stack spacing={3} sx={{ mt: 1 }}>
             <Grid container spacing={2}>
               <Grid item xs={6}>
                 <FormControl fullWidth disabled={viewMode}>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      name="content_type"
                      value={formData.content_type}
                      label="Content Type"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="post">Instagram Feed Post</MenuItem>
                      <MenuItem value="story">Instagram Story</MenuItem>
                      <MenuItem value="reel">Instagram Reel</MenuItem>
                      <MenuItem value="tiktok">TikTok Video</MenuItem>
                    </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={6}>
                 <FormControl fullWidth disabled={viewMode}>
                    <InputLabel>Platform</InputLabel>
                    <Select
                      name="platform"
                      value={formData.platform}
                      label="Platform"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="instagram">Instagram</MenuItem>
                      <MenuItem value="tiktok">TikTok</MenuItem>
                      <MenuItem value="youtube">YouTube</MenuItem>
                    </Select>
                 </FormControl>
               </Grid>
             </Grid>

             <TextField
                label="Content URL"
                name="content_url"
                value={formData.content_url}
                onChange={handleInputChange}
                fullWidth
                placeholder="https://..."
                helperText="Link to your draft or published content"
                disabled={viewMode}
             />

             <TextField
                label="Caption"
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                disabled={viewMode}
             />

             <TextField
                label="Hashtags"
                name="hashtags"
                value={formData.hashtags}
                onChange={handleInputChange}
                fullWidth
                placeholder="#campaign #brand"
                helperText="Space separated"
                disabled={viewMode}
             />

             <TextField
                label="Notes"
                name="submission_notes"
                value={formData.submission_notes}
                onChange={handleInputChange}
                multiline
                rows={2}
                fullWidth
                disabled={viewMode}
             />
           </Stack>
         </DialogContent>
         <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              {viewMode ? 'Close' : 'Cancel'}
            </Button>
            
            {!viewMode && (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => handleSave('draft')}
                  disabled={submitting}
                >
                  Save as Draft
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => handleSave('final')}
                  disabled={submitting}
                  sx={{ bgcolor: '#6E00BE' }}
                >
                  Submit Final
                </Button>
              </>
            )}
         </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignWorkPage;
