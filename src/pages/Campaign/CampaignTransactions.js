import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  Grid,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Undo as UndoIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Download as DownloadIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';

import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/helpers';
import transactionService from '../../services/transactionService';
import { COLORS } from '../../constants/colors';

function CampaignTransactions() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id: campaignId } = useParams(); // Optional: allow filtering by campaign if needed via URL
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: My Payments, 1: Distributions
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;
      let data = [];

      // Tab 0: My Payments (Pemasukan/Topup) - /payments/my-payments
      // Tab 1: Distributions (Pengeluaran) - /campaign-payments/history
      
      if (activeTab === 0) {
        const response = await transactionService.getMyPayments(params);
        data = response.data || [];
        data = data.map(item => ({
          ...item,
          normalizedId: item.payment_id,
          normalizedCampaign: item.Campaign?.title,
          normalizedUser: '-', 
          normalizedDate: item.created_at,
          normalizedAmount: item.amount,
          normalizedStatus: item.status,
          normalizedType: 'Payment'
        }));
      } else {
        if (campaignId) params.campaign_id = campaignId;
        const response = await transactionService.getPaymentHistory(params);
        data = response.data || [];
        data = data.map(item => ({
          ...item,
          normalizedId: item.id,
          normalizedCampaign: item.details?.campaign_title,
          normalizedUser: item.details?.student_name,
          normalizedDate: item.date,
          normalizedAmount: item.amount,
          normalizedStatus: item.status,
          normalizedType: 'Distribution'
        }));
      }
      
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [campaignId, filterStatus, searchQuery, activeTab]);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'paid': 
      case 'success':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'refunded': return { bg: '#fef3c7', color: '#92400e' };
      case 'pending': return { bg: '#fff3cd', color: '#856404' };
      case 'failed': return { bg: '#fee2e2', color: '#b91c1c' };
      default: return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  const totalPaid = transactions
    .filter(t => t.normalizedStatus?.toLowerCase() === 'completed' || t.normalizedStatus?.toLowerCase() === 'paid' || t.normalizedStatus?.toLowerCase() === 'success')
    .reduce((sum, t) => sum + (parseFloat(t.normalizedAmount) || 0), 0);
    
  const totalRefunded = transactions
    .filter(t => t.normalizedStatus?.toLowerCase() === 'refunded')
    .reduce((sum, t) => sum + (parseFloat(t.normalizedAmount) || 0), 0);

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f7fafc', minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box sx={{ ml: !isMobile ? 32.5 : 0, width: '100%' }}>
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Container
          maxWidth="lg"
          sx={{
            mt: 9,
            pb: 4,
            height: 'calc(100vh - 72px)',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} sx={{ color: '#1a1f36', m: 0, fontFamily: 'Inter, sans-serif' }}>
                 Riwayat Transaksi
              </Typography>
              <Typography sx={{ fontSize: 15, color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>
                Lihat semua riwayat transaksi, pembayaran, dan pengembalian dana
              </Typography>
            </Box>
            {/* If we are in a filtered view, allow clearing it */}
            {campaignId && (
              <Button 
                variant="outlined" 
                onClick={() => navigate('/campaign/transactions')}
                sx={{ ml: 'auto', textTransform: 'none' }}
              >
                Lihat Semua Transaksi
              </Button>
            )}
          </Box>

          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              textColor="primary"
              indicatorColor="primary"
              sx={{ px: 2, pt: 1 }}
            >
              <Tab label="Riwayat Pembayaran" sx={{ textTransform: 'none', fontWeight: 600, fontSize: 15 }} />
              <Tab label="Riwayat Distribusi" sx={{ textTransform: 'none', fontWeight: 600, fontSize: 15 }} />
            </Tabs>
          </Paper>

          {/* Statistics Cards */}
          <Box sx={{ display: 'flex', gap: isMobile ? 2 : 2.5, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            {[
              {
                title: 'Total Dibayarkan',
                value: `Rp ${totalPaid.toLocaleString('id-ID')}`,
                IconComponent: CheckCircleIcon,
                color: '#10b981',
                bgColor: '#d1fae5',
                count: transactions.filter(t => t.status?.toLowerCase() === 'paid' || t.status?.toLowerCase() === 'success').length
              },
              {
                title: 'Total Direfund',
                value: `Rp ${totalRefunded.toLocaleString('id-ID')}`,
                IconComponent: UndoIcon,
                color: '#f59e0b',
                bgColor: '#fef3c7',
                count: transactions.filter(t => t.status?.toLowerCase() === 'refunded').length
              },
              {
                title: 'Total Transaksi',
                value: transactions.length,
                IconComponent: AccountBalanceWalletIcon,
                color: '#3b82f6',
                bgColor: '#dbeafe',
                count: 'Semua'
              }
            ].map((stat, index) => (
              <Paper
                key={index}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: '#fff',
                  borderRadius: 2,
                  p: 3,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.IconComponent sx={{ fontSize: 28, color: stat.color }} />
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: 13, color: '#6c757d', mb: 1, fontFamily: 'Inter, sans-serif' }}>{stat.title}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1a1f36', mb: 0.5, fontFamily: 'Inter, sans-serif' }}>{stat.value}</Typography>
                <Typography sx={{ fontSize: 12.5, color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>{stat.count} transaksi</Typography>
              </Paper>
            ))}
          </Box>

          {/* Filters */}
          <Paper sx={{ bgcolor: '#fff', borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e2e8f0' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: isMobile ? '100%' : 300 }}>
                <TextField
                  fullWidth
                  placeholder="Cari transaksi (ID, Campaign, Influencer)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="medium"
                  sx={{
                    '& .MuiInputBase-root': { fontFamily: 'Inter, sans-serif' },
                  }}
                />
              </Box>
              <FormControl sx={{ minWidth: 150 }} size="medium">
                <InputLabel id="filter-status-label">Status</InputLabel>
                <Select
                  labelId="filter-status-label"
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Transactions Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: isMobile ? 'auto' : 'hidden' }}>
            <Table sx={{ minWidth: isMobile ? 800 : 'auto', fontFamily: 'Inter, sans-serif' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f7fafc' }}>
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>ID</TableCell>
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Campaign</TableCell>
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Nominal</TableCell>
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Status</TableCell>
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Tanggal</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                   <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#6c757d' }}>
                      Memuat data transaksi...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#6c757d' }}>
                      Tidak ada transaksi ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((trx) => {
                    const statusStyle = getStatusColor(trx.status);
                    return (
                      <TableRow key={trx.normalizedId} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 600, color: '#667eea' }}>
                          {trx.normalizedId || '-'}
                        </TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                          {trx.normalizedCampaign || '-'}
                        </TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 700, color: '#1a1f36' }}>
                          Rp {(parseFloat(trx.normalizedAmount) || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3 }}>
                          <Chip 
                            label={trx.normalizedStatus} 
                            sx={{ 
                              fontSize: 12, 
                              fontWeight: 600, 
                              bgcolor: statusStyle.bg, 
                              color: statusStyle.color 
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, color: '#6c757d' }}>
                          {formatDate(trx.normalizedDate)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2.5 }}>
                          <Button
                            onClick={() => handleViewDetails(trx)}
                            variant="contained"
                            sx={{
                              bgcolor: '#667eea',
                              borderRadius: 3,
                              fontWeight: 600,
                              py: 1,
                              px: 2,
                              fontSize: 13,
                              color: '#fff',
                              textTransform: 'none'
                            }}
                          >
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <Dialog open onClose={() => setShowDetailModal(false)} maxWidth="sm" fullWidth PaperProps={{
          sx: {
            borderRadius: 6,
            bgcolor: '#f7fafc',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
            overflow: 'visible',
          }
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#667eea',
            color: '#fff',
            px: 4,
            py: 2.5,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            position: 'relative',
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#fff' }} />
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontFamily: 'Inter, sans-serif', mb: 0.2 }}>
                  Detail Transaksi
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif' }}>
                  {selectedTransaction.normalizedId}
                </Typography>
              </Box>
            </Stack>
            <Button onClick={() => setShowDetailModal(false)} sx={{
              minWidth: 36,
              minHeight: 36,
              bgcolor: 'rgba(255,255,255,0.12)',
              color: '#fff',
              borderRadius: '50%',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
              position: 'absolute',
              right: 18,
              top: 18,
              fontSize: 22,
              p: 0,
            }}>✕</Button>
          </Box>
          <DialogContent sx={{ pt: 4, pb: 2.5, px: 4, bgcolor: '#f7fafc' }}>
            <Grid container spacing={3} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Campaign</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>
                  {selectedTransaction.normalizedCampaign || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>{selectedTransaction.normalizedType === 'Distribution' ? 'Influencer' : 'User'}</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>
                  {selectedTransaction.normalizedUser || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Nominal</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>
                  Rp {(parseFloat(selectedTransaction.normalizedAmount) || 0).toLocaleString('id-ID')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Metode Pembayaran</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>
                  {selectedTransaction.paymentMethod || selectedTransaction.payment_type || 'Transfer'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Tanggal</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>
                  {formatDate(selectedTransaction.normalizedDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Status</Typography>
                <Chip 
                  label={selectedTransaction.normalizedStatus} 
                  sx={{ 
                    fontSize: 13, 
                    fontWeight: 700, 
                    borderRadius: 1.5, 
                    bgcolor: getStatusColor(selectedTransaction.normalizedStatus).bg, 
                    color: getStatusColor(selectedTransaction.normalizedStatus).color, 
                    px: 1.5, py: 0.5 
                  }} 
                />
              </Grid>
            </Grid>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 1, fontWeight: 500 }}>Deskripsi</Typography>
              <Box sx={{ fontSize: 14, color: '#2d3748', lineHeight: 1.7, p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', minHeight: 56 }}>
                {selectedTransaction.description || '-'}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 3, bgcolor: '#f7fafc', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
            <Button
              onClick={() => showToast('Bukti transaksi berhasil diunduh!', 'success')}
              sx={{ flex: 1, py: 1.2, bgcolor: COLORS.gradient, borderRadius: 1.5, color: '#667eea', fontWeight: 600, textTransform: 'none', boxShadow: 'none', '& .MuiButton-startIcon': { mr: 1 } }}
              startIcon={<DownloadIcon sx={{ color: '#667eea' }} />}
            >
              Unduh Bukti Transaksi
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default CampaignTransactions;
