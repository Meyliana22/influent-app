import React, { useState } from 'react';
import { Navbar, Card, Button, StatCard } from '../../components/common';
import { COLORS } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/helpers';

function TransactionsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 'TRX001',
      campaignName: 'Razer Mouse Review',
      influencer: 'User123',
      amount: 500000,
      status: 'completed',
      date: '2024-10-01',
      paymentMethod: 'Transfer Bank'
    },
    {
      id: 'TRX002',
      campaignName: 'Product Launch Campaign',
      influencer: 'UserInfluencer',
      amount: 750000,
      status: 'pending',
      date: '2024-10-05',
      paymentMethod: 'E-Wallet'
    },
    {
      id: 'TRX003',
      campaignName: 'Summer Sale 2024',
      influencer: 'InfluencerPro',
      amount: 1000000,
      status: 'completed',
      date: '2024-09-28',
      paymentMethod: 'Transfer Bank'
    },
    {
      id: 'TRX004',
      campaignName: 'Gaming Keyboard Review',
      influencer: 'TechReviewer',
      amount: 600000,
      status: 'failed',
      date: '2024-10-03',
      paymentMethod: 'E-Wallet'
    },
    {
      id: 'TRX005',
      campaignName: 'Back to School Campaign',
      influencer: 'StudentInfluencer',
      amount: 450000,
      status: 'pending',
      date: '2024-10-08',
      paymentMethod: 'Transfer Bank'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return { bg: COLORS.successLight, color: COLORS.successDark, label: 'Selesai' };
      case 'pending': return { bg: COLORS.warningLight, color: COLORS.warningDark, label: 'Pending' };
      case 'failed': return { bg: COLORS.dangerLight, color: COLORS.dangerDark, label: 'Gagal' };
      default: return { bg: '#e2e3e5', color: '#383d41', label: 'Unknown' };
    }
  };

  const filteredTransactions = transactions.filter(trx => {
    const matchesStatus = filterStatus === 'all' || trx.status === filterStatus;
    const matchesSearch = trx.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trx.influencer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCompleted = transactions.filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: COLORS.background,
      fontFamily: 'Montserrat, Arial, sans-serif'
    }}>
      {/* Header */}
      <Navbar userType="umkm" />

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ 
          margin: '0 0 32px 0', 
          fontSize: '2rem', 
          fontWeight: 700,
          color: COLORS.textPrimary
        }}>
          Riwayat Transaksi
        </h2>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <StatCard
            variant="primary"
            label="Total Transaksi Selesai"
            value={formatCurrency(totalCompleted)}
            subtitle={`${transactions.filter(t => t.status === 'completed').length} transaksi`}
          />
          <StatCard
            label="Transaksi Pending"
            value={formatCurrency(totalPending)}
            valueColor={COLORS.warningDark}
            subtitle={`${transactions.filter(t => t.status === 'pending').length} transaksi`}
          />
          <StatCard
            label="Total Transaksi"
            value={transactions.length}
            subtitle="Semua periode"
          />
        </div>

        {/* Filters and Search */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { value: 'all', label: 'Semua' },
                { value: 'completed', label: 'Selesai' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Gagal' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  style={{
                    padding: '10px 20px',
                    border: filterStatus === filter.value ? `2px solid ${COLORS.primary}` : `2px solid ${COLORS.border}`,
                    borderRadius: '10px',
                    background: filterStatus === filter.value ? COLORS.primaryLight : COLORS.white,
                    color: filterStatus === filter.value ? COLORS.primary : COLORS.textSecondary,
                    fontWeight: filterStatus === filter.value ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    fontFamily: 'Montserrat, Arial, sans-serif',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Cari campaign, influencer, atau ID transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.2rem'
              }}>
                🔍
              </span>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e3e3e3' }}>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontWeight: 700,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  ID Transaksi
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontWeight: 700,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  Campaign
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontWeight: 700,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  Influencer
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'right', 
                  fontWeight: 700,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  Jumlah
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontWeight: 700,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  Metode
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'left', 
                  fontWeight: 700,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  Tanggal
                </th>
                <th style={{ 
                  padding: '16px 20px', 
                  textAlign: 'center', 
                  fontWeight: 700,
                  color: '#2d3748',
                  fontSize: '0.9rem'
                }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx, index) => {
                  const statusInfo = getStatusColor(trx.status);
                  return (
                    <tr 
                      key={trx.id}
                      style={{ 
                        borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: '#667eea' }}>
                        {trx.id}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#2d3748', fontWeight: 500 }}>
                        {trx.campaignName}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#6c757d' }}>
                        {trx.influencer}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: '#2d3748' }}>
                        {formatCurrency(trx.amount)}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#6c757d', fontSize: '0.9rem' }}>
                        {trx.paymentMethod}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#6c757d', fontSize: '0.9rem' }}>
                        {formatDate(trx.date)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ 
                    padding: '64px 20px', 
                    textAlign: 'center',
                    color: '#6c757d'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      Tidak ada transaksi ditemukan
                    </div>
                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                      Coba ubah filter atau kata kunci pencarian
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Export Button */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outline" 
            onClick={() => alert('Export data ke CSV/Excel')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>📥</span>
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
