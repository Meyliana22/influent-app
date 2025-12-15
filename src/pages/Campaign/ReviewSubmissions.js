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
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as RevisionIcon,
  ArrowBack as BackIcon,
  Instagram as InstagramIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { COLORS } from '../../constants/colors';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import workSubmissionService from '../../services/workSubmissionService';
import campaignService from '../../services/campaignService';
import Loading from '../../components/common/Loading';

/**
 * ReviewSubmissions Page
 * UMKM can review student work submissions and approve/reject/request revision
 */
const ReviewSubmissions = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

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
  }, [campaignId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load campaign details
      const campaignData = await campaignService.getCampaignById(campaignId);
      setCampaign(campaignData);
      
      // Load work submissions
      let submissionsData = [];
      try {
        submissionsData = await workSubmissionService.getCampaignSubmissions(campaignId);
      } catch (error) {
        console.log('Using dummy submissions data');
      }
      
      setSubmissions(submissionsData);
      
      // BACKUP: Old dummy data kept for reference
      const oldDummySubmissions = [
        {
          id: 1,
          campaign_id: parseInt(campaignId),
          student_id: 140,
          student: {
            id: 140,
            user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
            instagram_username: '@sarah_beauty',
            follower_count: 15000
          },
          content_url: 'https://picsum.photos/400/500',
          caption: 'Loving this amazing product! ✨ The quality is outstanding and I highly recommend it to all my followers. #beauty #skincare #sponsored',
          content_type: 'foto',
          submission_status: 'pending',
          submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          reviewed_by_umkm_at: null,
          review_notes: null
        },
        {
          id: 2,
          campaign_id: parseInt(campaignId),
          student_id: 141,
          student: {
            id: 141,
            user: { name: 'David Martinez', email: 'david@example.com' },
            instagram_username: '@david_gaming',
            follower_count: 25000
          },
          content_url: 'https://picsum.photos/400/501',
          caption: 'Check out this awesome new product! Perfect for gamers like me 🎮 #gaming #tech #partnership',
          content_type: 'reels',
          submission_status: 'approved',
          submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          reviewed_by_umkm_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
          review_notes: 'Konten bagus dan sesuai dengan brief! Terima kasih.'
        },
        {
          id: 3,
          campaign_id: parseInt(campaignId),
          student_id: 142,
          student: {
            id: 142,
            user: { name: 'Aisha Rahman', email: 'aisha@example.com' },
            instagram_username: '@aisha_food',
            follower_count: 18000
          },
          content_url: 'https://picsum.photos/400/502',
          caption: 'Delicious food experience! You guys should try this 🍔😍',
          content_type: 'foto',
          submission_status: 'revision_requested',
          submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          reviewed_by_umkm_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          review_notes: 'Caption perlu diperbaiki, tolong tambahkan informasi tentang promo yang sedang berlangsung.',
          revision_notes: 'Mohon update caption dengan menyebutkan promo buy 1 get 1 dan tambahkan hashtag #PromoSpesial'
        },
        {
          id: 4,
          campaign_id: parseInt(campaignId),
          student_id: 143,
          student: {
            id: 143,
            user: { name: 'Ryan Thompson', email: 'ryan@example.com' },
            instagram_username: '@ryan_fitness',
            follower_count: 30000
          },
          content_url: 'https://picsum.photos/400/503',
          caption: 'Get fit with this amazing supplement! 💪 #fitness #health',
          content_type: 'video',
          submission_status: 'pending',
          submitted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          reviewed_by_umkm_at: null,
          review_notes: null
        },
        {
          id: 5,
          campaign_id: parseInt(campaignId),
          student_id: 144,
          student: {
            id: 144,
            user: { name: 'Lisa Chen', email: 'lisa@example.com' },
            instagram_username: '@lisa_travel',
            follower_count: 22000
          },
          content_url: 'https://picsum.photos/400/504',
          caption: 'Perfect travel companion! This product made my trip so much easier 🌍✈️',
          content_type: 'story',
          submission_status: 'rejected',
          submitted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          reviewed_by_umkm_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          rejected_by_umkm_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          review_notes: 'Konten tidak sesuai dengan brief campaign. Produk tidak terlihat jelas dan caption tidak menyebutkan benefit produk.',
          umkm_rejection_notes: 'Maaf, konten kurang sesuai ekspektasi. Produk harus lebih prominent dan perlu highlight fitur utama.'
        }
      ];
      
      // Already set submissions above
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data submissions');
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

    try {
      setIsLoading(true);
      
      switch (reviewModal.action) {
        case 'approve':
          await workSubmissionService.approveSubmission(selectedSubmission.id, reviewNotes);
          toast.success('Submission berhasil disetujui! Dana akan dirilis ke student.');
          break;
        case 'reject':
          if (!reviewNotes.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
          }
          await workSubmissionService.rejectSubmission(selectedSubmission.id, reviewNotes);
          toast.warning('Submission ditolak. Admin akan mereview dalam 1 hari kerja.');
          break;
        case 'revision':
          if (!reviewNotes.trim()) {
            toast.error('Catatan revisi harus diisi');
            return;
          }
          await workSubmissionService.requestRevision(selectedSubmission.id, reviewNotes);
          toast.info('Request revisi telah dikirim ke student');
          break;
        default:
          break;
      }
      
      await loadData();
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Gagal melakukan review');
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
      under_review: 'default',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Menunggu Review',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      revision_requested: 'Perlu Revisi',
      under_review: 'Sedang Direview',
    };
    return labels[status] || status;
  };

  const filteredSubmissions = Array.isArray(submissions) 
    ? submissions.filter(sub => {
        if (filter === 'all') return true;
        return sub.submission_status === filter;
      })
    : [];

  if (isLoading && !campaign) {
    return <Loading />;
  }

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <UMKMSidebar />
      <Box sx={{ flex: 1, ml: isMobile ? 0 : 32.5, overflow: 'hidden' }}>
        <UMKMTopbar />
        <Box sx={{ mt: 9, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 72px)', overflow: 'hidden' }}>
          <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, flexGrow: 1 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <IconButton 
              onClick={() => navigate('/campaigns')}
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
                Review Hasil Konten
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
                <ScheduleIcon sx={{ fontSize: 32, color: '#78909c', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                  {Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'pending').length : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                  Menunggu Review
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <ApproveIcon sx={{ fontSize: 32, color: '#66bb6a', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                  {Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'approved').length : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                  Disetujui
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <RevisionIcon sx={{ fontSize: 32, color: '#42a5f5', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                  {Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'revision_requested').length : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                  Perlu Revisi
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <RejectIcon sx={{ fontSize: 32, color: '#ef5350', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                  {Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'rejected').length : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
                  Ditolak
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filter Tabs */}
          <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                bgcolor: filter === 'all' ? '#667eea' : 'transparent',
                borderColor: '#667eea',
                color: filter === 'all' ? '#fff' : '#667eea',
                '&:hover': { 
                  bgcolor: filter === 'all' ? '#5568d3' : 'rgba(102, 126, 234, 0.08)',
                  borderColor: '#667eea'
                }
              }}
            >
              Semua ({submissions.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'contained' : 'outlined'}
              onClick={() => setFilter('pending')}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                bgcolor: filter === 'pending' ? '#78909c' : 'transparent',
                borderColor: '#78909c',
                color: filter === 'pending' ? '#fff' : '#78909c',
                '&:hover': { 
                  bgcolor: filter === 'pending' ? '#607d8b' : 'rgba(120, 144, 156, 0.08)',
                  borderColor: '#78909c'
                }
              }}
            >
              Pending ({Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'pending').length : 0})
            </Button>
            <Button
              variant={filter === 'approved' ? 'contained' : 'outlined'}
              onClick={() => setFilter('approved')}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                bgcolor: filter === 'approved' ? '#66bb6a' : 'transparent',
                borderColor: '#66bb6a',
                color: filter === 'approved' ? '#fff' : '#66bb6a',
                '&:hover': { 
                  bgcolor: filter === 'approved' ? '#4caf50' : 'rgba(102, 187, 106, 0.08)',
                  borderColor: '#66bb6a'
                }
              }}
            >
              Disetujui ({Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'approved').length : 0})
            </Button>
            <Button
              variant={filter === 'revision_requested' ? 'contained' : 'outlined'}
              onClick={() => setFilter('revision_requested')}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                bgcolor: filter === 'revision_requested' ? '#42a5f5' : 'transparent',
                borderColor: '#42a5f5',
                color: filter === 'revision_requested' ? '#fff' : '#42a5f5',
                '&:hover': { 
                  bgcolor: filter === 'revision_requested' ? '#2196f3' : 'rgba(66, 165, 245, 0.08)',
                  borderColor: '#42a5f5'
                }
              }}
            >
              Perlu Revisi ({Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'revision_requested').length : 0})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'contained' : 'outlined'}
              onClick={() => setFilter('rejected')}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                bgcolor: filter === 'rejected' ? '#ef5350' : 'transparent',
                borderColor: '#ef5350',
                color: filter === 'rejected' ? '#fff' : '#ef5350',
                '&:hover': { 
                  bgcolor: filter === 'rejected' ? '#e53935' : 'rgba(239, 83, 80, 0.08)',
                  borderColor: '#ef5350'
                }
              }}
            >
              Ditolak ({Array.isArray(submissions) ? submissions.filter(s => s.submission_status === 'rejected').length : 0})
            </Button>
          </Stack>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: COLORS.textSecondary, mb: 2 }} />
              <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1, fontWeight: 600 }}>
                Belum Ada Submission
              </Typography>
              <Typography sx={{ color: COLORS.textSecondary }}>
                {filter === 'all' 
                  ? 'Student belum mengirimkan hasil konten untuk campaign ini'
                  : `Tidak ada submission dengan status "${getStatusLabel(filter)}"`
                }
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {filteredSubmissions.map((submission) => (
                <Card 
                  key={submission.id}
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
                          bgcolor: '#f5f5f5'
                        }}
                      >
                        {submission.content_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={submission.content_url}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={submission.content_url}
                            alt="Submission content"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Content */}
                    <Box sx={{ flex: 1, p: 3 }}>
                      {/* Student Info & Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
                            {submission.student?.user?.name?.[0]?.toUpperCase() || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                              {submission.student?.user?.name || 'Unknown Student'}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <InstagramIcon sx={{ fontSize: 16, color: COLORS.textSecondary }} />
                              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                                {submission.student?.instagram_username || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: COLORS.textSecondary, ml: 1 }}>
                                • {submission.student?.follower_count?.toLocaleString() || '0'} followers
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                        <Chip 
                          label={getStatusLabel(submission.submission_status)}
                          color={getStatusColor(submission.submission_status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>

                      {/* Submission Date */}
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 16 }} />
                        Submitted: {new Date(submission.submitted_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>

                      {/* Caption */}
                      {submission.caption && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '3px solid #667eea' }}>
                          <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontStyle: 'italic', lineHeight: 1.6 }}>
                            "{submission.caption}"
                          </Typography>
                        </Box>
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
                      {submission.submission_status === 'pending' && (
                        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            size="medium"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleOpenReviewModal(submission, 'approve')}
                            sx={{
                              bgcolor: '#66bb6a',
                              '&:hover': { bgcolor: '#4caf50' },
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<RevisionIcon />}
                            onClick={() => handleOpenReviewModal(submission, 'revision')}
                            sx={{
                              borderColor: '#42a5f5',
                              color: '#42a5f5',
                              '&:hover': { 
                                borderColor: '#2196f3',
                                bgcolor: 'rgba(66, 165, 245, 0.08)'
                              },
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3
                            }}
                          >
                            Request Revisi
                          </Button>
                          <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<RejectIcon />}
                            onClick={() => handleOpenReviewModal(submission, 'reject')}
                            sx={{
                              borderColor: '#ef5350',
                              color: '#ef5350',
                              '&:hover': { 
                                borderColor: '#e53935',
                                bgcolor: 'rgba(239, 83, 80, 0.08)'
                              },
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      )}

                      {submission.submission_status === 'revision_requested' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                            ⏳ Menunggu student melakukan revisi
                          </Typography>
                        </Box>
                      )}

                      {submission.submission_status === 'approved' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                            ✓ Submission telah disetujui
                          </Typography>
                        </Box>
                      )}

                      {submission.submission_status === 'rejected' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 600 }}>
                            ✕ Submission telah ditolak
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Card>
              ))}
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
          {reviewModal.action === 'approve' && (
            <Box>
              <Typography sx={{ mb: 2, color: COLORS.textSecondary }}>
                Dengan menyetujui submission ini, dana akan dirilis ke akun student dan status campaign akan berubah menjadi Completed.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Catatan (Opsional)"
                placeholder="Tambahkan catatan untuk student..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {reviewModal.action === 'reject' && (
            <Box>
              <Typography sx={{ mb: 2, color: '#c62828', fontWeight: 600 }}>
                ⚠️ Submission yang ditolak akan direview oleh Admin dalam 1 hari kerja
              </Typography>
              <Typography sx={{ mb: 2, color: COLORS.textSecondary }}>
                Jika Admin menyetujui penolakan Anda, student tidak akan menerima pembayaran. 
                Jika Admin menolak, Anda harus melakukan review ulang.
              </Typography>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Alasan Penolakan *"
                placeholder="Jelaskan mengapa submission ini ditolak..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                error={!reviewNotes.trim() && reviewModal.open}
                helperText="Alasan penolakan wajib diisi"
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {reviewModal.action === 'revision' && (
            <Box>
              <Typography sx={{ mb: 2, color: COLORS.textSecondary }}>
                Student akan menerima notifikasi untuk melakukan revisi sesuai catatan Anda.
              </Typography>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Catatan Revisi *"
                placeholder="Jelaskan apa yang perlu direvisi..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                error={!reviewNotes.trim() && reviewModal.open}
                helperText="Catatan revisi wajib diisi"
                sx={{ mt: 1 }}
              />
            </Box>
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
          >
            {reviewModal.action === 'approve' && 'Approve & Rilis Dana'}
            {reviewModal.action === 'reject' && 'Reject & Kirim ke Admin'}
            {reviewModal.action === 'revision' && 'Kirim Request Revisi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewSubmissions;
