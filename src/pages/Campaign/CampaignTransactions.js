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
  DialogActions,
  DialogTitle,
  Card,
  InputAdornment
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Undo as UndoIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Download as DownloadIcon,
  CreditCard as CreditCardIcon,
  Wallet as WalletIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/helpers';
import transactionService from '../../services/transactionService';
import withdrawalService from '../../services/withdrawalService';
import { COLORS } from '../../constants/colors';

function CampaignTransactions() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id: campaignId } = useParams(); // Optional: allow filtering by campaign if needed via URL
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: My Payments, 1: Distributions, 2: Withdrawals
  
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState({ current_balance: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Withdrawal Form State
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;
      let data = [];

      // Always fetch balance
      try {
        const balanceRes = await transactionService.getBalance();
        setBalance(balanceRes.data || { current_balance: 0 });
      } catch (err) {
        console.error("Error fetching balance:", err);
      }

      // Tab 0: My Payments (Pemasukan/Topup) - /payments/my-payments
      // Tab 1: Distributions (Pengeluaran) - /campaign-payments/history
      // Tab 2: Withdrawals - /withdrawals/my-withdrawals
      
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
        setTransactions(data);
      } else if (activeTab === 1) {
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
        setTransactions(data);
      } else if (activeTab === 2) {
        const response = await withdrawalService.getMyWithdrawals(params);
        setWithdrawals(response.data?.withdrawals || []);
      }
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [campaignId, filterStatus, searchQuery, activeTab]);

  const handleWithdrawSubmit = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > balance.current_balance) {
      showToast("Insufficient balance", "error");
      return;
    }
    if (!bankName || !accountNumber || !accountHolder) {
      showToast("Please fill in all bank details", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await withdrawalService.requestWithdrawal({
        amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolder
      });
      showToast("Withdrawal requested successfully", "success");
      setOpenWithdrawDialog(false);
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
      loadData(); // Refresh data
    } catch (error) {
      console.error("Withdrawal error:", error);
      showToast(error.response?.data?.message || "Failed to request withdrawal", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'paid': 
      case 'success':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'refunded': return { bg: '#fef3c7', color: '#92400e' };
      case 'pending': return { bg: '#fff3cd', color: '#856404' };
      case 'failed':
      case 'rejected':
         return { bg: '#fee2e2', color: '#b91c1c' };
      default: return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  const translateStatus = (status) => {
    switch(status?.toLowerCase()) {
      case 'success': return 'Berhasil';
      case 'completed': return 'Selesai';
      case 'paid': return 'Dibayar';
      case 'pending': return 'Menunggu';
      case 'failed': return 'Gagal';
      case 'rejected': return 'Ditolak';
      case 'refunded': return 'Dikembalikan';
      case 'draft': return 'Draft';
      default: return status || '-';
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
                Lihat semua riwayat transaksi, pembayaran, distribusi, dan penarikan
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

          {/* Balance Card */}
          <Card sx={{ 
            p: 4, 
            background: '#6E00BE', 
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(110, 0, 190, 0.2)',
            mb: 4
          }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={3}>
              <Box>
                <Typography variant="body1" sx={{ opacity: 0.8, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WalletIcon fontSize="small" /> Saldo Tersedia
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {formatCurrency(balance.current_balance || 0)}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: 'white', 
                  color: '#6E00BE',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
                onClick={() => setOpenWithdrawDialog(true)}
              >
                Tarik Dana
              </Button>
            </Stack>
          </Card>

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
              <Tab label="Riwayat Penarikan" sx={{ textTransform: 'none', fontWeight: 600, fontSize: 15 }} />
            </Tabs>
          </Paper>

          {/* Statistics Cards - Only show for Transaction tabs to avoid confusion */}
          {activeTab !== 2 && (
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
                  title: 'Total Dikembalikan',
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
          )}

          {/* Filters - Only for transactions */}
          {activeTab !== 2 && (
            <Paper sx={{ bgcolor: '#fff', borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e2e8f0' }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Box sx={{ flex: 1, minWidth: isMobile ? '100%' : 300 }}>
                  <TextField
                    fullWidth
                    placeholder="Cari transaksi..."
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
                    <MenuItem value="Paid">Dibayar</MenuItem>
                    <MenuItem value="Refunded">Dikembalikan</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Paper>
          )}

          {/* Table Content */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: isMobile ? 'auto' : 'hidden' }}>
            <Table sx={{ minWidth: isMobile ? 800 : 'auto', fontFamily: 'Inter, sans-serif' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f7fafc' }}>
                  {activeTab === 2 ? (
                    <>
                       <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Tanggal Request</TableCell>
                       <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Info Bank</TableCell>
                       <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Pemilik Rekening</TableCell>
                       <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Status</TableCell>
                       <TableCell align="right" sx={{ py: 2, pr: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Jumlah</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>ID</TableCell>
                      <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>kampanye</TableCell>
                      <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Nominal</TableCell>
                      <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Status</TableCell>
                      <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Tanggal</TableCell>
                      <TableCell align="center" sx={{ py: 2, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Aksi</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                   <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#6c757d' }}>
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {activeTab === 2 ? (
                      // Withdrawals Table Body
                      withdrawals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 5, color: '#6c757d' }}>
                            Tidak ada riwayat penarikan
                          </TableCell>
                        </TableRow>
                      ) : (
                        withdrawals.map((wd) => (
                          <TableRow key={wd.withdrawal_id} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                             <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, color: '#1a1f36' }}>
                               {formatDate(wd.request_date)}
                             </TableCell>
                             <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, color: '#1a1f36' }}>
                               {wd.bank_name} - {wd.account_number}
                             </TableCell>
                             <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, color: '#1a1f36' }}>
                               {wd.account_holder_name}
                             </TableCell>
                             <TableCell sx={{ py: 2.5, pl: 3 }}>
                               <Chip 
                                 label={translateStatus(wd.status)} 
                                 sx={{ 
                                   fontSize: 12, 
                                   fontWeight: 600, 
                                   borderRadius: 1.5,
                                   textTransform: 'capitalize',
                                   bgcolor: getStatusColor(wd.status).bg, 
                                   color: getStatusColor(wd.status).color 
                                 }} 
                               />
                             </TableCell>
                             <TableCell align="right" sx={{ py: 2.5, pr: 3, fontSize: 14, fontWeight: 700, color: '#1a1f36' }}>
                               {formatCurrency(wd.amount)}
                             </TableCell>
                          </TableRow>
                        ))
                      )
                    ) : (
                      // Transactions Table Body
                      transactions.length === 0 ? (
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
                              <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 600, color: '#6E00BE' }}>
                                {trx.normalizedId || '-'}
                              </TableCell>
                              <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                                {trx.normalizedCampaign || '-'}
                              </TableCell>
                              <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 700, color: '#1a1f36' }}>
                                {formatCurrency(parseFloat(trx.normalizedAmount) || 0)}
                              </TableCell>
                              <TableCell sx={{ py: 2.5, pl: 3 }}>
                                <Chip 
                                  label={translateStatus(trx.normalizedStatus)} 
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
                                    bgcolor: '#6E00BE',
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
                      )
                    )}
                  </>
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
            bgcolor: '#6E00BE',
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
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Kampanye</Typography>
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
                  {formatCurrency(parseFloat(selectedTransaction.normalizedAmount) || 0)}
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
                  label={translateStatus(selectedTransaction.normalizedStatus)} 
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
              sx={{ flex: 1, py: 1.2, bgcolor: COLORS.gradient, borderRadius: 1.5, color: '#6E00BE', fontWeight: 600, textTransform: 'none', boxShadow: 'none', '& .MuiButton-startIcon': { mr: 1 } }}
              startIcon={<DownloadIcon sx={{ color: '#6E00BE' }} />}
            >
              Unduh Bukti Transaksi
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Withdrawal Dialog */}
      <Dialog open={openWithdrawDialog} onClose={() => setOpenWithdrawDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
          Tarik Dana
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Saldo Tersedia</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {formatCurrency(balance.current_balance || 0)}
            </Typography>
          </Box>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Jumlah"
              type="number"
              fullWidth
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
              }}
            />
            <TextField
              label="Nama Bank"
              fullWidth
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. BCA, Mandiri"
            />
            <TextField
              label="Nomor Rekening"
              fullWidth
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <TextField
              label="Nama Pemilik Rekening"
              fullWidth
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenWithdrawDialog(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleWithdrawSubmit} 
            disabled={isSubmitting}
            sx={{ bgcolor: '#6E00BE', '&:hover': { bgcolor: '#5a009e' } }}
          >
            {isSubmitting ? 'Memproses...' : 'Ajukan Penarikan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CampaignTransactions;
