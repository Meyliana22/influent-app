import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as RevisionIcon,
  ArrowBack as BackIcon,
  Instagram as InstagramIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  PlayCircle as PlayIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { COLORS } from '../../constants/colors';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import workSubmissionService from '../../services/workSubmissionService';
import campaignService from '../../services/campaignService';
import { useToast } from '../../hooks/useToast';

/**
 * ReviewSubmissions Page
 * UMKM can review student work submissions and approve/reject/request revision
 */
const ReviewSubmissions = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  // Use custom toast hook if available, otherwise toast from react-toastify
  const { showToast } = useToast(); 

  const [submissions, setSubmissions] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, action: null });
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, revision_requested

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load campaign details
      const campaignData = await campaignService.getCampaignById(campaignId);
      setCampaign(campaignData.data || campaignData);
      
      // Load work submissions
      const submissionsRes = await workSubmissionService.getCampaignSubmissions(campaignId);
      const submissionsData = submissionsRes.data || submissionsRes || [];
      
      setSubmissions(submissionsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      showToast ? showToast('Gagal memuat data submissions', 'error') : toast.error('Gagal memuat data submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewModal = (submission, action) => {
    setSelectedSubmission(submission);
    setReviewModal({ open: true, action });
    setReviewNotes('');
  };

  const handleCloseReviewModal = () => {
    setReviewModal({ open: false, action: null });
    setSelectedSubmission(null);
    setReviewNotes('');
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;

    // Identify ID
    const subId = selectedSubmission.submission_id || selectedSubmission.id;

    try {
      setIsLoading(true);
      
      switch (reviewModal.action) {
        case 'approve':
          await workSubmissionService.approveSubmission(subId, reviewNotes);
          showToast ? showToast('Submission disetujui!', 'success') : toast.success('Submission disetujui!');
          break;
        case 'reject':
          if (!reviewNotes.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
          }
          await workSubmissionService.rejectSubmission(subId, reviewNotes);
          showToast ? showToast('Submission ditolak', 'warning') : toast.warning('Submission ditolak');
          break;
        case 'revision':
          if (!reviewNotes.trim()) {
            toast.error('Catatan revisi harus diisi');
            return;
          }
          await workSubmissionService.requestRevision(subId, reviewNotes);
          showToast ? showToast('Request revisi dikirim', 'info') : toast.info('Request revisi dikirim');
          break;
        default:
          break;
      }
      
      await loadData();
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast ? showToast('Gagal melakukan review', 'error') : toast.error('Gagal melakukan review');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      revision_requested: 'info',
      draft: 'default',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredSubmissions = Array.isArray(submissions) 
    ? submissions.filter(sub => {
        // Exclude drafts from Company view usually, but if needed show them different
        if (sub.submission_type === 'draft') return false; 
        
        if (filter === 'all') return true;
        return sub.status === filter;
      })
    : [];

  if (isLoading && !campaign) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <UMKMSidebar />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <UMKMTopbar />
        <Box sx={{ mt: '72px', bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 72px)', overflowY: 'auto' }}>
          <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <IconButton 
                onClick={() => navigate('/umkm/campaigns')}
                sx={{ 
                  bgcolor: COLORS.white, 
                  '&:hover': { bgcolor: '#f0f0f0' },
                  boxShadow: 2
                }}
              >
                <BackIcon />
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                  Review Submissions
                </Typography>
                <Typography variant="body1" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
                  {campaign?.title || 'Loading...'}
                </Typography>
              </Box>
            </Stack>

            {/* Stats Overview */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 32, color: '#ed6c02', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {submissions.filter(s => s.status === 'pending' && s.submission_type !== 'draft').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                    Pending Review
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <ApproveIcon sx={{ fontSize: 32, color: '#2e7d32', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {submissions.filter(s => s.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                    Approved
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <RevisionIcon sx={{ fontSize: 32, color: '#0288d1', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {submissions.filter(s => s.status === 'revision_requested').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                    Revision Requested
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <RejectIcon sx={{ fontSize: 32, color: '#d32f2f', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {submissions.filter(s => s.status === 'rejected').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                    Rejected
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Filter Tabs */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {['all', 'pending', 'approved', 'revision_requested', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'contained' : 'outlined'}
                  onClick={() => setFilter(status)}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'capitalize',
                    bgcolor: filter === status ? '#667eea' : 'transparent',
                    borderColor: '#667eea',
                    color: filter === status ? '#fff' : '#667eea',
                    '&:hover': { 
                      bgcolor: filter === status ? '#5568d3' : 'rgba(102, 126, 234, 0.08)',
                      borderColor: '#667eea'
                    }
                  }}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </Stack>

            {/* Submissions List */}
            {filteredSubmissions.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <DescriptionIcon sx={{ fontSize: 64, color: COLORS.textSecondary, mb: 2 }} />
                <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1, fontWeight: 600 }}>
                  No submissions found
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredSubmissions.map((submission) => {
                   const student = submission.CampaignUser?.Student?.user || submission.student?.user || {};
                   const studentProfile = submission.CampaignUser?.Student || submission.student || {};
                   return (
                    <Card 
                      key={submission.submission_id || submission.id}
                      elevation={0}
                      sx={{ 
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3,
                          borderColor: '#bdbdbd'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                        {/* Media Preview */}
                        {submission.content_url && (
                          <Box 
                            sx={{ 
                              width: { xs: '100%', md: 280 }, 
                              height: { xs: 200, md: 'auto' },
                              minHeight: { md: 200 },
                              position: 'relative',
                              bgcolor: '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {/* Simple visual fallback if not playable direct */}
                            <PlayIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
                          </Box>
                        )}
    
                        {/* Content */}
                        <Box sx={{ flex: 1, p: 3 }}>
                          {/* Student Info & Status */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar src={student.profile_picture} sx={{ bgcolor: '#667eea' }}>
                                {student.name?.[0]?.toUpperCase() || 'S'}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                                  {student.name || 'Unknown Student'}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <InstagramIcon sx={{ fontSize: 16, color: COLORS.textSecondary }} />
                                  <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                                    {studentProfile.instagram_username || 'N/A'}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>
                            <Chip 
                              label={getStatusLabel(submission.status)}
                              color={getStatusColor(submission.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Stack>
    
                          {/* Submission Date & Platform */}
                          <Stack direction="row" spacing={2} mb={2}>
                              <Typography variant="body2" sx={{ color: COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ScheduleIcon sx={{ fontSize: 16 }} />
                                {new Date(submission.created_at).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize', color: COLORS.textSecondary }}>
                                Platform: <b>{submission.platform}</b>
                              </Typography>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize', color: COLORS.textSecondary }}>
                                Type: <b>{submission.content_type}</b>
                              </Typography>
                          </Stack>

                          {/* Link */}
                          <Typography variant="body2" sx={{ mb: 2 }}>
                             Link: <a href={submission.content_url} target="_blank" rel="noopener noreferrer">{submission.content_url}</a>
                          </Typography>
    
                          {/* Caption */}
                          {submission.caption && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '3px solid #667eea' }}>
                              <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontStyle: 'italic', lineHeight: 1.6 }}>
                                "{submission.caption}"
                              </Typography>
                            </Box>
                          )}

                          {/* Hashtags */}
                          {submission.hashtags && (
                             <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                                {Array.isArray(submission.hashtags) ? submission.hashtags.map(t => `#${t}`).join(' ') : submission.hashtags}
                             </Typography>
                          )}
    
                          {/* Review Notes */}
                          {submission.review_notes && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: '#fff9e6', borderRadius: 1, borderLeft: '3px solid #ffa726' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Review Notes
                              </Typography>
                              <Typography variant="body2" sx={{ color: COLORS.textPrimary, mt: 0.5, lineHeight: 1.6 }}>
                                {submission.review_notes}
                              </Typography>
                            </Box>
                          )}
    
                          {/* Actions */}
                          {submission.status === 'pending' && (
                            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                              <Button
                                variant="contained"
                                size="medium"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleOpenReviewModal(submission, 'approve')}
                                color="success"
                                sx={{ color: '#fff' }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<RevisionIcon />}
                                onClick={() => handleOpenReviewModal(submission, 'revision')}
                                color="info"
                              >
                                Request Revision
                              </Button>
                              <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<RejectIcon />}
                                onClick={() => handleOpenReviewModal(submission, 'reject')}
                                color="error"
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </Card>
                   );
                })}
              </Stack>
            )}
          </Container>
        </Box>
      </Box>

      {/* Review Modal */}
      <Dialog 
        open={reviewModal.open} 
        onClose={handleCloseReviewModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {reviewModal.action === 'approve' && 'Approve Submission'}
          {reviewModal.action === 'reject' && 'Reject Submission'}
          {reviewModal.action === 'revision' && 'Request Revision'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: COLORS.textSecondary }}>
             {reviewModal.action === 'approve' && 'Approved submissions will notify the student.'}
             {reviewModal.action === 'reject' && 'Please provide a reason for the rejection.'}
             {reviewModal.action === 'revision' && 'Please provide details on what needs to be revised.'}
          </Typography>
          
          {(reviewModal.action === 'reject' || reviewModal.action === 'revision') && (
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label={reviewModal.action === 'revision' ? "Revision Notes" : "Rejection Reason"}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                sx={{ mt: 1 }}
              />
          )}

          {reviewModal.action === 'approve' && (
             <TextField
               fullWidth
               multiline
               rows={2}
               label="Optional Notes"
               value={reviewNotes}
               onChange={(e) => setReviewNotes(e.target.value)}
               sx={{ mt: 1 }}
             />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseReviewModal}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmitReview}
            disabled={
              (reviewModal.action === 'reject' || reviewModal.action === 'revision') && 
              !reviewNotes.trim()
            }
            color={
              reviewModal.action === 'approve' ? 'success' :
              reviewModal.action === 'reject' ? 'error' : 'info'
            }
            sx={{ color: '#fff' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewSubmissions;
