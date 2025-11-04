import React, { useState } from 'react';
import UMKMSidebar from '../../components/umkm/UMKMSidebar';
import UMKMTopbar from '../../components/umkm/UMKMTopbar';
import { COLORS } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';

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
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <UMKMSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ marginLeft: !isMobile ? '260px' : '0', width: !isMobile ? 'calc(100% - 260px)' : '100%' }}>
        <UMKMTopbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        
        <div style={{ marginTop: '72px', padding: '32px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '32px', maxWidth: '1400px', margin: '0 auto 32px' }}>
            <h1 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 700,
              color: '#1a1f36',
              margin: '0px',
              fontFamily: "'Inter', sans-serif"
            }}>
              Transactions
            </h1>
            <p style={{
              fontSize: '0.95rem',
              color: '#6c757d',
              fontFamily: "'Inter', sans-serif"
            }}>
              View and manage all your campaign transactions
            </p>
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: isMobile ? '16px' : '20px',
            marginBottom: '32px',
            maxWidth: '1400px',
            margin: '0 auto 32px'
          }}>
            {[
              {
                title: 'Total Paid',
                value: `Rp ${totalPaid.toLocaleString('id-ID')}`,
                icon: '✅',
                color: '#10b981',
                bgColor: '#d1fae5',
                count: transactions.filter(t => t.status === 'Paid').length
              },
              {
                title: 'Total Refunded',
                value: `Rp ${totalRefunded.toLocaleString('id-ID')}`,
                icon: '↩️',
                color: '#f59e0b',
                bgColor: '#fef3c7',
                count: transactions.filter(t => t.status === 'Refunded').length
              },
              {
                title: 'All Transactions',
                value: transactions.length,
                icon: '💰',
                color: '#3b82f6',
                bgColor: '#dbeafe',
                count: 'Total'
              }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#6c757d',
                  marginBottom: '8px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {stat.title}
                </div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1a1f36',
                  marginBottom: '4px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6c757d',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {stat.count} transactions
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: isMobile ? '16px' : '24px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
            maxWidth: '1400px',
            margin: '0 auto 24px'
          }}>
            <div style={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  minWidth: '150px'
                }}
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: isMobile ? 'auto' : 'hidden',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Inter', sans-serif",
              minWidth: isMobile ? '800px' : 'auto'
            }}>
              <thead>
                <tr style={{ background: '#f7fafc' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Campaign</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => {
                    const statusStyle = getStatusColor(trx.status);
                    return (
                      <tr
                        key={trx.id}
                        style={{ borderBottom: '1px solid #e2e8f0' }}
                      >
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#667eea' }}>{trx.id}</td>
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 600, color: '#1a1f36' }}>
                          {trx.campaignName}
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', fontWeight: 700, color: '#1a1f36' }}>
                          Rp {trx.amount.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: statusStyle.bg,
                            color: statusStyle.color
                          }}>
                            {trx.status}
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '0.9rem', color: '#6c757d' }}>
                          {formatDate(trx.date)}
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleViewDetails(trx)}
                            style={{
                              padding: '8px 16px',
                              background: '#667eea',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '32px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1a1f36',
                    marginBottom: '8px',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    Transaction Details
                  </h2>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#6c757d',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {selectedTransaction.id}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: '#f7fafc',
                    border: 'none',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Campaign</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1f36' }}>
                    {selectedTransaction.campaignName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Influencer</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1f36' }}>
                    {selectedTransaction.influencer}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Amount</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1f36' }}>
                    Rp {selectedTransaction.amount.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Payment Method</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1f36' }}>
                    {selectedTransaction.paymentMethod}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Date</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1f36' }}>
                    {formatDate(selectedTransaction.date)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px' }}>Status</div>
                  <div>
                    <span style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      background: getStatusColor(selectedTransaction.status).bg,
                      color: getStatusColor(selectedTransaction.status).color,
                      display: 'inline-block'
                    }}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '8px' }}>Description</div>
                <div style={{
                  fontSize: '0.95rem',
                  color: '#2d3748',
                  lineHeight: '1.6',
                  padding: '16px',
                  background: '#f7fafc',
                  borderRadius: '10px'
                }}>
                  {selectedTransaction.description}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button
                  onClick={() => showToast('Receipt downloaded!', 'success')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: COLORS.gradient,
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  📥 Download Receipt
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    padding: '14px 24px',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#2d3748',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
