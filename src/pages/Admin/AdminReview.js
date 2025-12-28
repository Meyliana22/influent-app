import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Card, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors';
import adminReviewService from '../../services/adminReviewService';
import { toast } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

function AdminReview() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false,
  });
  
  // Reject dialog state
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    campaignId: null,
    reason: '',
  });

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
    loadPendingCampaigns();
  }, [currentPage]);

  const loadPendingCampaigns = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      



      
      const response = await adminReviewService.getPendingReviewCampaigns(params);
      setCampaigns(response.data || []);
      setPagination(response.pagination || {
        total: 0,
        totalPages: 0,
        hasMore: false,
        hasPrevious: false,
      });
    } catch (err) {
      console.error('Error loading pending campaigns:', err);
      toast.error('Gagal memuat kampanye yang tertunda');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (campaignId) => {
    try {
      await adminReviewService.approveCampaign(campaignId);
      toast.success('✅ Kampanye disetujui! UMKM sekarang dapat melanjutkan pembayaran.');
      loadPendingCampaigns();
    } catch (err) {
      console.error('Error approving campaign:', err);
      toast.error('Gagal menyetujui kampanye');
    }
  };

  const handleRejectClick = (campaignId) => {
    setRejectDialog({
      open: true,
      campaignId,
      reason: '',
    });
  };

  const handleRejectConfirm = async () => {
    if (!rejectDialog.reason.trim()) {
      toast.error('Mohon berikan alasan penolakan');
      return;
    }

    try {
      await adminReviewService.rejectCampaign(rejectDialog.campaignId, rejectDialog.reason);
      toast.success('Kampanye ditolak');
      setRejectDialog({ open: false, campaignId: null, reason: '' });
      loadPendingCampaigns();
    } catch (err) {
      console.error('Error rejecting campaign:', err);
      toast.error('Gagal menolak kampanye');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

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
        <Box sx={{ mt: 9, bgcolor: '#f7fafc', minHeight: 'calc(100vh - 72px)' }}>
          <Container maxWidth={false} sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 4 }}>
              Tinjauan Kampanye ({pagination.total} Tertunda)
            </Typography>

            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: COLORS.textSecondary }}>Memuat kampanye...</Typography>
              </Box>
            ) : campaigns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: COLORS.textSecondary }}>Tidak ada kampanye yang menunggu tinjauan</Typography>
              </Box>
            ) : (
              campaigns.map(campaign => (
                <Card key={campaign.campaign_id} sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.textPrimary, mb: 1 }}>
                          {campaign.title}
                        </Typography>
                        <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>
                          oleh {campaign.user?.name || 'Unknown'} • Dikirim {formatDate(campaign.created_at)}
                        </Typography>
                      </Box>
                      <Chip 
                        label="Menunggu Tinjauan" 
                        sx={{ 
                          bgcolor: '#fff3cd', 
                          color: '#856404',
                          fontWeight: 600 
                        }} 
                      />
                    </Stack>

                    {/* Campaign Info */}
                    <Stack direction="row" spacing={3} flexWrap="wrap">
                      <Box>
                        <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>Kategori</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{campaign.campaign_category || '-'}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>Influencer</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{campaign.influencer_count || 0}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>Anggaran/Influencer</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(campaign.price_per_post)}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>Periode</Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={2} pt={2} borderTop={1} borderColor={COLORS.border}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/campaign/${campaign.campaign_id}/detail`)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Lihat Detail
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(campaign.campaign_id)}
                        sx={{
                          bgcolor: '#10b981',
                          '&:hover': { bgcolor: '#059669' },
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Setujui
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleRejectClick(campaign.campaign_id)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Tolak
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))
            )}

            {/* Pagination */}
            {!isLoading && pagination.total > 0 && pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
                <Button
                  variant="outlined"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Sebelumnya
                </Button>
                <Typography sx={{ px: 2, py: 1, color: COLORS.textSecondary }}>
                  Halaman {currentPage} dari {pagination.totalPages}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Selanjutnya
                </Button>
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, campaignId: null, reason: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Tolak Kampanye</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: COLORS.textSecondary }}>
            Mohon berikan alasan penolakan. Ini akan ditampilkan kepada UMKM.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Alasan Penolakan"
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
            placeholder="contoh: Konten kampanye melanggar pedoman, anggaran tidak mencukupi, dll."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, campaignId: null, reason: '' })}>
            Batal
          </Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm}>
            Tolak Kampanye
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminReview;
