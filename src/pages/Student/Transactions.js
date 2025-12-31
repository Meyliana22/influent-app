import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Chip,
  TextField,
  ThemeProvider,
  createTheme,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Stack,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  ErrorOutline,
  Wallet,
  TrendingUp,
  History,
  CreditCard,
  AccountBalance,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import transactionService from '../../services/transactionService';
import withdrawalService from '../../services/withdrawalService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/helpers';

const theme = createTheme({
  palette: {
    primary: { main: '#6E00BE' },
    secondary: { main: '#5a009e' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: { default: '#f9fafb', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#6b7280' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

function Transactions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState({ current_balance: 0, total_earned: 0, total_withdrawn: 0 });
  const [loading, setLoading] = useState(false);
  
  // Withdrawal Form State
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balanceRes, transactionsRes, withdrawalsRes] = await Promise.all([
        transactionService.getBalance(),
        transactionService.getMyTransactions(),
        withdrawalService.getMyWithdrawals()
      ]);

      setBalance(balanceRes.data || { current_balance: 0 });
      setTransactions(transactionsRes.data?.transactions || []);
      setWithdrawals(withdrawalsRes.data?.withdrawals || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Don't show toast on initial load to avoid spam if one fails
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleWithdrawSubmit = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > balance.current_balance) {
      showToast("Saldo tidak mencukupi", "error");
      return;
    }
    if (!bankName || !accountNumber || !accountHolder) {
      showToast("Harap isi semua detail bank", "error");
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
      showToast("Penarikan berhasil diminta", "success");
      setOpenWithdrawDialog(false);
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Withdrawal error:", error);
      showToast(error.response?.data?.message || "Gagal meminta penarikan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const translateStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Selesai';
      case 'pending': return 'Menunggu';
      case 'failed': return 'Gagal';
      case 'rejected': return 'Ditolak';
      case 'approved': return 'Disetujui';
      case 'processed': return 'Diproses';
      default: return status || '-';
    }
  };

  const translateType = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit': return 'Pemasukan';
      case 'debit': return 'Pengeluaran';
      default: return type?.toUpperCase() || '-';
    }
  };

  const translateCategory = (category) => {
    switch (category?.toLowerCase()) {
      case 'campaign_payment': return 'Pembayaran Kampanye';
      case 'withdrawal': return 'Penarikan Dana';
      case 'refund': return 'Pengembalian Dana';
      case 'bonus': return 'Bonus';
      default: return category?.replace('_', ' ') || '-';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box sx={{ flex: 1, ml: { md: '260px' }, width: { xs: '100%', md: 'calc(100% - 260px)' } }}>
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          
          <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h4" fontWeight="900" color="text.primary" gutterBottom>
                  Dompet Saya
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Kelola pendapatan dan penarikan Anda
                </Typography>
              </Box>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={fetchData}
                variant="outlined"
              >
                Segarkan
              </Button>
            </Box>

            {/* Balance Cards */}
            <Box sx={{ mb: 4 }}>
              <Card sx={{ 
                p: 4, 
                background: '#6E00BE', 
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 10px 30px rgba(110, 0, 190, 0.2)'
              }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={3}>
                  <Box>
                    <Typography variant="body1" sx={{ opacity: 0.8, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Wallet fontSize="small" /> Saldo Saat Ini
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
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{ px: 2 }}
              >
                <Tab label="Transaksi" icon={<History />} iconPosition="start" />
                <Tab label="Penarikan" icon={<AccountBalance />} iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Transactions Tab */}
            {tabValue === 0 && (
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                      <TableRow>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Deskripsi</TableCell>
                        <TableCell>Kategori</TableCell>
                        <TableCell>Tipe</TableCell>
                        <TableCell align="right">Jumlah</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <TableRow key={tx.transaction_id} hover>
                            <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell>
                              <Chip 
                                label={translateCategory(tx.category)} 
                                size="small" 
                                sx={{ textTransform: 'capitalize' }} 
                              />
                            </TableCell>
                            <TableCell>
                              <Typography color={tx.type === 'credit' ? 'success.main' : 'error.main'} fontWeight="600" fontSize="0.875rem">
                                {translateType(tx.type)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="600" color={tx.type === 'credit' ? 'success.main' : 'text.primary'}>
                                {tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">Tidak ada transaksi ditemukan</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* Withdrawals Tab */}
            {tabValue === 1 && (
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                      <TableRow>
                        <TableCell>Tanggal Permintaan</TableCell>
                        <TableCell>Info Bank</TableCell>
                        <TableCell>Pemilik Rekening</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Jumlah</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {withdrawals.length > 0 ? (
                        withdrawals.map((wd) => (
                          <TableRow key={wd.withdrawal_id} hover>
                            <TableCell>{new Date(wd.request_date).toLocaleDateString()}</TableCell>
                            <TableCell>{wd.bank_name} - {wd.account_number}</TableCell>
                            <TableCell>{wd.account_holder_name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={translateStatus(wd.status)} 
                                color={getStatusColor(wd.status)}
                                size="small"
                                sx={{ textTransform: 'capitalize', fontWeight: 'bold' }} 
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="600">
                                {formatCurrency(wd.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">Tidak ada riwayat penarikan</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

          </Container>
        </Box>

        {/* Withdrawal Dialog */}
        <Dialog open={openWithdrawDialog} onClose={() => setOpenWithdrawDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
            Ajukan Penarikan
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
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}

export default Transactions;
