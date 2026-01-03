import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircleOutline as ApproveIcon,
  CancelOutlined as RejectIcon,
  VisibilityOutlined as ViewIcon,
  AssignmentOutlined as AssignmentIcon,
  ScheduleOutlined as ScheduleIcon,
  BusinessOutlined as BusinessIcon,
  PersonOutline as PersonIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { COLORS } from '../../constants/colors';
import { Sidebar, Topbar } from '../../components/common';
import Loading from '../../components/common/Loading';
import workSubmissionService from '../../services/workSubmissionService';

/**
 * AdminReviewSubmissions Page
 * Admin reviews UMKM-rejected submissions within 1 business day
 */
const AdminReviewSubmissions = () => {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, action: null });
  const [reviewNotes, setReviewNotes] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 1000;
        setIsMobile(mobile);
        setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await workSubmissionService.getRejectedSubmissions();
      // Handle response with data property or direct array
      const data = response?.data || response;
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Gagal memuat data Pekerjaan');
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
      
      if (reviewModal.action === 'approve_rejection') {
        // Admin approves UMKM's rejection - student doesn't get paid
        await workSubmissionService.adminRejectRejection(selectedSubmission.submission_id, reviewNotes);
        toast.success('Penolakan UMKM disetujui. Student tidak menerima pembayaran.');
      } else if (reviewModal.action === 'reject_rejection') {
        // Admin rejects UMKM's rejection - send back to UMKM for re-review
        await workSubmissionService.adminRejectRejection(selectedSubmission.submission_id, reviewNotes);
        toast.info('Penolakan UMKM ditolak. Pekerjaan dikembalikan ke UMKM untuk tinjauan ulang.');
      }
      
      await loadData();
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Gagal melakukan tinjauan');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeSinceRejection = (rejectedAt) => {
    if (!rejectedAt) return { text: '-', isUrgent: false };
    const now = new Date();
    const rejected = new Date(rejectedAt);
    const diffHours = Math.floor((now - rejected) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return { text: `${diffHours} jam yang lalu`, isUrgent: diffHours > 20 };
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return { text: `${diffDays} hari yang lalu`, isUrgent: diffDays >= 1 };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter submissions based on status from API
  const pendingSubmissions = submissions.filter(s => s.status === 'rejected');
  const reviewedSubmissions = submissions.filter(s => 
    s.status === 'admin_approved' || 
    s.status === 'admin_rejected'
  );

  // if (isLoading && submissions.length === 0) {
  //   return <Loading />;
  // }

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ 
          flex: 1, 
          ml: !isMobile ? '260px' : 0, 
          width: !isMobile ? 'calc(100% - 260px)' : '100%',
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
      }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Box sx={{ mt: 9, bgcolor: '#f8f9fa', minHeight: 'calc(100vh - 72px)' }}>
          <Container maxWidth="xl" sx={{ py: 4, px: 4, flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
              Tinjauan Penolakan Pekerjaan
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.textSecondary }}>
              Tinjau pekerjaan yang ditolak oleh UMKM dalam 1 hari kerja
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 2.5,
            mb: 4
          }}>
            {[
              {
                title: 'Menunggu Tinjauan',
                value: pendingSubmissions.length,
                icon: AssignmentIcon,
                color: '#e65100',
                bgColor: '#fff3e0',
                description: 'Perlu tindakan'
              },
              {
                title: 'Penolakan Disetujui',
                value: reviewedSubmissions.filter(s => s.status === 'admin_approved').length,
                icon: ApproveIcon,
                color: '#2e7d32',
                bgColor: '#e8f5e9',
                description: 'Selesai diproses'
              },
              {
                title: 'Dikembalikan',
                value: reviewedSubmissions.filter(s => s.status === 'admin_rejected').length,
                icon: RejectIcon,
                color: '#1565c0',
                bgColor: '#e3f2fd',
                description: 'Ke UMKM'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Box
                  key={index}
                  sx={{
                    background: '#fff',
                    borderRadius: 5,
                    p: 3,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    minWidth: 0,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    boxShadow: 0,
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{
                    width: 45,
                    height: 45,
                    borderRadius: 2,
                    bgcolor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon sx={{ fontSize: 25, color: stat.color }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5, fontFamily: "'Inter', sans-serif" }}>
                      {stat.title}
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36', fontFamily: "'Inter', sans-serif" }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#a0aec0', fontFamily: "'Inter', sans-serif" }}>
                      {stat.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Menunggu Tinjauan (${pendingSubmissions.length})`} />
              <Tab label={`Sudah Di Tinjau (${reviewedSubmissions.length})`} />
            </Tabs>
          </Paper>

          {/* Pending Review Tab */}
          {tabValue === 0 && (
            <>
              {pendingSubmissions.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 64, color: COLORS.textSecondary, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1 }}>
                    Tidak Ada Pekerjaan yang Perlu Ditinjau
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary }}>
                    Semua Pekerjaan UMKM sudah ditinjau
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {pendingSubmissions.map((submission) => {
                    const timeInfo = getTimeSinceRejection(submission.reviewed_at);
                    const campaign = submission.CampaignUser?.campaign || {};
                    const student = submission.CampaignUser?.user || {};
                    
                    return (
                      <Grid item xs={12} key={submission.submission_id}>
                        <Card 
                          sx={{ 
                            border: timeInfo.isUrgent ? '2px solid #c62828' : 'none',
                            boxShadow: timeInfo.isUrgent ? 4 : 2
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={3}>
                              {/* Left: Media */}
                              <Grid item xs={12} md={4}>
                                {submission.content_url ? (
                                  <Box
                                    component="img"
                                    src={submission.content_url}
                                    alt="Pekerjaan"
                                    sx={{
                                      width: '100%',
                                      height: 250,
                                      objectFit: 'cover',
                                      borderRadius: 2,
                                      bgcolor: '#f5f5f5'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: 250,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: '#f5f5f5',
                                      borderRadius: 2
                                    }}
                                  >
                                    <Typography sx={{ color: COLORS.textSecondary }}>
                                      Tidak Ada Gambar
                                    </Typography>
                                  </Box>
                                )}
                                {timeInfo.isUrgent && (
                                  <Chip
                                    label="⚠️ UI: MENDESAK - Mendekati Tenggat Waktu"
                                    color="error"
                                    size="small"
                                    sx={{ mt: 1, fontWeight: 600 }}
                                  />
                                )}
                                
                                {/* Additional Info */}
                                <Box sx={{ mt: 2 }}>
                                  <Chip 
                                    label={`#${submission.submission_id}`}
                                    size="small"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                  <Chip 
                                    label={submission.platform}
                                    size="small"
                                    color="primary"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                  <Chip 
                                    label={submission.content_type}
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                </Box>
                              </Grid>

                              {/* Right: Details */}
                              <Grid item xs={12} md={8}>
                                <Stack spacing={2}>
                                  {/* Campaign & Time */}
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                      {campaign.title || 'Tanpa Judul Kampanye'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                      <Chip 
                                        icon={<ScheduleIcon />}
                                        label={`Ditolak: ${timeInfo.text}`}
                                        size="small"
                                        color={timeInfo.isUrgent ? 'error' : 'default'}
                                      />
                                      <Chip 
                                        label={`Status: ${submission.status}`}
                                        size="small"
                                        color="error"
                                      />
                                      <Chip 
                                        icon={<PersonIcon />}
                                        label={student.name || 'Siswa Tidak Diketahui'}
                                        size="small"
                                      />
                                      {campaign.campaign_category && (
                                        <Chip 
                                          label={campaign.campaign_category}
                                          size="small"
                                          variant="outlined"
                                        />
                                      )}
                                    </Stack>
                                  </Box>

                                  <Divider />

                                  {/* Submission Info */}
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                        Diajukan Pada
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatDate(submission.submitted_at)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                        Ditinjau Pada
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatDate(submission.reviewed_at)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                        Harga per Post
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                                        Rp {parseInt(campaign.price_per_post || 0).toLocaleString('id-ID')}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                        Email Siswa
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {student.email || '-'}
                                      </Typography>
                                    </Grid>
                                  </Grid>

                                  {/* Caption */}
                                  {submission.caption && (
                                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary }}>
                                        Caption:
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                        "{submission.caption}"
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* Hashtags */}
                                  {submission.hashtags && submission.hashtags.length > 0 && (
                                    <Box>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary }}>
                                        Hashtags:
                                      </Typography>
                                      <Box sx={{ mt: 0.5 }}>
                                        {submission.hashtags.map((tag, idx) => (
                                          <Chip 
                                            key={idx}
                                            label={`#${tag}`}
                                            size="small"
                                            sx={{ mr: 0.5, mb: 0.5 }}
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                  )}

                                  {/* Submission Notes */}
                                  {submission.submission_notes && (
                                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary }}>
                                        Catatan Siswa:
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {submission.submission_notes}
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* Review Notes */}
                                  {submission.review_notes && (
                                    <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ef5350' }}>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#c62828' }}>
                                        Catatan Tinjauan:
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.textPrimary }}>
                                        {submission.review_notes}
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* Action Buttons */}
                                  <Stack direction="row" spacing={2}>
                                    <Button
                                      variant="contained"
                                      color="error"
                                      startIcon={<ApproveIcon />}
                                      onClick={() => handleOpenReviewModal(submission, 'approve_rejection')}
                                      fullWidth
                                    >
                                      Setujui Penolakan UMKM
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<RejectIcon />}
                                      onClick={() => handleOpenReviewModal(submission, 'reject_rejection')}
                                      fullWidth
                                    >
                                      Tolak & Kembalikan ke UMKM
                                    </Button>
                                  </Stack>
                                </Stack>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
          )}

          {/* Reviewed Tab */}
          {tabValue === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Kampanye</strong></TableCell>
                    <TableCell><strong>Siswa</strong></TableCell>
                    <TableCell><strong>UMKM</strong></TableCell>
                    <TableCell><strong>Keputusan Admin</strong></TableCell>
                    <TableCell><strong>Ditinjau Pada</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviewedSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: COLORS.textSecondary }}>
                          Belum ada pekerjaan yang ditinjau
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviewedSubmissions.map((submission) => {
                      const campaign = submission.CampaignUser?.campaign || {};
                      const student = submission.CampaignUser?.user || {};
                      
                      return (
                        <TableRow key={submission.submission_id}>
                          <TableCell>{campaign.title || 'N/A'}</TableCell>
                          <TableCell>{student.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={`#${submission.submission_id}`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                submission.status === 'admin_approved'
                                  ? 'Penolakan Disetujui'
                                  : submission.status === 'admin_rejected'
                                  ? 'Dikembalikan ke UMKM'
                                  : submission.status
                              }
                              color={
                                submission.status === 'admin_approved'
                                  ? 'error'
                                  : 'info'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(submission.reviewed_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
          {reviewModal.action === 'approve_rejection' && 'Setujui Penolakan UMKM'}
          {reviewModal.action === 'reject_rejection' && 'Tolak Penolakan & Kembalikan ke UMKM'}
        </DialogTitle>
        <DialogContent>
          {reviewModal.action === 'approve_rejection' && (
            <Box>
              <Typography sx={{ mb: 2, color: '#c62828', fontWeight: 600 }}>
                ⚠️ Dengan menyetujui penolakan UMKM:
              </Typography>
              <ul style={{ color: COLORS.textSecondary, marginLeft: 20 }}>
                <li>Student tidak akan menerima pembayaran</li>
                <li>Status pekerjaan: Failed Job</li>
                <li>Dana dikembalikan ke UMKM</li>
              </ul>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Catatan untuk Student & UMKM"
                placeholder="Jelaskan keputusan admin..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {reviewModal.action === 'reject_rejection' && (
            <Box>
              <Typography sx={{ mb: 2, color: '#1565c0', fontWeight: 600 }}>
                ℹ️ Dengan menolak penolakan UMKM:
              </Typography>
              <ul style={{ color: COLORS.textSecondary, marginLeft: 20 }}>
                <li>Pekerjaan dikembalikan ke UMKM untuk tinjauan ulang</li>
                <li>UMKM harus melakukan peninjauan ulang</li>
                <li>Student masih berpeluang mendapat pembayaran</li>
              </ul>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Catatan untuk UMKM"
                placeholder="Jelaskan mengapa penolakan tidak dapat diterima..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                sx={{ mt: 2 }}
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
            color={reviewModal.action === 'approve_rejection' ? 'error' : 'primary'}
          >
            {reviewModal.action === 'approve_rejection' && 'Setujui Penolakan'}
            {reviewModal.action === 'reject_rejection' && 'Kembalikan ke UMKM'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReviewSubmissions;
