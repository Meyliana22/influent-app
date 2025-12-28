import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { Sidebar, Topbar } from '../../components/common';
import adminService from '../../services/adminService';
import { COLORS } from '../../constants/colors';

function AdminTransactions() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  // Keep sidebarOpen in sync with screen size
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Load transactions
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.transactions.getAllTransactions();
      
      // Handle flexible response structure
      let transactionsData = [];
      if (Array.isArray(response)) {
        transactionsData = response;
      } else if (response.transactions) {
        transactionsData = response.transactions;
      } else if (response.data) {
        transactionsData = Array.isArray(response.data) ? response.data : response.data.transactions || [];
      }

      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalTransactions: transactions.length,
    totalRevenue: transactions
      .filter(t => t.type === 'credit' || t.transaction_type === 'credit')
      .reduce((sum, t) => sum + (parseInt(t.amount) || 0), 0),
    totalExpenses: transactions
      .filter(t => t.type === 'debit' || t.transaction_type === 'debit')
      .reduce((sum, t) => sum + (parseInt(t.amount) || 0), 0),
    pendingCount: transactions.filter(t => 
      (t.status || t.transaction_status) === 'pending'
    ).length
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const type = transaction.type || transaction.transaction_type || '';
    const category = transaction.category || transaction.transaction_category || '';
    const status = transaction.status || transaction.transaction_status || '';
    const description = transaction.description || '';
    const userName = transaction.user?.name || transaction.user_name || '';
    const transactionId = transaction.transaction_id || transaction.id || '';

    const matchesSearch = searchQuery === '' || 
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transactionId.toString().toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || type === filterType;
    const matchesCategory = filterCategory === 'all' || category === filterCategory;
    const matchesStatus = filterStatus === 'all' || status === filterStatus;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // Pagination
  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleExport = () => {
    // Simple CSV export
    const csvContent = [
      ['ID', 'Date', 'User', 'Type', 'Category', 'Amount', 'Status', 'Description'].join(','),
      ...filteredTransactions.map(t => [
        t.transaction_id || t.id,
        new Date(t.created_at || t.transaction_date).toLocaleDateString(),
        t.user?.name || t.user_name || '-',
        t.type || t.transaction_type,
        t.category || t.transaction_category,
        t.amount,
        t.status || t.transaction_status,
        `"${(t.description || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTypeColor = (type) => {
    const normalizedType = (type || '').toLowerCase();
    if (normalizedType === 'credit') return 'success';
    if (normalizedType === 'debit') return 'error';
    return 'default';
  };

  const getStatusColor = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus === 'completed' || normalizedStatus === 'success') return 'success';
    if (normalizedStatus === 'pending') return 'warning';
    if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') return 'error';
    return 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f7fafc', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box sx={{ ml: isDesktop ? '260px' : 0, width: isDesktop ? 'calc(100% - 260px)' : '100%' }}>
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1 }}>
              Manajemen Transaksi
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Lihat dan kelola semua transaksi platform
            </Typography>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#6E00BE', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Transaksi
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.totalTransactions}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#10b981', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Pendapatan
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#ef4444', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Pengeluaran
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatCurrency(stats.totalExpenses)}
                    </Typography>
                  </Box>
                  <PaymentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#f59e0b', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Tertunda
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.pendingCount}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters and Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipe</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Tipe"
                  >
                    <MenuItem value="all">Semua Tipe</MenuItem>
                    <MenuItem value="credit">Kredit</MenuItem>
                    <MenuItem value="debit">Debit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Kategori"
                  >
                    <MenuItem value="all">Semua Kategori</MenuItem>
                    <MenuItem value="campaign">Kampanye</MenuItem>
                    <MenuItem value="withdrawal">Penarikan</MenuItem>
                    <MenuItem value="refund">Pengembalian Dana</MenuItem>
                    <MenuItem value="payment">Pembayaran</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">Semua Status</MenuItem>
                    <MenuItem value="completed">Selesai</MenuItem>
                    <MenuItem value="pending">Tertunda</MenuItem>
                    <MenuItem value="failed">Gagal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadTransactions}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExport}
                    sx={{ bgcolor: '#6E00BE', '&:hover': { bgcolor: '#5a009e' } }}
                  >
                    Ekspor
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Transactions Table */}
          <Paper sx={{ overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 3 }}>
                {error}
              </Alert>
            ) : filteredTransactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Tidak ada transaksi ditemukan
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tanggal</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Pengguna</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tipe</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Kategori</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Jumlah</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTransactions.map((transaction) => {
                        const transactionId = transaction.transaction_id || transaction.id;
                        const type = transaction.type || transaction.transaction_type;
                        const category = transaction.category || transaction.transaction_category;
                        const status = transaction.status || transaction.transaction_status;
                        const userName = transaction.user?.name || transaction.user_name || '-';
                        const createdAt = transaction.created_at || transaction.transaction_date;

                        return (
                          <TableRow key={transactionId} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                #{transactionId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>{userName}</TableCell>
                            <TableCell>
                              <Chip
                                label={type?.toUpperCase() || '-'}
                                color={getTypeColor(type)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {category || '-'}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: type === 'credit' ? '#10b981' : '#ef4444'
                                }}
                              >
                                {type === 'credit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={status?.replace('_', ' ') || '-'}
                                color={getStatusColor(status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetail(transaction)}
                              >
                                Lihat
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredTransactions.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Detail Transaksi
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">ID Transaksi</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  #{selectedTransaction.transaction_id || selectedTransaction.id}
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tanggal</Typography>
                  <Typography variant="body2">
                    {formatDate(selectedTransaction.created_at || selectedTransaction.transaction_date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Pengguna</Typography>
                  <Typography variant="body2">
                    {selectedTransaction.user?.name || selectedTransaction.user_name || '-'}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tipe</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={(selectedTransaction.type || selectedTransaction.transaction_type)?.toUpperCase()}
                      color={getTypeColor(selectedTransaction.type || selectedTransaction.transaction_type)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedTransaction.status || selectedTransaction.transaction_status}
                      color={getStatusColor(selectedTransaction.status || selectedTransaction.transaction_status)}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary">Kategori</Typography>
                <Typography variant="body2">
                  {selectedTransaction.category || selectedTransaction.transaction_category || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Jumlah</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1f36' }}>
                  {formatCurrency(selectedTransaction.amount)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Deskripsi</Typography>
                <Typography variant="body2">
                  {selectedTransaction.description || '-'}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminTransactions;
