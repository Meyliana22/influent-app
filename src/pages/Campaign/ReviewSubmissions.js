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
import workSubmissionService from '../../services/workSubmissionService';
import postSubmissionService from '../../services/postSubmissionService';
import campaignService from '../../services/campaignService';
import { useToast } from '../../hooks/useToast';
import { Sidebar, Topbar } from '../../components/common';

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
   const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, revision_requested
  const apiImage = process.env.REACT_APP_API_IMAGE_URL;
  const getProfileImage = (url) => {
    console.log(`${apiImage}/${url}`)
    return `${apiImage}/${url}`
  };

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
      


      // Enrich approved submissions with Post Submission data
      const enrichedSubmissions = await Promise.all(submissionsData.map(async (sub) => {
         if (sub.status === 'approved') {
             try {
                const postRes = await postSubmissionService.getByWorkSubmissionId(sub.id || sub.submission_id);
                // Check if postRes has data property (standard API response) or is the data itself
                const postData = postRes.data || postRes;
                
                if (postData && postData.id) {
                    return { ...sub, post_submission: postData };
                }
             } catch (e) {
                // No post submission yet
             }
         }
         return sub;
      }));

      setSubmissions(enrichedSubmissions);
      
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

  const handleVerifyPost = async (postSubId, status) => {
      try {
          setIsLoading(true);
          await postSubmissionService.verifySubmission(postSubId, status);
          showToast ? showToast(`Tautan ${status === 'verified' ? 'Terverifikasi' : 'Ditolak'}`, status === 'verified' ? 'success' : 'warning') 
                    : toast.success(`Tautan ${status === 'verified' ? 'Terverifikasi' : 'Ditolak'}`);
          loadData();
      } catch (error) {
          console.error("Verify post error", error);
          showToast ? showToast('Aksi gagal', 'error') : toast.error('Aksi gagal');
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



  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      case 'revision_requested': return 'Revisi Diminta';
      case 'verified': return 'Terverifikasi';
      case 'draft': return 'Draft';
      default: return status?.replace('_', ' ') || '-';
    }
  };

  const getStatusLabel = (status) => {
    return translateStatus(status);
  };

  const filteredSubmissions = Array.isArray(submissions) 
    ? submissions.filter(sub => {
        // Exclude drafts from Company view usually, but if needed show them different
        if (sub.submission_type === 'draft') return false; 
        
        if (filter === 'all') return true;
        return sub.status === filter;
      })
    : [];

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        ml: isMobile ? 0 : '260px', 
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content Area */}
        <Box sx={{ mt: '72px', bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 72px)', overflowY: 'auto' }}>
          
          {isLoading && !campaign ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 72px)' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
              {/* Header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <IconButton 
                  onClick={() => navigate('/campaigns/list')}
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
                    Tinjau Pengajuan
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
                      Menunggu Tinjauan
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
                      Disetujui
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
                      Revisi Diminta
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
                      Ditolak
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
                      bgcolor: filter === status ? '#6E00BE' : 'transparent',
                      borderColor: '#6E00BE',
                      color: filter === status ? '#fff' : '#6E00BE',
                      '&:hover': { 
                        bgcolor: filter === status ? '#5a009e' : 'rgba(110, 0, 190, 0.05)',
                        borderColor: '#6E00BE'
                      }
                    }}
                  >
                    {translateStatus(status)}
                  </Button>
                ))}
              </Stack>

              {/* Submissions List */}
              {filteredSubmissions.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 64, color: COLORS.textSecondary, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1, fontWeight: 600 }}>
                    Tidak ada pengajuan ditemukan
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {filteredSubmissions.map((submission) => {
                     // Check for 'User' (capitalized) which matches the provided JSON, fallback to 'user'
                     const student = submission.CampaignUser?.Student?.User || submission.CampaignUser?.Student?.user || submission.student?.user || {};
                     console.log(student)
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
                       
                          {/* {(submission.content_url || (submission.submission_content && submission.submission_content[0]?.url)) && (
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
                              <PlayIcon sx={{ fontSize: 48, color: '#bdbdbd' }} />
                            </Box>
                          )} */}
      
                        
                          <Box sx={{ flex: 1, p: 3 }}>
                            {/* Student Info & Status */}
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={getProfileImage(student.profile_image)} sx={{ bgcolor: '#6E00BE' }}>
                                  {student.name?.[0]?.toUpperCase() || 'S'}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                                  {/* <p>{student}</p> */}
                                  
                                    {student.name}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <InstagramIcon sx={{ fontSize: 16, color: COLORS.textSecondary }} />
                                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                                      {studentProfile.instagram_username || studentProfile.instagram || 'N/A'}
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
                            </Stack>

                            {/* Links List */}
                            <Box sx={{ mb: 2 }}>
                                {submission.submission_content && submission.submission_content.length > 0 ? (
                                   submission.submission_content.map((item, idx) => (
                                      <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                         <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{item.content_type}</span>: <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                                      </Typography>
                                   ))
                                ) : (
                                   submission.content_url && (
                                     <Typography variant="body2">
                                        Link: <a href={submission.content_url} target="_blank" rel="noopener noreferrer">{submission.content_url}</a>
                                     </Typography>
                                   )
                                )}
                            </Box>
      
                            {/* Caption */}
                            {submission.caption && (
                              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '3px solid #6E00BE' }}>
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
                                  Catatan Review
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
                                  Setujui
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="medium"
                                  startIcon={<RevisionIcon />}
                                  onClick={() => handleOpenReviewModal(submission, 'revision')}
                                  color="info"
                                >
                                  Minta Revisi
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="medium"
                                  startIcon={<RejectIcon />}
                                  onClick={() => handleOpenReviewModal(submission, 'reject')}
                                  color="error"
                                >
                                  Tolak
                                </Button>
                              </Stack>
                            )}
                            
                            {/* Approved & Post Submission Verification */}
                            {submission.status === 'approved' && (
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e0e0e0' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                        Verifikasi Tautan Postingan
                                    </Typography>
                                    {submission.post_submission ? (
                                        <Box>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                                <Typography variant="body2">
                                                    Link: 
                                                    <a href={submission.post_submission.post_link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: '#6E00BE', fontWeight: 600 }}>
                                                        {submission.post_submission.post_link}
                                                    </a>
                                                </Typography>
                                                <Chip 
                                                    label={submission.post_submission.status === 'pending' ? 'Menunggu' : submission.post_submission.status === 'rejected' ? 'Ditolak' : 'Terverifikasi'} 
                                                    color={submission.post_submission.status === 'pending' ? 'warning' : submission.post_submission.status === 'rejected' ? 'error' : 'success'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                            
                                            {submission.post_submission.status === 'pending' && (
                                                <Stack direction="row" spacing={2}>
                                                    <Button 
                                                        variant="contained" 
                                                        color="success" 
                                                        size="small"
                                                        onClick={() => handleVerifyPost(submission.post_submission.id, 'verified')}
                                                    >
                                                        Verifikasi Tautan
                                                    </Button>
                                                    <Button 
                                                        variant="outlined" 
                                                        color="error" 
                                                        size="small"
                                                        onClick={() => handleVerifyPost(submission.post_submission.id, 'rejected')}
                                                    >
                                                        Tolak Tautan
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                            Siswa belum mengirimkan tautan postingan.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                          </Box>
                        </Box>
                      </Card>
                     );
                  })}
                </Stack>
              )}
            </Container>
          )} 
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
          {reviewModal.action === 'approve' && 'Setujui Pengajuan'}
          {reviewModal.action === 'reject' && 'Tolak Pengajuan'}
          {reviewModal.action === 'revision' && 'Minta Revisi'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: COLORS.textSecondary }}>
             {reviewModal.action === 'approve' && 'Pengajuan yang disetujui akan menotifikasi siswa.'}
             {reviewModal.action === 'reject' && 'Mohon berikan alasan penolakan.'}
             {reviewModal.action === 'revision' && 'Mohon berikan detail revisi.'}
          </Typography>
          
          {(reviewModal.action === 'reject' || reviewModal.action === 'revision') && (
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label={reviewModal.action === 'revision' ? "Catatan Revisi" : "Alasan Penolakan"}
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
               label="Catatan Opsional"
               value={reviewNotes}
               onChange={(e) => setReviewNotes(e.target.value)}
               sx={{ mt: 1 }}
             />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseReviewModal}>
            Batal
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
            Konfirmasi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewSubmissions;
