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
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Done as DoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Sidebar, Topbar } from '../../components/common';
import adminService from '../../services/adminService';
import { COLORS } from '../../constants/colors';

function ManageWithdrawals() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  // Keep sidebarOpen in sync with screen size
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // State management
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  
  // Form data
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [transferProof, setTransferProof] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Load withdrawals
  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.withdrawals.getAllWithdrawals();
      
      // Handle flexible response structure
      let withdrawalsData = [];
      if (Array.isArray(response)) {
        withdrawalsData = response;
      } else if (response.withdrawals) {
        withdrawalsData = response.withdrawals;
      } else if (response.data) {
        withdrawalsData = Array.isArray(response.data) ? response.data : response.data.withdrawals || [];
      }

      setWithdrawals(withdrawalsData);
    } catch (err) {
      console.error('Error loading withdrawals:', err);
      setError(err.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalWithdrawals: withdrawals.length,
    pendingCount: withdrawals.filter(w => 
      (w.status || w.withdrawal_status) === 'pending'
    ).length,
    approvedCount: withdrawals.filter(w => 
      (w.status || w.withdrawal_status) === 'approved'
    ).length,
    completedCount: withdrawals.filter(w => 
      (w.status || w.withdrawal_status) === 'completed'
    ).length,
    totalAmount: withdrawals
      .filter(w => (w.status || w.withdrawal_status) === 'completed')
      .reduce((sum, w) => sum + (w.amount || 0), 0)
  };

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const status = (withdrawal.status || withdrawal.withdrawal_status || '').toLowerCase();
    const userName = withdrawal.user?.name || withdrawal.user_name || '';
    const bankName = withdrawal.bank_name || '';
    const accountName = withdrawal.account_name || '';
    const withdrawalId = withdrawal.withdrawal_id || withdrawal.id || '';

    const matchesSearch = searchQuery === '' || 
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawalId.toString().toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const paginatedWithdrawals = filteredWithdrawals.slice(
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

  const handleViewDetail = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setDetailModalOpen(true);
  };

  const handleApproveClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setReviewNotes('');
    setApproveModalOpen(true);
  };

  const handleRejectClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleCompleteClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setReviewNotes('');
    setTransferProof(null);
    setCompleteModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      const withdrawalId = selectedWithdrawal.withdrawal_id || selectedWithdrawal.id;
      await adminService.withdrawals.approveWithdrawal(withdrawalId, reviewNotes);
      
      setSuccessMessage('Withdrawal approved successfully!');
      setApproveModalOpen(false);
      loadWithdrawals();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error approving withdrawal:', err);
      setError(err.message || 'Failed to approve withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const withdrawalId = selectedWithdrawal.withdrawal_id || selectedWithdrawal.id;
      await adminService.withdrawals.rejectWithdrawal(withdrawalId, rejectionReason);
      
      setSuccessMessage('Withdrawal rejected successfully!');
      setRejectModalOpen(false);
      loadWithdrawals();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error rejecting withdrawal:', err);
      setError(err.message || 'Failed to reject withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedWithdrawal || !transferProof) {
      setError('Transfer proof is required');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const withdrawalId = selectedWithdrawal.withdrawal_id || selectedWithdrawal.id;
      await adminService.withdrawals.completeWithdrawal(withdrawalId, transferProof, reviewNotes);
      
      setSuccessMessage('Withdrawal completed successfully!');
      setCompleteModalOpen(false);
      loadWithdrawals();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error completing withdrawal:', err);
      setError(err.message || 'Failed to complete withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus === 'completed') return 'success';
    if (normalizedStatus === 'approved') return 'info';
    if (normalizedStatus === 'pending') return 'warning';
    if (normalizedStatus === 'rejected' || normalizedStatus === 'cancelled') return 'error';
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
              Withdrawal Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Review and process withdrawal requests
            </Typography>
          </Box>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#6E00BE', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Requests
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.totalWithdrawals}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#f59e0b', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Pending
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.pendingCount}
                    </Typography>
                  </Box>
                  <HourglassEmptyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#3b82f6', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Approved
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.approvedCount}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#10b981', color: 'white' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Paid
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatCurrency(stats.totalAmount)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters and Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by user, bank, account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadWithdrawals}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Withdrawals Table */}
          <Paper sx={{ overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 3 }}>
                {error}
              </Alert>
            ) : filteredWithdrawals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No withdrawal requests found
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Bank Details</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedWithdrawals.map((withdrawal) => {
                        const withdrawalId = withdrawal.withdrawal_id || withdrawal.id;
                        const status = withdrawal.status || withdrawal.withdrawal_status;
                        const userName = withdrawal.user?.name || withdrawal.user_name || '-';
                        const createdAt = withdrawal.created_at || withdrawal.request_date;

                        return (
                          <TableRow key={withdrawalId} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                #{withdrawalId}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {userName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1f36' }}>
                                {formatCurrency(withdrawal.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {withdrawal.bank_name || '-'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {withdrawal.account_number || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={status?.replace('_', ' ').toUpperCase() || '-'}
                                color={getStatusColor(status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleViewDetail(withdrawal)}
                                    sx={{ color: '#6E00BE' }}
                                  >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                                {status === 'pending' && (
                                  <>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleApproveClick(withdrawal)}
                                      sx={{ color: '#10b981' }}
                                    >
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRejectClick(withdrawal)}
                                      sx={{ color: '#ef4444' }}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </>
                                )}
                                {status === 'approved' && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCompleteClick(withdrawal)}
                                    sx={{ color: '#10b981' }}
                                  >
                                    <DoneIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredWithdrawals.length}
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
            Withdrawal Request Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWithdrawal && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Request ID</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  #{selectedWithdrawal.withdrawal_id || selectedWithdrawal.id}
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">User</Typography>
                  <Typography variant="body2">
                    {selectedWithdrawal.user?.name || selectedWithdrawal.user_name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(selectedWithdrawal.amount)}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                <Typography variant="body2">{selectedWithdrawal.bank_name || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Account Number</Typography>
                <Typography variant="body2">{selectedWithdrawal.account_number || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Account Name</Typography>
                <Typography variant="body2">{selectedWithdrawal.account_name || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={(selectedWithdrawal.status || selectedWithdrawal.withdrawal_status)?.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(selectedWithdrawal.status || selectedWithdrawal.withdrawal_status)}
                    size="small"
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Request Date</Typography>
                <Typography variant="body2">
                  {formatDate(selectedWithdrawal.created_at || selectedWithdrawal.request_date)}
                </Typography>
              </Box>

              {(selectedWithdrawal.review_notes || selectedWithdrawal.rejection_reason) && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {selectedWithdrawal.rejection_reason ? 'Rejection Reason' : 'Review Notes'}
                    </Typography>
                    <Typography variant="body2">
                      {selectedWithdrawal.review_notes || selectedWithdrawal.rejection_reason}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Withdrawal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              This will approve the withdrawal request and allow it to proceed to payment.
            </Alert>
            <TextField
              label="Review Notes (Optional)"
              multiline
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveModalOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Withdrawal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Please provide a reason for rejecting this withdrawal request.
            </Alert>
            <TextField
              label="Rejection Reason *"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectModalOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={processing || !rejectionReason.trim()}
            startIcon={processing ? <CircularProgress size={16} /> : <CancelIcon />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Modal */}
      <Dialog open={completeModalOpen} onClose={() => setCompleteModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Complete Withdrawal
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info" icon={<UploadIcon />}>
              Upload transfer proof (image or PDF) to complete this withdrawal payment.
            </Alert>

            {selectedWithdrawal && (
              <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Amount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedWithdrawal.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Bank</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedWithdrawal.bank_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Account</Typography>
                    <Typography variant="body2">
                      {selectedWithdrawal.account_number} - {selectedWithdrawal.account_name}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{
                  py: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: transferProof ? '#10b981' : '#cbd5e1',
                  bgcolor: transferProof ? '#f0fdf4' : 'transparent',
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: '#f0fdf4'
                  }
                }}
              >
                {transferProof ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                    <Typography sx={{ fontWeight: 600 }}>
                      {transferProof.name}
                    </Typography>
                  </Stack>
                ) : (
                  'Click to Upload Transfer Proof *'
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setError('File size must be less than 5MB');
                        return;
                      }
                      setTransferProof(file);
                      setError(null);
                    }
                  }}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Accepted formats: JPG, PNG, PDF (Max 5MB)
              </Typography>
            </Box>

            {transferProof && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  File size: {(transferProof.size / 1024).toFixed(2)} KB
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => setTransferProof(null)}
                  startIcon={<CloseIcon />}
                >
                  Remove
                </Button>
              </Box>
            )}

            <TextField
              label="Review Notes (Optional)"
              multiline
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              fullWidth
              placeholder="Add any notes about this transfer..."
            />

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => {
            setCompleteModalOpen(false);
            setTransferProof(null);
            setReviewNotes('');
            setError(null);
          }} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={processing || !transferProof}
            startIcon={processing ? <CircularProgress size={16} /> : <DoneIcon />}
            sx={{
              px: 4,
              py: 1,
              background: processing || !transferProof ? undefined : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            {processing ? 'Processing...' : 'Complete Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ManageWithdrawals;
