

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  TextField,
  MenuItem,
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
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  ErrorOutline,
  Wallet,
  TrendingUp,
  Download,
  Search,
  History,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { COLORS } from '../../constants/colors';
import { formatCurrency } from '../../utils/helpers';
import authFetch from '../../services/apiClient';
import { ensureValidToken, clearAuth } from '../../services/authService';
import { useToast } from '../../hooks/useToast';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6E00BE',
    },
    secondary: {
      main: '#764ba2',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

const mockTransactions = [
  {
    transaction_id: 'tx_1001',
    user_id: 0,
    amount: 2500000,
    type: 'credit',
    category: 'campaign_payout',
    reference_type: 'campaign',
    reference_id: 'cmp_501',
    description: 'Payout for Summer Collection 2025',
    balance_before: 1500000,
    balance_after: 4000000,
    created_at: '2025-11-15T08:30:00.000Z',
  },
  {
    transaction_id: 'tx_1002',
    user_id: 0,
    amount: 1800000,
    type: 'credit',
    category: 'campaign_payout',
    reference_type: 'campaign',
    reference_id: 'cmp_502',
    description: 'Payout for Tech Gadgets Review',
    balance_before: 2200000,
    balance_after: 4000000,
    created_at: '2025-11-10T10:15:00.000Z',
  },
  {
    transaction_id: 'tx_1003',
    user_id: 0,
    amount: 3200000,
    type: 'credit',
    category: 'campaign_payout',
    reference_type: 'campaign',
    reference_id: 'cmp_503',
    description: 'Payout for Healthy Snacks Campaign',
    balance_before: 800000,
    balance_after: 4000000,
    created_at: '2025-11-05T14:05:00.000Z',
  },
  {
    transaction_id: 'tx_1004',
    user_id: 0,
    amount: 1500000,
    type: 'credit',
    category: 'campaign_payout',
    reference_type: 'campaign',
    reference_id: 'cmp_504',
    description: 'Payout for Beauty Products Launch',
    balance_before: 500000,
    balance_after: 2000000,
    created_at: '2025-10-28T09:20:00.000Z',
  },
  {
    transaction_id: 'tx_1005',
    user_id: 0,
    amount: -25000,
    type: 'debit',
    category: 'fee',
    reference_type: 'system',
    reference_id: 'fee_monthly',
    description: 'Platform service fee',
    balance_before: 4025000,
    balance_after: 4000000,
    created_at: '2025-11-16T07:10:00.000Z',
  },
  {
    transaction_id: 'tx_1006',
    user_id: 0,
    amount: -500000,
    type: 'debit',
    category: 'withdrawal',
    reference_type: 'withdrawal',
    reference_id: 'wd_2001',
    description: 'Cash out to BCA • ****7890',
    balance_before: 4500000,
    balance_after: 4000000,
    created_at: '2025-11-19T12:35:00.000Z',
  },
];

const mockWithdrawals = [
  {
    withdrawal_id: 1,
    user_id: 0,
    amount: 500000,
    bank_name: 'BCA',
    account_number: '1234567890',
    account_holder_name: 'Jane Doe',
    status: 'completed',
    request_date: '2025-11-18T10:00:00.000Z',
    reviewed_by: 0,
    reviewed_date: '2025-11-19T12:00:00.000Z',
    transfer_proof_url: '',
    completed_date: '2025-11-19T12:30:00.000Z',
    rejection_reason: null,
    created_at: '2025-11-18T10:00:00.000Z',
    updated_at: '2025-11-19T12:30:00.000Z',
  },
  {
    withdrawal_id: 2,
    user_id: 0,
    amount: 750000,
    bank_name: 'Mandiri',
    account_number: '0987654321',
    account_holder_name: 'John Smith',
    status: 'pending',
    request_date: '2025-11-05T09:15:00.000Z',
    reviewed_by: null,
    reviewed_date: null,
    transfer_proof_url: '',
    completed_date: null,
    rejection_reason: null,
    created_at: '2025-11-05T09:15:00.000Z',
    updated_at: '2025-11-05T09:15:00.000Z',
  },
  {
    withdrawal_id: 3,
    user_id: 0,
    amount: 300000,
    bank_name: 'BCA',
    account_number: '1122334455',
    account_holder_name: 'Alice Lee',
    status: 'failed',
    request_date: '2025-10-12T14:20:00.000Z',
    reviewed_by: 5,
    reviewed_date: '2025-10-13T08:00:00.000Z',
    transfer_proof_url: '',
    completed_date: null,
    rejection_reason: 'Insufficient funds',
    created_at: '2025-10-12T14:20:00.000Z',
    updated_at: '2025-10-13T08:00:00.000Z',
  },
  {
    withdrawal_id: 4,
    user_id: 0,
    amount: 500000,
    bank_name: 'BCA',
    account_number: '4455667788',
    account_holder_name: 'Maya Putri',
    status: 'completed',
    request_date: '2025-11-20T09:00:00.000Z',
    reviewed_by: 2,
    reviewed_date: '2025-11-20T11:00:00.000Z',
    transfer_proof_url: '',
    completed_date: '2025-11-20T11:05:00.000Z',
    rejection_reason: null,
    created_at: '2025-11-20T09:00:00.000Z',
    updated_at: '2025-11-20T11:05:00.000Z',
  },
  {
    withdrawal_id: 5,
    user_id: 0,
    amount: 250000,
    bank_name: 'BRI',
    account_number: '5566778899',
    account_holder_name: 'Riko Santoso',
    status: 'pending',
    request_date: '2025-11-21T13:30:00.000Z',
    reviewed_by: null,
    reviewed_date: null,
    transfer_proof_url: '',
    completed_date: null,
    rejection_reason: null,
    created_at: '2025-11-21T13:30:00.000Z',
    updated_at: '2025-11-21T13:30:00.000Z',
  },
];

// Toggle to use mock withdrawals locally while working on UI (set to false to call real API)
const USE_MOCK_WITHDRAWALS = false;



function Transactions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openCashout, setOpenCashout] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [openWithdrawals, setOpenWithdrawals] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [openWithdrawalDetails, setOpenWithdrawalDetails] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Derive earnings/counts from the transaction schema. Not all transactions include `status`.
  const totalEarnings = mockTransactions
    .filter((t) => (t.type || '').toLowerCase() === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const completedCount = mockTransactions.filter((t) => ((t.status || '').toLowerCase() === 'completed') || ((t.type || '').toLowerCase() === 'credit')).length;
  const pendingCount = mockTransactions.filter((t) => (t.status || '').toLowerCase() === 'pending').length;
  const [currentBalance, setCurrentBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transactions, setTransactions] = useState(null); // null = not loaded yet
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const sourceWithdrawals = USE_MOCK_WITHDRAWALS ? mockWithdrawals : withdrawals;
  const computedTotalWithdrawn = (sourceWithdrawals || [])
    .filter((w) => (w.status || '').toLowerCase() === 'completed' || w.completed_date)
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  // prefer API-provided total_withdrawn; fallback to computedTotalWithdrawn
  const [totalWithdrawnValue, setTotalWithdrawnValue] = useState(
    USE_MOCK_WITHDRAWALS
      ? mockWithdrawals.filter((w) => (w.status || '').toLowerCase() === 'completed' || w.completed_date).reduce((s, w) => s + (w.amount || 0), 0)
      : null
  );

  // When not in mock mode, do NOT fall back to computed mock data — follow balance behavior and show '-' when API doesn't return value
  const displayedTotalWithdrawn = USE_MOCK_WITHDRAWALS ? (totalWithdrawnValue ?? computedTotalWithdrawn) : totalWithdrawnValue;

  // Total earned: prefer API-provided value. Use mock only in mock mode.
  const [totalEarned, setTotalEarned] = useState(
    USE_MOCK_WITHDRAWALS
      ? mockTransactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
      : null
  );

  // Cashout validation
  const parsedCashoutAmount = cashoutAmount === '' ? NaN : parseFloat(cashoutAmount);
  const isAmountExceed = !isNaN(parsedCashoutAmount) && currentBalance != null && parsedCashoutAmount > currentBalance;
  const isBankInfoMissing = !bankName.trim() || !accountNumber.trim() || !accountHolder.trim();
  // if we couldn't fetch balance (currentBalance == null) disable cashout
  const isConfirmDisabled = !cashoutAmount || isNaN(parsedCashoutAmount) || parsedCashoutAmount <= 0 || isAmountExceed || isBankInfoMissing || currentBalance == null;

  // Fetch withdrawals when dialog opens
  const fetchWithdrawals = async () => {
    setWithdrawalsLoading(true);
    if (USE_MOCK_WITHDRAWALS) {
      // simulate a short loading delay for UI feedback
      await new Promise((res) => setTimeout(res, 350));
      setWithdrawals(mockWithdrawals);
      setWithdrawalsLoading(false);
      return;
    }

    try {
      const tokenOk = ensureValidToken();
      if (!tokenOk) {
        clearAuth();
        showToast('Authentication required. Please log in again.', 'error');
        setWithdrawalsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('/v1/withdrawals/my-withdrawals', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearAuth();
        showToast('Unauthorized. Please log in.', 'error');
        setWithdrawalsLoading(false);
        return;
      }

      if (!res.ok) {
        let errMsg = 'Failed to load withdrawals';
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errMsg = errJson.message;
        } catch (e) {}
        showToast(errMsg, 'error');
        // fallback to mock data when API fails
        setWithdrawals(mockWithdrawals);
      } else {
        const json = await res.json();
        // Expecting an array or object with data field; try common shapes
        const data = Array.isArray(json) ? json : (json.data || json.withdrawals || []);
        setWithdrawals(data);
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
      // fallback to mock data when network or unexpected error occurs
      setWithdrawals(mockWithdrawals);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  // Fetch current balance from API
  const fetchBalance = async () => {
    setBalanceLoading(true);
    if (USE_MOCK_WITHDRAWALS) {
      // use local computed balance as mock
      const mockSum = mockTransactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
      setCurrentBalance(mockSum);
      setTotalEarned(mockSum);
      // set total withdrawn from mock data when in mock mode
      setTotalWithdrawnValue(mockWithdrawals.filter((w) => (w.status || '').toLowerCase() === 'completed' || w.completed_date).reduce((s, w) => s + (w.amount || 0), 0));
      setBalanceLoading(false);
      return;
    }

    try {
      const tokenOk = ensureValidToken();
      if (!tokenOk) {
        clearAuth();
        showToast('Authentication required. Please log in again.', 'error');
        setBalanceLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('/v1/transactions/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearAuth();
        showToast('Unauthorized. Please log in.', 'error');
        setBalanceLoading(false);
        return;
      }

      if (!res.ok) {
        let errMsg = 'Failed to load balance';
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errMsg = errJson.message;
        } catch (e) {}
        showToast(errMsg, 'error');
        // do not fallback to mock; show '-' instead
        setCurrentBalance(null);
        setTotalEarned(null);
        setTotalWithdrawnValue(null);
      } else {
        const json = await res.json();
        setCurrentBalance(json.current_balance ?? null);
        // prefer explicit total earned fields if provided by the API
        const apiTotal = json.total_earned ?? json.total_earnings ?? json.total_earned_amount ?? json.total_credit ?? null;
        setTotalEarned(apiTotal ?? null);
        // prefer explicit total_withdrawn field from API
        const apiWithdrawn = json.total_withdrawn ?? json.total_withdrawn_amount ?? json.total_withdrawn_amounts ?? json.totalWithdrawn ?? json.total_withdrawals ?? null;
        setTotalWithdrawnValue(apiWithdrawn ?? null);
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
      // on network error, do not fallback to mock; show '-'
      setCurrentBalance(null);
      setTotalWithdrawnValue(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (openWithdrawals) fetchWithdrawals();
  }, [openWithdrawals]);

  useEffect(() => {
    // fetch balance on mount
    fetchBalance();
    // also fetch withdrawals so stat cards show API values immediately
    fetchWithdrawals();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const tokenOk = ensureValidToken();
      if (!tokenOk) {
        clearAuth();
        showToast('Authentication required. Please log in again.', 'error');
        setTransactions([]);
        setTransactionsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('/v1/transactions/my-transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearAuth();
        showToast('Unauthorized. Please log in.', 'error');
        setTransactions([]);
        setTransactionsLoading(false);
        return;
      }

      if (!res.ok) {
        let errMsg = 'Failed to load transactions';
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errMsg = errJson.message;
        } catch (e) {}
        showToast(errMsg, 'error');
        // per request: do NOT fallback to mock data; treat as no transactions
        setTransactions([]);
      } else {
        const json = await res.json();
        const data = Array.isArray(json.transactions) ? json.transactions : (json.data || json.transactions || []);
        setTransactions(data);
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
      // on error, treat as no transactions (do not fallback to mock)
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchWithdrawalDetails = async (id) => {
    setDetailsLoading(true);
    try {
      if (USE_MOCK_WITHDRAWALS) {
        // simulate delay
        await new Promise((r) => setTimeout(r, 300));
        const found = mockWithdrawals.find((w) => (w.withdrawal_id ?? w.id) === id);
        // If not found in mock, create a placeholder
        const withdrawal = found
          ? found
          : {
              withdrawal_id: id,
              user_id: 0,
              amount: 0,
              bank_name: '-',
              account_number: '-',
              account_holder_name: '-',
              status: 'pending',
              request_date: null,
              reviewed_by: null,
              reviewed_date: null,
              review_notes: null,
              transfer_proof_url: null,
              completed_date: null,
              rejection_reason: null,
              created_at: null,
              updated_at: null,
            };
        setSelectedWithdrawal(withdrawal);
        setDetailsLoading(false);
        return withdrawal;
      }

      const tokenOk = ensureValidToken();
      if (!tokenOk) {
        clearAuth();
        showToast('Authentication required. Please log in again.', 'error');
        setDetailsLoading(false);
        return null;
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`/v1/withdrawals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearAuth();
        showToast('Unauthorized. Please log in.', 'error');
        setDetailsLoading(false);
        return null;
      }

      if (!res.ok) {
        let errMsg = 'Failed to load withdrawal details';
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errMsg = errJson.message;
        } catch (e) {}
        showToast(errMsg, 'error');
        setDetailsLoading(false);
        return null;
      }

      const json = await res.json();
      const withdrawal = json.withdrawal || json.data || json;
      setSelectedWithdrawal(withdrawal);
      setDetailsLoading(false);
      return withdrawal;
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
      setDetailsLoading(false);
      return null;
    }
  };

  const handleOpenDetails = async (id) => {
    setOpenWithdrawalDetails(true);
    await fetchWithdrawalDetails(id);
  };

  const handleCloseDetails = () => {
    setOpenWithdrawalDetails(false);
    setSelectedWithdrawal(null);
  };

  const handleRequestCancel = () => {
    setOpenCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedWithdrawal) return;
    const id = selectedWithdrawal.withdrawal_id ?? selectedWithdrawal.id;
    setIsCanceling(true);
    try {
      if (USE_MOCK_WITHDRAWALS) {
        // simulate API delay
        await new Promise((r) => setTimeout(r, 400));
        // update mock arrays and state
        const idx = mockWithdrawals.findIndex((w) => (w.withdrawal_id ?? w.id) === id);
        if (idx !== -1) {
          mockWithdrawals[idx].status = 'failed';
          mockWithdrawals[idx].rejection_reason = 'Cancelled by user';
          mockWithdrawals[idx].completed_date = new Date().toISOString();
        }
        // update local state copies
        setSelectedWithdrawal((prev) => prev ? { ...prev, status: 'failed', rejection_reason: 'Cancelled by user', completed_date: new Date().toISOString() } : prev);
        setWithdrawals((prev) => prev.map((w) => ((w.withdrawal_id ?? w.id) === id ? { ...w, status: 'failed', rejection_reason: 'Cancelled by user', completed_date: new Date().toISOString() } : w)));
        showToast('Withdrawal cancelled', 'success');
      } else {
        const tokenOk = ensureValidToken();
        if (!tokenOk) {
          clearAuth();
          showToast('Authentication required. Please log in again.', 'error');
          setIsCanceling(false);
          setOpenCancelConfirm(false);
          return;
        }

        const token = localStorage.getItem('token');
        const res = await fetch(`/v1/withdrawals/${id}/cancel`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          clearAuth();
          showToast('Unauthorized. Please log in.', 'error');
          setIsCanceling(false);
          setOpenCancelConfirm(false);
          return;
        }

        if (!res.ok) {
          let errMsg = 'Failed to cancel withdrawal';
          try {
            const errJson = await res.json();
            if (errJson && errJson.message) errMsg = errJson.message;
          } catch (e) {}
          showToast(errMsg, 'error');
        } else {
          showToast('Withdrawal cancelled', 'success');
          // refresh the list
          await fetchWithdrawals();
          await fetchWithdrawalDetails(id);
        }
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setIsCanceling(false);
      setOpenCancelConfirm(false);
    }
  };

  const filteredTransactions = (transactions || []).filter((t) => {
    const statusValue = (t.status || '').toLowerCase();
    const matchesStatus =
      filterStatus === 'all' || statusValue === filterStatus;

    const term = (searchTerm || '').toString().toLowerCase();
    const searchable = (
      (t.description || '') + ' ' + (t.reference_id || '') + ' ' + (t.reference_type || '')
    ).toLowerCase();
    const matchesSearch = term === '' || searchable.includes(term);

    return matchesStatus && matchesSearch;
  });

  const handleCashout = async () => {
    const amount = parsedCashoutAmount;
    if (isNaN(amount) || amount <= 0) return;
    if (isAmountExceed) return;
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        amount: amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolder,
      };

      // ensure token exists and not expired; if not, show toast instead of redirect
      const tokenOk = ensureValidToken();
      if (!tokenOk) {
        clearAuth();
        showToast('Authentication required. Please log in again.', 'error');
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('/v1/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        // show toast instead of redirect
        clearAuth();
        showToast('Unauthorized. Please log in.', 'error');
        return;
      }

      if (!res.ok) {
        let errMsg = 'Failed to request withdrawal';
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errMsg = errJson.message;
        } catch (e) {}
        showToast(errMsg, 'error');
      } else {
        showToast('Withdrawal request submitted', 'success');
        setOpenCashout(false);
        setCashoutAmount('');
        setBankName('');
        setAccountNumber('');
        setAccountHolder('');
        // Re-open withdrawals dialog and refresh history so user sees updated list
        setOpenWithdrawals(true);
        try {
          await fetchWithdrawals();
        } catch (e) {
          // fetchWithdrawals already shows toasts on error; swallow here
        }
      }
    } catch (err) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ fontSize: '1.2rem', color: '#10b981' }} />;
      case 'pending':
        return <Schedule sx={{ fontSize: '1.2rem', color: '#f59e0b' }} />;
      case 'failed':
        return <ErrorOutline sx={{ fontSize: '1.2rem', color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
      case 'pending':
        return { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' };
      case 'failed':
        return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
      default:
        return { bg: '#eff6ff', text: '#0c2d6b', border: '#bfdbfe' };
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} unreadCount={0} />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb', pt: { xs: '80px', md: '88px' }, pb: { xs: 3, md: 6 } }}>
        <Container
            maxWidth="lg"
            sx={{
              ml: { md: '260px' },
              width: '100%',
              maxWidth: { md: 'calc(100% - 260px)' },
              boxSizing: 'border-box',
            }}
        >
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    fontWeight: 900,
                    color: '#111827',
                    mb: 0.5,
                  }}
                >
                  Transaction History
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: '#6b7280' }}>
                  Manage and track your income
                </Typography>
              </Box>
              
              <Button
                onClick={() => setOpenWithdrawals(true)}
                variant="outlined"
                startIcon={<History sx={{ fontSize: '1.1rem' }} />}
                sx={{
                  borderColor: '#6E00BE',
                  color: '#6E00BE',
                  fontWeight: 600,
                  borderRadius: '12px',
                  padding: '12px 22px',
                  fontSize: '0.95rem',
                  textTransform: 'none',
                }}
              >
                Withdrawals
              </Button>
            </Box>
          </Box>

          <Card
            sx={{
              background: COLORS.gradientPrimary,
              borderRadius: '20px',
              mb: 6,
              boxShadow: '0 20px 48px rgba(110, 0, 190, 0.2)',
              border: 'none',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 }, pb: { xs: 4, md: 5 } }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: 600, mb: 2 }}>
                Available Balance
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 900,
                  color: '#fff',
                  mb: 3,
                  letterSpacing: '-1px',
                }}
              >
                {balanceLoading ? (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}><CircularProgress size={20} sx={{ color: '#fff' }} /></Box>
                ) : currentBalance == null ? (
                  '-'
                ) : (
                  formatCurrency(currentBalance)
                )}
              </Typography>
              {/* <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mb: 0.5 }}>
                    Completed Transactions
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>
                    {completedCount}
                  </Typography>
                </Box>
                <Box sx={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', mb: 0.5 }}>
                    Pending Review
                  </Typography>
                  <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>
                    {pendingCount}
                  </Typography>
                </Box>
              </Box> */}
            </CardContent>
          </Card>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(25ch, 1fr))',
            gap: 2.5,
            mb: 6
          }}>
            <Box sx={{
              background: '#fff',
              borderRadius: 5,
              p: 3,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: 0,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              boxShadow: 0,
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                bgcolor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle sx={{ fontSize: 25, color: '#10b981' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5 }}>
                  Completed
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36' }}>
                  {completedCount}
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              background: '#fff',
              borderRadius: 5,
              p: 3,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: 0,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              boxShadow: 0,
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                bgcolor: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Schedule sx={{ fontSize: 25, color: '#f59e0b' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5 }}>
                  Pending
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36' }}>
                  {pendingCount}
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              background: '#fff',
              borderRadius: 5,
              p: 3,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: 0,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              boxShadow: 0,
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                bgcolor: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp sx={{ fontSize: 25, color: '#0284c7' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5 }}>
                  Total Earned
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36' }}>
                  {balanceLoading ? (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}><CircularProgress size={18} /></Box>
                  ) : totalEarned == null ? (
                    '-'
                  ) : (
                    formatCurrency(totalEarned)
                  )}
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              background: '#fff',
              borderRadius: 5,
              p: 3,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: 0,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              boxShadow: 0,
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{
                width: 45,
                height: 45,
                borderRadius: 2,
                bgcolor: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Wallet sx={{ fontSize: 25, color: '#6E00BE' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, color: '#6c757d', mb: 0.5 }}>
                  Total Withdrawn
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36' }}>
                  {balanceLoading ? (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}><CircularProgress size={18} /></Box>
                  ) : displayedTotalWithdrawn == null ? (
                    '-'
                  ) : (
                    formatCurrency(displayedTotalWithdrawn)
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 0 }}>
              {/* Header */}
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827' }}>
                    Recent Transactions
                  </Typography>
                  <Button
                    startIcon={<Download sx={{ fontSize: '1.2rem' }} />}
                    sx={{
                      borderColor: '#6E00BE',
                      color: '#6E00BE',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 1.8,
                      py: 1,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      border: '1px solid',
                    }}
                  >
                    Export
                  </Button>
                </Box>

                {/* Search and Filter */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    placeholder="Search campaigns..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: '#6b7280' }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        '& fieldset': { borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#d1d5db' },
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                      },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#f9fafb',
                        '& fieldset': { borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#d1d5db' },
                        '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                      },
                    }}
                  >
                    <MenuItem value="all">All Transactions</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </TextField>
                </Box>
              </Box>

              {/* Transactions Table */}
              {transactionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (transactions && transactions.length > 0) ? (
                <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
                  <Table sx={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
                      <TableHead>
                        <TableRow sx={{ background: '#f7fafc' }}>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>transaction_id</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>user_id</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>amount</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>type</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>category</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>reference_type</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>reference_id</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>description</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>balance_before</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>balance_after</TableCell>
                            <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>created_at</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTransactions.map((transaction) => {
                          const txId = transaction.transaction_id ?? transaction.id ?? '-';
                          const userId = transaction.user_id ?? '-';
                          const amount = transaction.amount ?? 0;
                          const type = transaction.type ?? '-';
                          const category = transaction.category ?? '-';
                          const referenceType = transaction.reference_type ?? transaction.referenceType ?? '-';
                          const referenceId = transaction.reference_id ?? transaction.reference_id ?? transaction.referenceId ?? '-';
                          const description = transaction.description ?? transaction.note ?? '-';
                          const balanceBefore = transaction.balance_before ?? transaction.balanceBefore ?? null;
                          const balanceAfter = transaction.balance_after ?? transaction.balanceAfter ?? null;
                          const createdAt = transaction.created_at ?? transaction.date ?? transaction.createdAt ?? null;

                          return (
                            <TableRow key={txId} sx={{ borderBottom: '1px solid #e5e7eb' }}>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13, color: '#2d3748' }}>{txId}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13, color: '#6c757d' }}>{userId}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontWeight: 700, color: '#6E00BE', fontSize: '0.95rem' }}>{formatCurrency(amount)}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13 }}>{type}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13 }}>{category}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13 }}>{referenceType}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13 }}>{referenceId}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13, color: '#6c757d' }}>{description}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13 }}>{balanceBefore != null ? formatCurrency(balanceBefore) : '-'}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13 }}>{balanceAfter != null ? formatCurrency(balanceAfter) : '-'}</TableCell>
                              <TableCell sx={{ px: 2.5, py: 1.5, fontSize: 13 }}>{createdAt ? new Date(createdAt).toLocaleString() : '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
                  <Typography sx={{ color: '#6b7280', fontSize: '1.1rem', mb: 3 }}>
                    No transactions found
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: COLORS.gradientPrimary,
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                    }}
                    onClick={() => navigate('/student/browse-campaigns')}
                  >
                    Start a Collaboration
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>

        <Dialog open={openCashout} onClose={() => setOpenCashout(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: '#111827',
              fontSize: '1.5rem',
              pb: 1,
              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            }}
          >
            Cash Out Your Earnings
          </DialogTitle>
          <DialogContent sx={{ pt: 4, pb: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ color: '#6b7280', mb: 1, mt: 2, fontSize: '0.95rem', fontWeight: 500 }}>
                Available Balance
              </Typography>
              <Typography
                sx={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  background: COLORS.gradientPrimary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 4,
                }}
              >
                {formatCurrency(totalEarnings)}
              </Typography>
              <TextField
                fullWidth
                label="Amount to Cash Out (Rp)"
                type="number"
                placeholder="Enter amount"
                value={cashoutAmount}
                onChange={(e) => setCashoutAmount(e.target.value)}
                error={isAmountExceed}
                helperText={isAmountExceed ? 'Amount exceeds available balance' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#d1d5db' },
                    '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#6E00BE' },
                }}
              />
              <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  placeholder="e.g. BCA / Mandiri"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#e5e7eb' },
                      '&:hover fieldset': { borderColor: '#d1d5db' },
                      '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Account Number"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#e5e7eb' },
                      '&:hover fieldset': { borderColor: '#d1d5db' },
                      '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Account Holder Name"
                  placeholder="Name on the account"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: '#e5e7eb' },
                      '&:hover fieldset': { borderColor: '#d1d5db' },
                      '&.Mui-focused fieldset': { borderColor: '#6E00BE' },
                    },
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ p: 3, backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <Typography sx={{ fontSize: '0.9rem', color: '#0c2d6b', fontWeight: 500 }}>
                Processing time: 1-2 business days. Your cash out will be transferred to your registered bank account.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1, borderTop: '1px solid #e5e7eb' }}>
            <Button onClick={() => setOpenCashout(false)} sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
              Cancel
            </Button>
            <Button
              onClick={handleCashout}
              variant="contained"
              sx={{
                background: COLORS.gradientPrimary,
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                borderRadius: '10px',
                px: 3,
              }}
              disabled={isConfirmDisabled}
            >
              Confirm Cash Out
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openWithdrawals} onClose={() => setOpenWithdrawals(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
          <DialogTitle sx={{ fontWeight: 800, color: '#111827', fontSize: '1.5rem', pb: 1, background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' }}>
            Withdrawal History
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            {withdrawalsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : withdrawals && withdrawals.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: '#f7fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#6c757d' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6c757d' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6c757d' }}>Bank</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6c757d' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6c757d' }}>Requested</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6c757d' }}>Completed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawals.map((w) => {
                      const statusColor = getStatusColor(w.status);
                      const id = w.withdrawal_id ?? w.id ?? '';
                      const requestDate = w.request_date || w.created_at || null;
                      const completedDate = w.completed_date || w.reviewed_date || null;
                      return (
                        <TableRow
                          key={id}
                          onClick={() => handleOpenDetails(id)}
                          sx={{ '&:hover': { backgroundColor: '#f9fafb' }, cursor: 'pointer' }}
                        >
                          <TableCell sx={{ py: 1.5 }}>{id}</TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 700, color: '#6E00BE' }}>{formatCurrency(w.amount)}</TableCell>
                          <TableCell sx={{ py: 1.5 }}>{w.bank_name || '-'}</TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 2, fontSize: 13, fontWeight: 600, background: statusColor.bg, color: statusColor.text, display: 'inline-block' }}>
                              {(w.status || '').charAt(0).toUpperCase() + (w.status || '').slice(1)}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>{requestDate ? new Date(requestDate).toLocaleString() : '-'}</TableCell>
                          <TableCell sx={{ py: 1.5 }}>{completedDate ? new Date(completedDate).toLocaleString() : '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ color: '#6b7280' }}>No withdrawals yet</Typography>
              </Box>
            )}
          </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 1 }}>
            <Button
              onClick={() => { setOpenWithdrawals(false); setOpenCashout(true); }}
              variant="contained"
              startIcon={<Wallet sx={{ fontSize: '1rem' }} />}
              sx={{
                background: COLORS.gradientPrimary,
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '10px',
                px: 3,
              }}
            >
              Cash Out
            </Button>
            <Button onClick={() => setOpenWithdrawals(false)} sx={{ color: '#6E00BE', fontWeight: 600, textTransform: 'none' }}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openWithdrawalDetails} onClose={handleCloseDetails} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>Withdrawal Details</DialogTitle>
          <DialogContent dividers>
            {detailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : selectedWithdrawal ? (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>#{selectedWithdrawal.withdrawal_id ?? '-'}</Typography>
                  <Chip
                    label={(selectedWithdrawal.status || '-').charAt(0).toUpperCase() + (selectedWithdrawal.status || '-').slice(1)}
                    sx={{
                      fontWeight: 700,
                      background: getStatusColor(selectedWithdrawal.status).bg,
                      color: getStatusColor(selectedWithdrawal.status).text,
                      border: `1px solid ${getStatusColor(selectedWithdrawal.status).border}`,
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 40%', minWidth: 180, background: '#fff', borderRadius: 2, p: 2, border: '1px solid #eef2ff' }}>
                    <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Amount</Typography>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#6E00BE', mt: 0.5 }}>{formatCurrency(selectedWithdrawal.amount ?? 0)}</Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Bank</Typography>
                      <Typography sx={{ fontWeight: 700 }}>{selectedWithdrawal.bank_name || '-'}</Typography>
                      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>{selectedWithdrawal.account_holder_name || '-'} • {selectedWithdrawal.account_number || '-'}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ flex: '1 1 55%', minWidth: 220, display: 'grid', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Requested</Typography>
                      <Typography sx={{ fontSize: 13 }}>{selectedWithdrawal.request_date ? new Date(selectedWithdrawal.request_date).toLocaleString() : '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Completed</Typography>
                      <Typography sx={{ fontSize: 13 }}>{selectedWithdrawal.completed_date ? new Date(selectedWithdrawal.completed_date).toLocaleString() : '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Reviewed By</Typography>
                      <Typography sx={{ fontSize: 13 }}>{selectedWithdrawal.reviewed_by ?? '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Reviewed Date</Typography>
                      <Typography sx={{ fontSize: 13 }}>{selectedWithdrawal.reviewed_date ? new Date(selectedWithdrawal.reviewed_date).toLocaleString() : '-'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Transfer Proof</Typography>
                      {selectedWithdrawal.transfer_proof_url ? (
                        <Button component="a" href={selectedWithdrawal.transfer_proof_url} target="_blank" rel="noreferrer" size="small" sx={{ textTransform: 'none' }}>
                          View Proof
                        </Button>
                      ) : (
                        <Typography sx={{ fontSize: 13, color: '#6b7280' }}>-</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 1, p: 2, borderRadius: 2, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <Typography sx={{ fontSize: 13, color: '#6b7280', fontWeight: 700, mb: 0.5 }}>Review Notes</Typography>
                  <Typography sx={{ fontSize: 14 }}>{selectedWithdrawal.review_notes || '-'}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography>No details available</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ display: 'flex', gap: 1, p: 2 }}>
            {selectedWithdrawal && (selectedWithdrawal.status || '').toLowerCase() === 'pending' && (
              <Button
                onClick={handleRequestCancel}
                variant="outlined"
                color="error"
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Cancel Withdrawal
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleCloseDetails} sx={{ color: '#6E00BE', fontWeight: 600, textTransform: 'none' }}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCancelConfirm} onClose={() => setOpenCancelConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Cancel Withdrawal</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#6b7280' }}>Are you sure you want to cancel this withdrawal? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancelConfirm(false)} sx={{ textTransform: 'none' }}>No</Button>
            <Button onClick={handleConfirmCancel} variant="contained" color="error" disabled={isCanceling} sx={{ textTransform: 'none' }}>
              {isCanceling ? 'Cancelling...' : 'Yes, cancel'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default Transactions;
