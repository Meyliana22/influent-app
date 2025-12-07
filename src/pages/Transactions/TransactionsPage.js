import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { COLORS } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function TransactionsPage() {
  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Responsive state for sidebar
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const transactions = [
    {
      id: 'TRX001',
      campaignName: 'Razer Mouse Review',
      influencer: 'User123',
      amount: 500000,
      status: 'Paid',
      date: '2024-10-01',
      paymentMethod: 'Transfer Bank',
      description: 'Payment for influencer collaboration'
    },
    {
      id: 'TRX002',
      campaignName: 'Product Launch Campaign',
      influencer: 'UserInfluencer',
      amount: 750000,
      status: 'Paid',
      date: '2024-10-05',
      paymentMethod: 'E-Wallet',
      description: 'Campaign payment'
    },
    {
      id: 'TRX003',
      campaignName: 'Summer Sale 2024',
      influencer: 'InfluencerPro',
      amount: 1000000,
      status: 'Paid',
      date: '2024-09-28',
      paymentMethod: 'Transfer Bank',
      description: 'Collaboration payment'
    },
    {
      id: 'TRX004',
      campaignName: 'Gaming Keyboard Review',
      influencer: 'TechReviewer',
      amount: 600000,
      status: 'Refunded',
      date: '2024-10-03',
      paymentMethod: 'E-Wallet',
      description: 'Refund due to campaign cancellation'
    },
    {
      id: 'TRX005',
      campaignName: 'Back to School Campaign',
      influencer: 'StudentInfluencer',
      amount: 450000,
      status: 'Paid',
      date: '2024-10-08',
      paymentMethod: 'Transfer Bank',
      description: 'Payment for campaign'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return { bg: '#d1fae5', color: '#065f46' };
      case 'Refunded': return { bg: '#fef3c7', color: '#92400e' };
      default: return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  const filteredTransactions = transactions.filter(trx => {
    const matchesStatus = filterStatus === 'all' || trx.status === filterStatus;
    const matchesSearch = trx.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trx.influencer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPaid = transactions.filter(t => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRefunded = transactions.filter(t => t.status === 'Refunded')
    .reduce((sum, t) => sum + t.amount, 0);

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
          <Box sx={{ mb: 4, mt: 13 }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} sx={{ color: '#1a1f36', m: 0, fontFamily: 'Inter, sans-serif' }}>
              Transactions
            </Typography>
            <Typography sx={{ fontSize: 15, color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>
              View and manage all your campaign transactions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: isMobile ? 2 : 2.5, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            {[
              {
                title: 'Total Paid',
                value: `Rp ${totalPaid.toLocaleString('id-ID')}`,
                IconComponent: CheckCircleIcon,
                color: '#10b981',
                bgColor: '#d1fae5',
                count: transactions.filter(t => t.status === 'Paid').length
              },
              {
                title: 'Total Refunded',
                value: `Rp ${totalRefunded.toLocaleString('id-ID')}`,
                IconComponent: UndoIcon,
                color: '#f59e0b',
                bgColor: '#fef3c7',
                count: transactions.filter(t => t.status === 'Refunded').length
              },
              {
                title: 'All Transactions',
                value: transactions.length,
                IconComponent: AccountBalanceWalletIcon,
                color: '#3b82f6',
                bgColor: '#dbeafe',
                count: 'Total'
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
                <Typography sx={{ fontSize: 12.5, color: '#6c757d', fontFamily: 'Inter, sans-serif' }}>{stat.count} transactions</Typography>
              </Paper>
            ))}
          </Box>

          {/* Filters */}
          <Paper sx={{ bgcolor: '#fff', borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e2e8f0' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: isMobile ? '100%' : 300 }}>
                <TextField
                  fullWidth
                  placeholder="Search transactions..."
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
                  <MenuItem value="all">All Status</MenuItem>
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
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Amount</TableCell>
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Status</TableCell>
                  <TableCell sx={{ py: 2, pl: 3, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Date</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontSize: 13, fontWeight: 700, color: '#6c757d' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#6c757d' }}>
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((trx) => {
                    const statusStyle = getStatusColor(trx.status);
                    return (
                      <TableRow key={trx.id} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 600, color: '#667eea' }}>{trx.id}</TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>{trx.campaignName}</TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, fontWeight: 700, color: '#1a1f36' }}>Rp {trx.amount.toLocaleString('id-ID')}</TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3 }}>
                          <Chip label={trx.status} sx={{ fontSize: 12, fontWeight: 600, bgcolor: statusStyle.bg, color: statusStyle.color }} />
                        </TableCell>
                        <TableCell sx={{ py: 2.5, pl: 3, fontSize: 14, color: '#6c757d' }}>{formatDate(trx.date)}</TableCell>
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
                            View Details
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
          {/* Colored header with icon and close button */}
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
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontFamily: 'Inter, sans-serif', mb: 0.2 }}>Transaction Details</Typography>
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif' }}>{selectedTransaction.id}</Typography>
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
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>{selectedTransaction.campaignName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Influencer</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>{selectedTransaction.influencer}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Amount</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>Rp {selectedTransaction.amount.toLocaleString('id-ID')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Payment Method</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>{selectedTransaction.paymentMethod}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Date</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1a1f36' }}>{formatDate(selectedTransaction.date)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 0.5, fontWeight: 500 }}>Status</Typography>
                <Chip label={selectedTransaction.status} sx={{ fontSize: 13, fontWeight: 700, borderRadius: 1.5, bgcolor: getStatusColor(selectedTransaction.status).bg, color: getStatusColor(selectedTransaction.status).color, px: 1.5, py: 0.5 }} />
              </Grid>
            </Grid>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13.5, color: '#6c757d', mb: 1, fontWeight: 500 }}>Description</Typography>
              <Box sx={{ fontSize: 14, color: '#2d3748', lineHeight: 1.7, p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0', minHeight: 56 }}>
                {selectedTransaction.description}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 3, bgcolor: '#f7fafc', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
            <Button
              onClick={() => showToast('Receipt downloaded!', 'success')}
              sx={{ flex: 1, py: 1.2, bgcolor: COLORS.gradient, borderRadius: 1.5, color: '#667eea', fontWeight: 600, textTransform: 'none', boxShadow: 'none', '& .MuiButton-startIcon': { mr: 1 } }}
              startIcon={<DownloadIcon sx={{ color: '#667eea' }} />}
            >
              Download Receipt
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default TransactionsPage;
