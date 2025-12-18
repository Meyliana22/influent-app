import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Campaign as CampaignIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Link as LinkIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import { COLORS } from '../../constants/colors';
import campaignService from '../../services/campaignService';
import { getCampaignApplicants } from '../../services/applicantService';
import { getCampaignSubmissions } from '../../services/workSubmissionService';

function CampaignReport() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Responsive state for sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [campaignId]);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [campaignData, applicantsData, submissionsData] = await Promise.all([
        campaignService.getCampaignById(campaignId),
        getCampaignApplicants(campaignId).catch(() => []),
        getCampaignSubmissions(campaignId).catch(() => [])
      ]);

      setCampaign(campaignData);
      setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Gagal memuat data laporan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const applicantsArray = Array.isArray(applicants) ? applicants : [];
    const submissionsArray = Array.isArray(submissions) ? submissions : [];
    
    const totalApplicants = applicantsArray.length;
    const selectedApplicants = applicantsArray.filter(a => a.status === 'selected').length;
    const acceptedApplicants = applicantsArray.filter(a => a.status === 'accepted').length;
    const rejectedApplicants = applicantsArray.filter(a => a.status === 'rejected').length;
    
    const totalSubmissions = submissionsArray.length;
    const pendingSubmissions = submissionsArray.filter(s => s.submission_status === 'pending').length;
    const approvedSubmissions = submissionsArray.filter(s => s.submission_status === 'approved').length;
    const revisionSubmissions = submissionsArray.filter(s => s.submission_status === 'revision_requested').length;
    const rejectedSubmissions = submissionsArray.filter(s => s.submission_status === 'rejected').length;
    
    const successfulPosts = approvedSubmissions; // Konten yang disetujui = berhasil posting
    const failedPosts = rejectedSubmissions; // Konten yang ditolak = gagal posting

    return {
      totalApplicants,
      selectedApplicants,
      acceptedApplicants,
      rejectedApplicants,
      successfulPosts,
      failedPosts,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      revisionSubmissions,
      rejectedSubmissions,
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { label: 'Aktif', color: '#66bb6a' },
      completed: { label: 'Selesai', color: '#42a5f5' },
      cancelled: { label: 'Dibatalkan', color: '#ef5350' },
      pending_payment: { label: 'Menunggu Pembayaran', color: '#ffa726' },
      draft: { label: 'Draft', color: '#78909c' },
    };

    const config = statusConfig[status] || { label: status, color: '#78909c' };
    return (
      <Chip 
        label={config.label}
        sx={{ 
          bgcolor: config.color,
          color: '#fff',
          fontWeight: 600,
          fontSize: 13
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
        <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <Box sx={{ ml: isMobile ? 0 : 32.5, flex: 1 }}>
          <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <Box sx={{ mt: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !campaign) {
    return (
      <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
        <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <Box sx={{ ml: isMobile ? 0 : 32.5, flex: 1 }}>
          <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <Box sx={{ mt: 9, p: 4 }}>
            <Alert severity="error">{error || 'Campaign tidak ditemukan'}</Alert>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/campaigns')} sx={{ mt: 2 }}>
              Kembali ke Dashboard
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  const stats = calculateStats();
  const budget = campaign.total_budget || 0;
  const paidToStudents = stats.approvedSubmissions * (campaign.compensation_per_student || 0);
  const cashback = budget - paidToStudents;

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <Box sx={{ ml: isMobile ? 0 : 32.5, flex: 1 }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <Box sx={{ mt: 9, bgcolor: '#f5f7fa', minHeight: 'calc(100vh - 72px)', py: { xs: 2, md: 4 } }}>
          <Container maxWidth="lg">
          {/* Header */}
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/umkm/campaigns')}
            sx={{ mb: 3, color: COLORS.primary, textTransform: 'none', fontWeight: 600 }}
          >
            Kembali ke Dashboard
          </Button>

          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ 
                width: 56, 
                height: 56, 
                borderRadius: '12px', 
                bgcolor: '#f5f7ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AssignmentIcon sx={{ fontSize: 32, color: '#667eea' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
                  Laporan Campaign
                </Typography>
                <Typography variant="body1" sx={{ color: COLORS.textSecondary }}>
                  Ringkasan lengkap performa dan hasil campaign Anda
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Section 1: Ringkasan Campaign */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <CampaignIcon sx={{ fontSize: 24, color: '#667eea' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Ringkasan Campaign
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Nama Campaign
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.textPrimary, mt: 0.5 }}>
                      {campaign.title}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Kategori
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <CategoryIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                        {campaign.campaign_category || 'Tidak ada kategori'}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Status Akhir
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {getStatusChip(campaign.status)}
                    </Box>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Periode Campaign
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Total Budget
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <MoneyIcon sx={{ fontSize: 18, color: '#66bb6a' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#66bb6a' }}>
                        {formatCurrency(budget)}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Deadline Submission
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.textPrimary, mt: 0.5 }}>
                      {formatDate(campaign.submission_deadline)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Rekap Mahasiswa/Influencer */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <PeopleIcon sx={{ fontSize: 24, color: '#667eea' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Rekap Mahasiswa / Influencer
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f7ff', borderRadius: 2, textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 28, color: '#667eea', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {stats.totalApplicants}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Total Mendaftar
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff8f0', borderRadius: 2, textAlign: 'center' }}>
                  <StarIcon sx={{ fontSize: 28, color: '#ffa726', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {stats.selectedApplicants}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Dipilih
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f8f4', borderRadius: 2, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 28, color: '#66bb6a', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {stats.successfulPosts}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Berhasil Posting
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef5f5', borderRadius: 2, textAlign: 'center' }}>
                  <CancelIcon sx={{ fontSize: 28, color: '#ef5350', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {stats.failedPosts}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Gagal/Ditolak
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={4} md={2.4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff9f0', borderRadius: 2, textAlign: 'center' }}>
                  <EditIcon sx={{ fontSize: 28, color: '#ffa726', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                    {stats.rejectedApplicants}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Ditolak Seleksi
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, borderLeft: '4px solid #42a5f5' }}>
              <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 600 }}>
                💡 Efektivitas Seleksi: {stats.totalApplicants > 0 ? Math.round((stats.successfulPosts / stats.totalApplicants) * 100) : 0}% mahasiswa yang mendaftar berhasil menyelesaikan campaign
              </Typography>
            </Box>
          </Paper>

          {/* Section 3: Rekap Konten & Posting */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 24, color: '#667eea' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Rekap Konten & Posting
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                      Total Konten Disubmit
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                      {stats.totalSubmissions}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                      Konten Disetujui
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      {stats.approvedSubmissions}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2.5, bgcolor: '#fff9e6', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 600 }}>
                      Konten Perlu Revisi
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#f57c00' }}>
                      {stats.revisionSubmissions}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2.5, bgcolor: '#ffebee', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 600 }}>
                      Konten Ditolak
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#c62828' }}>
                      {stats.rejectedSubmissions}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2.5, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 600 }}>
                      Menunggu Review
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1565c0' }}>
                      {stats.pendingSubmissions}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ p: 2.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                      Konten Terpublish
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
                      {stats.approvedSubmissions}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {/* Link konten yang sudah disetujui */}
            {stats.approvedSubmissions > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 2 }}>
                  Link Konten Terpublish:
                </Typography>
                <Stack spacing={1.5}>
                  {(Array.isArray(submissions) ? submissions : [])
                    .filter(s => s.submission_status === 'approved' && s.content_url)
                    .slice(0, 5)
                    .map((submission, index) => (
                      <Paper key={submission.id} elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <LinkIcon sx={{ fontSize: 20, color: '#667eea' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                              {submission.student?.user?.name || `Student ${index + 1}`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                              Posted: {formatDate(submission.submitted_at)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            href={submission.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            Lihat
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  {(Array.isArray(submissions) ? submissions : []).filter(s => s.submission_status === 'approved').length > 5 && (
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, textAlign: 'center', pt: 1 }}>
                      Dan {(Array.isArray(submissions) ? submissions : []).filter(s => s.submission_status === 'approved').length - 5} konten lainnya...
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
          </Paper>

          {/* Section 4: Laporan Keuangan */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <MoneyIcon sx={{ fontSize: 24, color: '#66bb6a' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Laporan Keuangan
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2, border: '2px solid #66bb6a' }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Budget Awal
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32', mt: 1 }}>
                    {formatCurrency(budget)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff3e0', borderRadius: 2, border: '2px solid #ffa726' }}>
                  <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Dibayar ke Student
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f57c00', mt: 1 }}>
                    {formatCurrency(paidToStudents)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, mt: 1, display: 'block' }}>
                    {stats.approvedSubmissions} student × {formatCurrency(campaign.compensation_per_student || 0)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, border: '2px solid #42a5f5' }}>
                  <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Sisa Budget / Cashback
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565c0', mt: 1 }}>
                    {formatCurrency(cashback)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#f3e5f5', borderRadius: 2, border: '2px solid #ab47bc' }}>
                  <Typography variant="caption" sx={{ color: '#6a1b9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Status Pembayaran
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 32, color: '#66bb6a' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      {campaign.status === 'completed' ? 'Selesai' : campaign.status === 'active' ? 'Berlangsung' : 'Pending'}
                    </Typography>
                  </Stack>
                  {campaign.payment_date && (
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, mt: 1, display: 'block' }}>
                      Tanggal: {formatDate(campaign.payment_date)}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2.5, bgcolor: '#fff9e6', borderRadius: 2, borderLeft: '4px solid #ffa726' }}>
              <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 600, mb: 1 }}>
                📊 Ringkasan Finansial:
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                Dari total budget <strong>{formatCurrency(budget)}</strong>, telah dibayarkan <strong>{formatCurrency(paidToStudents)}</strong> kepada {stats.approvedSubmissions} mahasiswa yang berhasil menyelesaikan campaign. 
                {cashback > 0 && ` Sisa budget sebesar ${formatCurrency(cashback)} dapat digunakan untuk campaign berikutnya.`}
              </Typography>
            </Box>
          </Paper>

          {/* Section 5: Pelanggaran */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <WarningIcon sx={{ fontSize: 24, color: '#ffa726' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                Laporan Pelanggaran
              </Typography>
            </Stack>

            <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#66bb6a', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
                Tidak Ada Pelanggaran
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                Tidak ada laporan pelanggaran dalam campaign ini. Semua mahasiswa telah mengikuti aturan dengan baik.
              </Typography>
            </Box>

            {/* Jika ada pelanggaran di masa depan, bisa ditampilkan seperti ini:
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Jumlah Pelanggaran: X
              </Typography>
              <Typography variant="body2">
                Status: Sedang ditinjau / Terkonfirmasi
              </Typography>
              <Typography variant="body2">
                Dampak: Pembayaran dipotong / Tidak ada dampak
              </Typography>
            </Alert>
            */}
          </Paper>

          {/* Summary Card */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 2, textAlign: 'center' }}>
                🎉 Terima kasih telah menggunakan platform Influent!
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary, textAlign: 'center', mb: 3 }}>
                Laporan ini dapat Anda simpan atau cetak untuk keperluan dokumentasi bisnis Anda.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={() => window.print()}
                  sx={{
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5568d3' },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Cetak Laporan
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/umkm/campaigns')}
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': { borderColor: '#5568d3', bgcolor: 'rgba(102, 126, 234, 0.08)' },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Kembali ke Dashboard
                </Button>
              </Stack>
            </Box>
          </Paper>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default CampaignReport;
