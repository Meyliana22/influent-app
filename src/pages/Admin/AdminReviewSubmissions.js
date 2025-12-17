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
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
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
      const data = await workSubmissionService.getRejectedSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading submissions:', error);
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
      
      if (reviewModal.action === 'approve_rejection') {
        // Admin approves UMKM's rejection - student doesn't get paid
        // TODO: API call
        // await workSubmissionService.adminApproveRejection(selectedSubmission.id, reviewNotes);
        toast.success('Penolakan UMKM disetujui. Student tidak menerima pembayaran.');
      } else if (reviewModal.action === 'reject_rejection') {
        // Admin rejects UMKM's rejection - send back to UMKM for re-review
        // TODO: API call
        // await workSubmissionService.adminRejectRejection(selectedSubmission.id, reviewNotes);
        toast.info('Penolakan UMKM ditolak. Submission dikembalikan ke UMKM untuk review ulang.');
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

  const getTimeSinceRejection = (rejectedAt) => {
    const now = new Date();
    const rejected = new Date(rejectedAt);
    const diffHours = Math.floor((now - rejected) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return { text: `${diffHours} jam yang lalu`, isUrgent: diffHours > 20 };
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return { text: `${diffDays} hari yang lalu`, isUrgent: diffDays >= 1 };
  };

  const pendingSubmissions = submissions.filter(s => s.submission_status === 'rejected_by_umkm');
  const reviewedSubmissions = submissions.filter(s => 
    s.submission_status === 'admin_approved_rejection' || 
    s.submission_status === 'admin_rejected_rejection'
  );

  if (isLoading && submissions.length === 0) {
    return <Loading />;
  }

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
        <Box sx={{ mt: 9, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 72px)' }}>
          <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
              Review Penolakan Submission
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.textSecondary }}>
              Review submission yang ditolak oleh UMKM dalam 1 hari kerja
            </Typography>
          </Box>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#e65100' }}>
                  {pendingSubmissions.length}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  Menunggu Review Admin
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                  {reviewedSubmissions.filter(s => s.submission_status === 'admin_approved_rejection').length}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  Penolakan Disetujui
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1565c0' }}>
                  {reviewedSubmissions.filter(s => s.submission_status === 'admin_rejected_rejection').length}
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  Dikembalikan ke UMKM
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Pending Review (${pendingSubmissions.length})`} />
              <Tab label={`Reviewed (${reviewedSubmissions.length})`} />
            </Tabs>
          </Paper>

          {/* Pending Review Tab */}
          {tabValue === 0 && (
            <>
              {pendingSubmissions.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 64, color: COLORS.textSecondary, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1 }}>
                    Tidak Ada Submission yang Perlu Direview
                  </Typography>
                  <Typography sx={{ color: COLORS.textSecondary }}>
                    Semua penolakan UMKM sudah direview
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {pendingSubmissions.map((submission) => {
                    const timeInfo = getTimeSinceRejection(submission.rejected_by_umkm_at);
                    
                    return (
                      <Grid item xs={12} key={submission.id}>
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
                                {submission.content_url && (
                                  <Box
                                    component="img"
                                    src={submission.content_url}
                                    alt="Submission"
                                    sx={{
                                      width: '100%',
                                      height: 250,
                                      objectFit: 'cover',
                                      borderRadius: 2
                                    }}
                                  />
                                )}
                                {timeInfo.isUrgent && (
                                  <Chip
                                    label="⚠️ URGENT - Mendekati Deadline"
                                    color="error"
                                    size="small"
                                    sx={{ mt: 1, fontWeight: 600 }}
                                  />
                                )}
                              </Grid>

                              {/* Right: Details */}
                              <Grid item xs={12} md={8}>
                                <Stack spacing={2}>
                                  {/* Campaign & Time */}
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                      {submission.campaign.title}
                                    </Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                                      <Chip 
                                        icon={<ScheduleIcon />}
                                        label={`Ditolak: ${timeInfo.text}`}
                                        size="small"
                                        color={timeInfo.isUrgent ? 'error' : 'default'}
                                      />
                                      <Chip 
                                        icon={<BusinessIcon />}
                                        label={submission.umkm.business_name}
                                        size="small"
                                      />
                                      <Chip 
                                        icon={<PersonIcon />}
                                        label={submission.student.user.name}
                                        size="small"
                                      />
                                    </Stack>
                                  </Box>

                                  <Divider />

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

                                  {/* UMKM Rejection Reason */}
                                  <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ef5350' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#c62828' }}>
                                      Alasan Penolakan UMKM:
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.textPrimary }}>
                                      {submission.umkm_rejection_notes}
                                    </Typography>
                                  </Box>

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
                    <TableCell><strong>Campaign</strong></TableCell>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>UMKM</strong></TableCell>
                    <TableCell><strong>Admin Decision</strong></TableCell>
                    <TableCell><strong>Reviewed At</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviewedSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: COLORS.textSecondary }}>
                          Belum ada submission yang direview
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviewedSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.campaign.title}</TableCell>
                        <TableCell>{submission.student.user.name}</TableCell>
                        <TableCell>{submission.umkm.business_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              submission.submission_status === 'admin_approved_rejection'
                                ? 'Penolakan Disetujui'
                                : 'Dikembalikan ke UMKM'
                            }
                            color={
                              submission.submission_status === 'admin_approved_rejection'
                                ? 'error'
                                : 'info'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(submission.admin_reviewed_at).toLocaleDateString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))
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
                <li>Status submission: Failed Job</li>
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
                <li>Submission dikembalikan ke UMKM untuk review ulang</li>
                <li>UMKM harus melakukan re-review</li>
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
