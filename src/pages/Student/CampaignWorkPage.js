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
  Grid,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon  
} from '@mui/icons-material';
import campaignService from '../../services/campaignService';
import workSubmissionService from '../../services/workSubmissionService';
import postSubmissionService from '../../services/postSubmissionService';
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
  const [requiredContentTypes, setRequiredContentTypes] = useState([]);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false); 
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Post Submission State
  const [postSubmissionOpen, setPostSubmissionOpen] = useState(false);
  const [postLink, setPostLink] = useState('');
  const [currentPostSubmission, setCurrentPostSubmission] = useState(null);

  // Form Data (Student Fields Only)
  // Form Data
  const [submissionInputs, setSubmissionInputs] = useState([]);
  const [formData, setFormData] = useState({
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

      // Parse Required Content Types
      let ctypes = [];
      try {
         ctypes = typeof campaignData.content_types === 'string' 
            ? JSON.parse(campaignData.content_types) 
            : (campaignData.content_types || campaignData.contentTypes || []);
         if (Array.isArray(ctypes)) setRequiredContentTypes(ctypes);
      } catch (e) {
         console.error("Error parsing content types", e);
      }

      // 2. Get Application
      const appsRes = await campaignService.getCampaignUsers();
      const myApps = appsRes.data || appsRes || [];
      const myApp = myApps.find(app => String(app.campaign_id) === String(id));
      
      if (myApp) {
         setApplication(myApp); 
         
         // 3. Get Submissions
         const subsRes = await workSubmissionService.getCampaignSubmissions(id);
         const subsData = subsRes.data || subsRes || [];
         const myId = myApp.id || myApp.campaign_user_id;
         const mySubs = subsData.filter(s => String(s.campaign_user_id) === String(myId));
         
         // 4. Transform submissions to include post_submission info
         const enhancedSubs = await Promise.all(mySubs.map(async (sub) => {
            if (sub.status === 'approved') {
                try {
                    const postSubRes = await postSubmissionService.getByWorkSubmissionId(sub.id || sub.submission_id);
                    // Check if response is valid object or just empty
                    const postSubData = postSubRes.data || postSubRes;

                    if (postSubData && postSubData.id) {
                        return { ...sub, post_submission: postSubData };
                    }
                } catch (err) {
                    // Ignore 404s or errors, just means no post submission yet
                }
            }
            return sub;
         }));

         setSubmissions(enhancedSubs);
      } else {
         showToast('Aplikasi tidak ditemukan', 'error');
         navigate('/student/my-applications');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Gagal memuat data kampanye', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initializeInputs = (types) => {
      let inputs = [];
      if (types && types.length > 0) {
          types.forEach(type => {
              const count = type.post_count || 1;
              for (let i = 0; i < count; i++) {
                  inputs.push({
                      content_type: type.content_type,
                      url: '',
                      label: `${type.content_type === 'foto' ? 'Posting Instagram' : (type.content_type || 'Post').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} #${i+1}`
                  });
              }
          });
      } else {
          // Fallback if no specific types
          inputs.push({ content_type: 'post', url: '', label: 'URL Konten' });
      }
      return inputs;
  };

  const handleOpenCreate = () => {
    setSubmissionInputs(initializeInputs(requiredContentTypes));
    setFormData({
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
    // If editing, we need to populate submissionInputs from the existing submission content
    // Assuming submission definition has changed or we adapt. 
    // If backend returns 'submission_content' array:
    let inputs = [];
    if (submission.submission_content && Array.isArray(submission.submission_content)) {
        inputs = submission.submission_content.map((item, idx) => ({
            content_type: item.content_type,
            url: item.url || item.content_url || '',
            label: `${item.content_type} #${idx+1}`
        }));
    } else {
        // Legacy fallback
        inputs = [{
            content_type: submission.content_type,
            url: submission.content_url,
            label: submission.content_type
        }];
    }
    
    setSubmissionInputs(inputs);
    setFormData({
      caption: submission.caption || '',
      hashtags: Array.isArray(submission.hashtags) 
         ? submission.hashtags.join(' ') 
         : (submission.hashtags || ''),
      platform: submission.platform || 'instagram',
      submission_notes: submission.submission_notes || ''
    });

    setEditMode(true);
    setViewMode(false);
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleOpenView = (submission) => {
    handleOpenEdit(submission); // Reuse mapping logic
    setEditMode(false);
    setViewMode(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUrlChange = (idx, value) => {
      const newInputs = [...submissionInputs];
      newInputs[idx].url = value;
      setSubmissionInputs(newInputs);
  };

  const handleSave = async (status) => {
    if (!application) return;
    
    // Validations
    if (status === 'final') {
       const missingUrl = submissionInputs.some(input => !input.url.trim());
       if (missingUrl) {
          showToast('Semua URL Konten diperlukan untuk pengiriman final', 'warning');
         return;
       }
    }

    try {
      setSubmitting(true);
      
      const payload = {
        campaign_user_id: application.id || application.campaign_user_id,
        submission_type: status, // 'draft' or 'final'
        submissionContent: submissionInputs.map(input => ({
            content_type: input.content_type,
            url: input.url 
        })),
        caption: formData.caption,
        hashtags: typeof formData.hashtags === 'string' 
           ? formData.hashtags.split(' ').map(tag => tag.trim()).filter(tag => tag.length > 0)
           : formData.hashtags,
        platform: formData.platform,
        submission_notes: formData.submission_notes
      };

      if (editMode && selectedSubmission) {
        const subId = selectedSubmission.submission_id || selectedSubmission.id;
        await workSubmissionService.updateWorkSubmission(subId, payload);
        showToast('Kiriman diperbarui', 'success');
      } else {
        await workSubmissionService.createWorkSubmission(payload);
        showToast('Kiriman dibuat', 'success');
      }

      setDialogOpen(false);
      loadData(); 

    } catch (error) {
      console.error('Save error:', error);
      showToast('Gagal menyimpan kiriman', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPostSubmission = (submission) => {
     setSelectedSubmission(submission);
     setPostLink('');
     // Check if existing post submission
     if (submission.post_submission) {
         setPostLink(submission.post_submission.post_link);
         setCurrentPostSubmission(submission.post_submission);
     } else {
         setCurrentPostSubmission(null);
     }
     setPostSubmissionOpen(true);
  };

  const handleSubmitPostLink = async () => {
    if (!postLink.trim()) {
        showToast('Harap masukkan tautan yang valid', 'warning');
        return;
    }

    try {
        setSubmitting(true);
        const subId = selectedSubmission.id || selectedSubmission.submission_id;
        
        await postSubmissionService.submitLink({
            work_submission_id: subId,
            post_link: postLink
        });

        showToast('Tautan posting berhasil dikirim', 'success');
        setPostSubmissionOpen(false);
        loadData(); // Reload to update status

    } catch (error) {
        console.error("Submit post link error:", error);
        showToast('Gagal mengirim tautan posting', 'error');
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
    switch (status?.toLowerCase()) {
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      case 'revision_requested': return 'Revisi Diminta';
      case 'pending': return 'Menunggu';
      case 'verified': return 'Terverifikasi';
      default: return 'Dikirim';
    }
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
               Kembali
             </Button>
             <Box flex={1}>
               <Typography variant="h5" fontWeight={700}>{campaign?.title}</Typography>
               <Stack direction="row" spacing={3} sx={{ mt: 1, color: 'text.secondary' }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <CalendarTodayIcon sx={{ fontSize: 16 }} />
                       <Typography variant="body2">
                           {campaign?.start_date ? new Date(campaign.start_date).toLocaleDateString() : '-'} - {campaign?.end_date ? new Date(campaign.end_date).toLocaleDateString() : '-'}
                       </Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <InfoIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                       <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                           Batas Waktu: {campaign?.submission_deadline ? new Date(campaign.submission_deadline).toLocaleDateString() : 'Tidak Ada Batas Waktu'}
                       </Typography>
                   </Box>
               </Stack>
               <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>{campaign?.campaign_category}</Typography>
             </Box>
          </Stack>

          {/* Campaign Guidelines (Brief) */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
             <Typography variant="h6" fontWeight={600} gutterBottom>Persyaratan & Panduan</Typography>
             <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
               {campaign?.content_guidelines || 'Tidak ada panduan konten.'}
             </Typography>
             {campaign?.caption_guidelines && (
                <Box sx={{ bgcolor: '#f1f5f9', p: 2, borderRadius: 1 }}>
                   <Typography variant="subtitle2" gutterBottom>Panduan Keterangan:</Typography>
                   <Typography variant="body2">{campaign.caption_guidelines}</Typography>
                </Box>
             )}

              {/* Required Content Types Display */}
              {requiredContentTypes.length > 0 && (
                 <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={700}>Konten yang Diperlukan:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                       {requiredContentTypes.map((item, idx) => (
                          <Chip 
                             key={idx}
                             label={`${item.post_count || 1}x ${item.content_type === 'foto' ? 'Instagram Feed' : (item.content_type || 'Post').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}`}
                             sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
                          />
                       ))}
                    </Stack>
                 </Box>
              )}
          </Paper>

          {/* Submissions Section */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography variant="h6" fontWeight={700}>Pekerjaan Saya</Typography>
             <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#6E00BE' }}>
               Pekerjaan Baru
             </Button>
          </Stack>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                   <TableCell fontWeight={600}>Tanggal</TableCell>
                   <TableCell fontWeight={600}>Platform</TableCell>
                   <TableCell fontWeight={600}>Tipe</TableCell>
                   <TableCell fontWeight={600}>Caption</TableCell>
                   <TableCell fontWeight={600}>Hashtag</TableCell>
                   <TableCell fontWeight={600}>Tautan</TableCell>
                   <TableCell fontWeight={600}>Status</TableCell>
                   <TableCell fontWeight={600}>Aksi</TableCell> {/* For Post Submission */}
                   <TableCell align="right">Kelola</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                       Belum ada kiriman. Buat satu untuk memulai!
                     </TableCell>
                   </TableRow>
                ) : (
                   submissions.map((sub) => (
                     <TableRow key={sub.submission_id || sub.id}>
                       <TableCell>{new Date(sub.created_at || Date.now()).toLocaleDateString()}</TableCell>
                       <TableCell sx={{ textTransform: 'capitalize' }}>{sub.platform}</TableCell>
                       <TableCell sx={{ textTransform: 'capitalize' }}>
                           {sub.submission_content && sub.submission_content.length > 0 
                              ? sub.submission_content.map(c => c.content_type).filter((v, i, a) => a.indexOf(v) === i).join(', ')
                              : (sub.content_type || '-')
                           }
                       </TableCell>
                       <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {sub.caption}
                       </TableCell>
                       <TableCell sx={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {Array.isArray(sub.hashtags) ? sub.hashtags.join(', ') : sub.hashtags}
                       </TableCell>
                       <TableCell>
                         {sub.submission_content && sub.submission_content.length > 0 ? (
                            <Stack spacing={0.5}>
                               {sub.submission_content.map((item, idx) => (
                                  item.url ? (
                                    <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6E00BE', textDecoration: 'none', fontSize: '0.8rem' }}>
                                      Link {idx + 1} <LaunchIcon style={{ fontSize: 12 }} />
                                    </a>
                                  ) : null
                               ))}
                            </Stack>
                         ) : (
                             sub.content_url ? (
                               <a href={sub.content_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6E00BE', textDecoration: 'none' }}>
                                 Lihat <LaunchIcon fontSize="inherit" />
                               </a>
                             ) : '-'
                         )}
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

                       <TableCell>
                          {/* Post Submission Action */}
                          {sub.status === 'approved' && (
                             sub.post_submission ? (
                                <Box>
                                    <Chip 
                                        label={sub.post_submission.status === 'verified' ? 'Posting Diverifikasi' : sub.post_submission.status === 'rejected' ? 'Posting Ditolak' : 'Posting Tertunda'} 
                                        color={sub.post_submission.status === 'verified' ? 'success' : sub.post_submission.status === 'rejected' ? 'error' : 'warning'}
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOpenPostSubmission(sub)}
                                    />
                                </Box>
                             ) : (
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    size="small"
                                    onClick={() => handleOpenPostSubmission(sub)}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Kirim Tautan Posting
                                </Button>
                             )
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
                               Ubah
                             </Button>
                          ) : (
                             <Button 
                               startIcon={<VisibilityIcon />} 
                               size="small" 
                               onClick={() => handleOpenView(sub)} 
                             >
                               Lihat
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
            {viewMode ? 'Lihat Kiriman' : (editMode ? 'Edit Kiriman' : 'Unggah Kiriman Baru')}
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
            {/* Dynamic Content Inputs */}
            <Typography variant="subtitle2" sx={{ color: '#1e293b', fontWeight: 700 }}>
                Tautan Kiriman
            </Typography>
            {submissionInputs.map((input, idx) => (
                <Box key={idx} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: theme.palette.primary.main }}>
                        {input.label}
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder={`Tempel tautan ${input.label} Anda di sini...`}
                        value={input.url}
                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                        disabled={viewMode}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LaunchIcon fontSize="small" color="disabled" />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            ))}

        

             <TextField
                label="Keterangan"
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                disabled={viewMode}
             />

             <TextField
                label="Tagar"
                name="hashtags"
                value={formData.hashtags}
                onChange={handleInputChange}
                fullWidth
                placeholder="#kampanye #merek"
                helperText="Dipisahkan spasi"
                disabled={viewMode}
             />

             <TextField
                label="Catatan"
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
              {viewMode ? 'Tutup' : 'Batal'}
            </Button>
            
            {!viewMode && (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => handleSave('draft')}
                  disabled={submitting}
                >
                  Simpan sebagai Draf
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => handleSave('final')}
                  disabled={submitting}
                  sx={{ bgcolor: '#6E00BE' }}
                >
                  Kirim Final
                </Button>
              </>
            )}
         </DialogActions>
      </Dialog>

      {/* Post Submission Dialog */}
      <Dialog open={postSubmissionOpen} onClose={() => setPostSubmissionOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle>Kirim Tautan Posting</DialogTitle>
         <DialogContent>
             <Alert severity="info" sx={{ mb: 2 }}>
                 Pekerjaan Anda telah disetujui! Silakan kirim tautan ke postingan langsung Anda (mis. URL Instagram) agar kami dapat memverifikasinya.
             </Alert>
             {currentPostSubmission && currentPostSubmission.status === 'rejected' && (
                 <Alert severity="error" sx={{ mb: 2 }}>
                     Tautan sebelumnya ditolak. Harap periksa dan kirim tautan yang valid.
                 </Alert>
             )}
             <TextField
                 autoFocus
                 margin="dense"
                 label="URL Postingan Langsung"
                 type="url"
                 fullWidth
                 variant="outlined"
                 placeholder="https://instagram.com/p/..."
                 value={postLink}
                 onChange={(e) => setPostLink(e.target.value)}
                 disabled={currentPostSubmission && currentPostSubmission.status === 'verified'}
             />
         </DialogContent>
         <DialogActions>
             <Button onClick={() => setPostSubmissionOpen(false)}>Batal</Button>
             {(!currentPostSubmission || currentPostSubmission.status !== 'verified') && (
                 <Button onClick={handleSubmitPostLink} variant="contained" disabled={submitting}>
                     {submitting ? 'Mengirim...' : 'Kirim Tautan'}
                 </Button>
             )}
         </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignWorkPage;
