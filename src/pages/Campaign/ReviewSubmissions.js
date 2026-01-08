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
  Tooltip,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as RevisionIcon,
  ArrowBack as BackIcon,
  Instagram as InstagramIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  PlayCircle as PlayIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { COLORS } from '../../constants/colors';
import workSubmissionService from '../../services/workSubmissionService';
import postSubmissionService from '../../services/postSubmissionService';
import campaignService from '../../services/campaignService';
import applicantService from '../../services/applicantService';
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
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, revision_requested, not_submitted
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]);
  const [progressStats, setProgressStats] = useState({ submitted: 0, total: 0 });
  const apiImage = process.env.REACT_APP_API_IMAGE_URL;
  const getProfileImage = (url) => {

    return `${url}`;
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
      
      // Load accepted applicants to calculate "Not Submitted"
      const applicantsRes = await applicantService.getCampaignApplicants(campaignId);
      const allApplicants = applicantsRes.data || applicantsRes || [];
      
      // Filter for accepted/approved students
      const accepted = allApplicants.filter(a => 
        (a.application_status && (a.application_status.toLowerCase() === 'accepted' || a.application_status.toLowerCase() === 'approved'))
      );
      setAcceptedStudents(accepted);

      // Identify students who have submitted
      const submittedStudentIds = new Set();
      console.log(submissionsData)
      submissionsData.forEach(sub => {
         // Try to find the student ID associated with this submission
         // Check CampaignUser -> Student -> id
         // Also handle potential inconsistencies in API structure
         console.log(sub.CampaignUser)
         const sId = sub.CampaignUser?.Student?.user_id || sub.student_id;
         console.log(sId)
         if (sId) submittedStudentIds.add(sId);
      });
      console.log(submittedStudentIds)

      // Filter accepted students who are NOT in submittedStudentIds
      const notSubmitted = accepted.filter(app => {
         // The applicant object usually has `student_id` directly or within `Student` object
         const appStudentId = app.Student?.id || app.student?.id || app.student_id;
         // If we can't find an ID, we assume they haven't submitted to be safe
         // But we should verify we are getting a valid student ID from app
         return appStudentId && !submittedStudentIds.has(appStudentId);
      });
      
      setNotSubmittedStudents(notSubmitted);
      
      // Progress Stats
      // User requested total to be from campaign.influencer_count
      console.log(campaignData  )
      const totalTarget = campaignData.data.influencer_count || accepted.length; // Fallback to accepted length if 0 or null
      
      setProgressStats({
         submitted: submittedStudentIds.size,
         total: totalTarget
      });

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
      case 'draft': return 'Draf';
      default: return status?.replace('_', ' ') || '-';
    }
  };

  const getStatusLabel = (status) => {
    return translateStatus(status);
  };

  const filteredSubmissions = filter === 'not_submitted' 
    ? notSubmittedStudents // Special case: return array so checks pass, but we render differently below
    : Array.isArray(submissions) 
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
                    Tinjau Pekerjaan
                  </Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
                    {campaign?.title || 'Loading...'}
                  </Typography>
                </Box>
              </Stack>

              {/* Payment Info Box */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  bgcolor: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 3
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start" justifyContent="space-between">
                   <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} color={COLORS.textPrimary} gutterBottom>
                        Informasi Pembayaran
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" color={COLORS.textSecondary}>
                           Pembayaran dapat dilakukan setelah <Box component="span" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>{campaign?.end_date ? new Date(campaign.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</Box>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                           * Pastikan semua konten direview sebelum pembayaran dibuka otomatis
                        </Typography>
                      </Box>
                   </Box>
                   <Box sx={{ 
                     display: 'inline-block',
                     p: 2,
                     minWidth: 200,
                     bgcolor: '#fff',
                     borderRadius: 2,
                     border: '1px solid #e2e8f0',
                     boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                   }}>
                     <Typography variant="body2" color={COLORS.textSecondary} gutterBottom>
                       Total Progres
                     </Typography>
                     <Typography variant="h4" fontWeight={700} color={COLORS.primary} sx={{ lineHeight: 1 }}>
                        {progressStats.submitted}<span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 500 }}>/{progressStats.total}</span>
                     </Typography>
                     <Typography variant="caption" color={COLORS.textSecondary} sx={{ mt: 0.5, display: 'block' }}>
                       Mahasiswa yang mengumpulkan
                     </Typography>
                   </Box>
                </Stack>
              </Paper>

              {/* Stats Overview */}
              {/* Stats Overview */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(5, 1fr)' }, 
                gap: 2, 
                mb: 4 
              }}>
                {[
                  { id: 'not_submitted', label: 'Belum Mengumpulkan', value: notSubmittedStudents.length, icon: DescriptionIcon, color: '#7e22ce', bg: '#f3e8ff', border: '#d8b4fe' },
                  { id: 'pending', label: 'Menunggu Ulasan', value: submissions.filter(s => s.status === 'pending' && s.submission_type !== 'draft').length, icon: ScheduleIcon, color: '#c2410c', bg: '#fff7ed', border: '#fdba74' },
                  { id: 'approved', label: 'Disetujui', value: submissions.filter(s => s.status === 'approved').length, icon: ApproveIcon, color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
                  { id: 'revision_requested', label: 'Perlu Revisi', value: submissions.filter(s => s.status === 'revision_requested').length, icon: RevisionIcon, color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
                  { id: 'rejected', label: 'Ditolak', value: submissions.filter(s => s.status === 'rejected').length, icon: RejectIcon, color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5' }
                ].map((stat) => (
                  <Box 
                    key={stat.id}
                    onClick={() => setFilter(stat.id)}
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      bgcolor: '#fff', 
                      border: '1px solid',
                      borderColor: filter === stat.id ? stat.border : '#e2e8f0', 
                      borderRadius: 5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      minWidth: 0,
                      transition: 'all 0.2s',
                      boxShadow: 0,
                      '&:hover': { 
                        borderColor: stat.border, 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                        transform: 'translateY(-4px)' 
                      }
                    }}
                  >
                     <Box sx={{ 
                       width: 48, 
                       height: 48, 
                       borderRadius: 2, 
                       bgcolor: stat.bg, 
                       color: stat.color,
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       flexShrink: 0
                     }}>
                        <stat.icon sx={{ fontSize: 24 }} />
                     </Box>
                     <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2, mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                           {stat.label}
                        </Typography>
                     </Box>
                  </Box>
                ))}
              </Box>

              {/* Filter Tabs */}
              <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                {['all', 'pending', 'approved', 'revision_requested', 'rejected', 'not_submitted'].map((status) => (
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
                    {status === 'not_submitted' ? 'Belum Mengumpulkan' : translateStatus(status)}
                  </Button>
                ))}
              </Stack>

              {/* Submissions List */}
              {filteredSubmissions.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 64, color: COLORS.textSecondary, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: COLORS.textPrimary, mb: 1, fontWeight: 600 }}>
                    {filter === 'not_submitted' 
                       ? 'Semua mahasiswa (diterima) sudah mengumpulkan tugas!' 
                       : 'Tidak ada pengajuan ditemukan'}
                  </Typography>
                </Paper>
              ) : filter === 'not_submitted' ? (
                // Not Submitted List
                <Stack spacing={2}>
                   {notSubmittedStudents.map((app) => {
                      const student = app.Student?.User || app.User || app.user || {};
                      const studentProfile = app.Student || app.student || {};
                      console.log(student)
                      return (
                        <Card 
                           key={app.id} 
                           elevation={0}
                           sx={{ 
                              p: 3,
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              '&:hover': { boxShadow: 2 }
                           }}
                        >
                           <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={getProfileImage(student.profile_image)} sx={{ bgcolor: '#bdbdbd' }}>
                                 {student.name?.[0]?.toUpperCase() || 'S'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                 <Typography variant="h6" fontWeight={600} color={COLORS.textPrimary}>
                                    {student.name}
                                 </Typography>
                                 <Typography variant="body2" color={COLORS.textSecondary}>
                                    {studentProfile.university || studentProfile.major || '-'}
                                 </Typography>
                                 <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.textSecondary, fontSize: 13 }}>
                                       <InstagramIcon sx={{ fontSize: 16 }} />
                                       {studentProfile.instagram_username || '-'}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.textSecondary, fontSize: 13 }}>
                                       <ScheduleIcon sx={{ fontSize: 16 }} />
                                       Diterima pada {new Date(app.updated_at || app.created_at).toLocaleDateString()}
                                    </Box>
                                 </Stack>
                              </Box>
                               <Chip label="Belum Mengumpulkan" color="default" size="small" sx={{ fontWeight: 600 }} />
                           </Stack>
                        </Card>
                      );
                   })}
                </Stack>
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
                          mb: 3,
                          border: '1px solid #f1f5f9',
                          borderRadius: 4,
                          overflow: 'hidden',
                          bgcolor: '#fff',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                          '&:hover': {
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            transform: 'translateY(-4px)',
                            borderColor: '#e2e8f0'
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
                                sx={{ 
                                  fontWeight: 600, 
                                  fontSize: '0.75rem',
                                  height: 28,
                                  bgcolor: getStatusColor(submission.status) === 'success' ? '#dcfce7' : 
                                           getStatusColor(submission.status) === 'error' ? '#fee2e2' : 
                                           getStatusColor(submission.status) === 'warning' ? '#ffedd5' : '#f1f5f9',
                                  color: getStatusColor(submission.status) === 'success' ? '#166534' : 
                                         getStatusColor(submission.status) === 'error' ? '#991b1b' : 
                                         getStatusColor(submission.status) === 'warning' ? '#9a3412' : '#475569',
                                  border: '1px solid',
                                  borderColor: getStatusColor(submission.status) === 'success' ? '#86efac' : 
                                               getStatusColor(submission.status) === 'error' ? '#fca5a5' : 
                                               getStatusColor(submission.status) === 'warning' ? '#fdba74' : '#cbd5e1'
                                }}
                              />
                            </Stack>
      
                            {/* Submission Date & Platform */}
                            <Stack direction="row" spacing={2} mb={2}>
                                <Typography variant="body2" sx={{ color: COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScheduleIcon sx={{ fontSize: 16 }} />
                                  {new Date(submission.created_at).toLocaleDateString()}
                                </Typography>
                              
                            </Stack>

                            {/* Links List */}
                            <Box sx={{ mb: 3 }}>
                                {submission.submission_content && submission.submission_content.length > 0 ? (
                                   submission.submission_content.map((item, idx) => (
                                      <Paper key={idx} elevation={0} sx={{ 
                                        p: 1.5, 
                                        mb: 1, 
                                        bgcolor: '#f8fafc', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5
                                      }}>
                                          <Box sx={{ 
                                            p: 0.5, 
                                            borderRadius: 1, 
                                            bgcolor: '#e0e7ff', 
                                            color: '#4338ca',
                                            display: 'flex'
                                          }}>
                                            <DescriptionIcon sx={{ fontSize: 18 }} />
                                          </Box>
                                          <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                             <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', color: '#1e293b' }}>
                                                {item.content_type}
                                             </Typography>
                                             <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Typography variant="caption" sx={{ color: '#6366f1', '&:hover': { textDecoration: 'underline' }, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                   {item.url}
                                                </Typography>
                                             </a>
                                          </Box>
                                          <LaunchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                                      </Paper>
                                   ))
                                ) : (
                                   submission.content_url && (
                                     <Paper elevation={0} sx={{ 
                                       p: 1.5, 
                                       bgcolor: '#f8fafc', 
                                       border: '1px solid #e2e8f0', 
                                       borderRadius: 2,
                                       display: 'flex',
                                       gap: 1.5
                                     }}>
                                        <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: '#e0e7ff', color: '#4338ca' }}><DescriptionIcon sx={{ fontSize: 18 }} /></Box>
                                        <Box sx={{ flex: 1 }}>
                                           <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>Link Konten</Typography>
                                            <a href={submission.content_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Typography variant="caption" sx={{ color: '#6366f1' }}>{submission.content_url}</Typography>
                                            </a>
                                        </Box>
                                     </Paper>
                                   )
                                )}
                            </Box>
      
                            {/* Caption */}
                            {/* Caption */}
                            {submission.caption && (
                              <Box sx={{ mb: 2, p: 2.5, bgcolor: '#fafafa', borderRadius: 3, border: '1px dashed #e2e8f0' }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, mb: 0.5, display: 'block' }}>CAPTION</Typography>
                                <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic', lineHeight: 1.7 }}>
                                  "{submission.caption}"
                                </Typography>
                              </Box>
                            )}
  
                            {/* Hashtags */}
                            {submission.hashtags && (
                               <Box sx={{ mb: 3 }}>
                                  {Array.isArray(submission.hashtags) ? submission.hashtags.map((t, i) => (
                                    <Chip key={i} label={`#${t}`} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: '#f3e8ff', color: '#7e22ce', fontWeight: 500 }} />
                                  )) : (
                                    <Typography variant="body2" color="primary">{submission.hashtags}</Typography>
                                  )}
                               </Box>
                            )}
      
                            {/* Review Notes */}
                            {submission.review_notes && (
                              <Box sx={{ mb: 3, p: 2.5, bgcolor: '#fff7ed', borderRadius: 3, border: '1px solid #fdba74' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                                  Catatan Review
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9a3412', lineHeight: 1.6 }}>
                                  {submission.review_notes}
                                </Typography>
                              </Box>
                            )}

                            {/* Admin Review Notes */}
                            {submission.admin_review_notes && (
                              <Box sx={{ mb: 3, p: 2.5, bgcolor: '#f3e5f5', borderRadius: 3, border: '1px solid #ce93d8' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#7b1fa2', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                                  Catatan Review Admin (Override)
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6a1b9a', lineHeight: 1.6 }}>
                                  {submission.admin_review_notes}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#8e24aa', fontStyle: 'italic' }}>
                                  * Keputusan penolakan Anda telah ditinjau dan diubah oleh Admin.
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
                                            Mahasiswa belum mengirimkan tautan postingan.
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
             {reviewModal.action === 'approve' && 'Pengajuan yang disetujui akan menotifikasi mahasiswa.'}
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
