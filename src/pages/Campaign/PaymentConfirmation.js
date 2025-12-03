import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { COLORS } from "../../constants/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import InfoIcon from "@mui/icons-material/Info";
import campaignService from "../../services/campaignService";
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

function PaymentConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await campaignService.getCampaignById(id);
        let data = response?.data?.data || response?.data || response;
        if (!data || !data.campaign_id) {
          toast.error("Campaign not found or invalid data");
          navigate("/campaigns");
          return;
        }
        setCampaign(data);
      } catch (err) {
        toast.error("Error loading campaign data");
        navigate("/campaigns");
      }
    };
    if (id) fetchCampaign();
    else navigate("/campaigns");
  }, [id, navigate]);

  const calculateCosts = () => {
    if (!campaign)
      return { total: 0, pricePerInfluencer: 0, influencerCount: 0 };
    const pricePerInfluencer = parseFloat(campaign.price_per_post) || 0;
    const influencerCount = parseInt(campaign.influencer_count) || 1;
    const total = pricePerInfluencer * influencerCount;
    return { total, pricePerInfluencer, influencerCount };
  };
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };
  const costs = calculateCosts();
  const handlePayment = async () => {
    try {
      const data = await campaignService.payment({
        campaign_id: campaign.campaign_id,
        user_id: campaign.student_id,
      });
      const redirectUrl = data?.snap.redirect_url;
      window.open(redirectUrl, "_blank");
      toast.success("✅ Pembayaran berhasil! Campaign Anda sekarang aktif dan dapat menerima pendaftaran dari influencer.");
      navigate("/campaigns");
    } catch (err) {
      toast.error("Error processing payment. Please try again.");
    }
  };
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!campaign) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: COLORS.background, fontFamily: 'Montserrat, Arial, sans-serif' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h1" sx={{ fontSize: 48, mb: 2 }}>⏳</Typography>
          <Typography sx={{ color: COLORS.textSecondary }}>Loading campaign data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: COLORS.background, minHeight: '100vh', pb: 6, fontFamily: 'Montserrat, Arial, sans-serif' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: !isMobile ? 32.5 : 0, flex: 1 }}>
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Container maxWidth="md" sx={{ pt: 6, pb: 6 }}>
          <Paper elevation={3} sx={{ borderRadius: 5, boxShadow: 6, p: { xs: 2, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/campaign-edit/${id}`)}
                sx={{ minWidth: 36, minHeight: 36, borderRadius: 2, p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 1, bgcolor: 'rgba(102,126,234,0.12)' }}
              >
                <ArrowBackIcon sx={{ fontSize: 16, color: COLORS.textPrimary }} />
              </Button>
              <Typography variant="h5" fontWeight={600} sx={{ flex: 1, color: COLORS.textPrimary }}>
                Konfirmasi Campaign
              </Typography>
            </Stack>
            <Box sx={{ bgcolor: COLORS.backgroundLight, borderRadius: 3, mb: 3, p: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: COLORS.textPrimary, borderBottom: '2px solid #667eea', pb: 1 }}>
                Draft Campaign
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>Jenis Campaign:</Typography>
                  <Typography fontWeight={600} sx={{ color: COLORS.textPrimary, fontSize: 15 }}>{campaign.campaign_category || '-'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>Deadline Proposal:</Typography>
                  <Typography fontWeight={600} sx={{ color: COLORS.textPrimary, fontSize: 15 }}>{formatDate(campaign.submission_deadline)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>Periode Campaign:</Typography>
                  <Typography fontWeight={600} sx={{ color: COLORS.textPrimary, fontSize: 15, textAlign: 'right' }}>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</Typography>
                </Stack>
              </Stack>
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: COLORS.textPrimary, borderBottom: '2px solid #667eea', pb: 1 }}>
                Biaya Campaign
              </Typography>
              <Box sx={{ bgcolor: COLORS.backgroundLight, borderRadius: 3, mb: 2, p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>Jumlah Influencer</Typography>
                    <Typography fontWeight={600} sx={{ color: COLORS.textPrimary, fontSize: 16 }}>{costs.influencerCount} influencer</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: '1px dashed #ddd' }}>
                    <Typography sx={{ color: COLORS.textSecondary, fontSize: 14 }}>Biaya per Influencer</Typography>
                    <Typography fontWeight={600} sx={{ color: COLORS.textPrimary, fontSize: 16 }}>{formatCurrency(costs.pricePerInfluencer)}</Typography>
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 3, boxShadow: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: COLORS.white }}>Total Bayar</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: COLORS.white }}>{formatCurrency(costs.total)}</Typography>
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#fff3cd', borderRadius: 3, border: '1px solid #ffc107', mb: 3, p: 2, display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, color: '#856404', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 1, m: 0 }}>
                <InfoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                Biaya campaign yang tidak terpakai akan dikembalikan ke saldo Anda.
              </Typography>
            </Box>
            <Button
              onClick={handlePayment}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                fontWeight: 700,
                py: 2,
                fontSize: 17,
                boxShadow: 3,
                color: '#fff',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
              startIcon={<PaymentIcon sx={{ fontSize: 24, color: COLORS.white }} />}
            >
              Proses Pembayaran
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default PaymentConfirmation;
