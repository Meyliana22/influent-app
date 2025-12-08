import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import { Sidebar, Topbar } from '../../components/common';
import { COLORS } from '../../constants/colors';
import ApplicantIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import CompletedIcon from '@mui/icons-material/CheckCircle';
import OngoingIcon from '@mui/icons-material/HourglassEmpty';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Modal,
  Stack
} from '@mui/material';

function ManageCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, filterStatus, searchQuery]);

  const loadCampaigns = () => {
    const campaignsData = JSON.parse(localStorage.getItem('campaigns') || '[]');
    setCampaigns(campaignsData);
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    if (filterStatus !== 'All') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.campaign_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCampaigns(filtered);
  };

  const handleViewDetail = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  const handleApproveCampaign = () => {
    if (selectedCampaign) {
      const updated = campaigns.map(c =>
        c.id === selectedCampaign.id ? { ...c, status: 'Active' } : c
      );
      setCampaigns(updated);
      localStorage.setItem('campaigns', JSON.stringify(updated));
      setShowDetailModal(false);
    }
  };

  const handleRejectCampaign = () => {
    if (selectedCampaign) {
      const updated = campaigns.map(c =>
        c.id === selectedCampaign.id ? { ...c, status: 'Cancelled' } : c
      );
      setCampaigns(updated);
      localStorage.setItem('campaigns', JSON.stringify(updated));
      setShowDetailModal(false);
    }
  };

  const handleDeactivate = (campaignId) => {
    const updated = campaigns.map(c =>
      c.id === campaignId ? { ...c, status: 'Completed' } : c
    );
    setCampaigns(updated);
    localStorage.setItem('campaigns', JSON.stringify(updated));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'Draft':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'Completed':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'Cancelled':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'Active').length,
    completed: campaigns.filter(c => c.status === 'Completed').length,
    draft: campaigns.filter(c => c.status === 'Draft').length
  };

  return (
    <Box sx={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ marginLeft: '260px', width: 'calc(100% - 260px)' }}>
        <Topbar />
        <Box sx={{ mt: 9, p: 4 }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontFamily: "'Inter', sans-serif", fontSize: 32 }}>
              Manage Campaigns
            </Typography>
            <Typography sx={{ fontSize: 16, color: '#6c757d', fontFamily: "'Inter', sans-serif" }}>
              Monitor and manage all campaigns on the platform
            </Typography>
          </Box>

          {/* Stats Overview */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(25ch, 1fr))',
            gap: 2.5,
            mb: 4
          }}>
            {[
              { label: 'Total Campaigns', value: stats.total, IconComponent: CampaignIcon, bgColor: '#e0e7ff', iconColor: '#4338ca' },
              { label: 'Active', value: stats.active, IconComponent: OngoingIcon, bgColor: '#ffebebff', iconColor: '#dc2626' },
              { label: 'Completed', value: stats.completed, IconComponent: CompletedIcon, bgColor: '#fcffd1ff', iconColor: '#bdaa33ff' },
              { label: 'Pending', value: stats.draft, IconComponent: ApplicantIcon, bgColor: '#f9e9ffff', iconColor: '#6f3ec5ff' }
            ].map((stat, index) => (
              <Box
                key={index}
                sx={{
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
                }}
              >
                <Box sx={{
                  minWidth: 6,
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <stat.IconComponent sx={{ fontSize: 28, color: stat.iconColor }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, color: '#6c757d', mb: 0.5, fontFamily: "'Inter', sans-serif" }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: 25, fontWeight: 700, color: '#1a1f36', fontFamily: "'Inter', sans-serif" }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Filters */}
          <Box sx={{
            background: '#fff',
            borderRadius: 2,
            p: 3,
            mb: 3,
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 2,
            alignItems: 'center'
          }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </Box>
            <Box>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                variant="outlined"
                sx={{ minWidth: 19 / 8, fontFamily: "'Inter', sans-serif" }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Campaigns Table */}
          <Box sx={{
            background: '#fff',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <Table sx={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
              <TableHead>
                <TableRow sx={{ background: '#f7fafc' }}>
                  <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>ID</TableCell>
                  <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Campaign Title</TableCell>
                  <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>UMKM Name</TableCell>
                  <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Status</TableCell>
                  <TableCell sx={{ px: 2, py: 2, textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Influencers</TableCell>
                  <TableCell sx={{ px: 2, py: 2, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ px: 5, py: 5, textAlign: 'center', color: '#6c757d' }}>
                      No campaigns found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => {
                    const statusStyle = getStatusColor(campaign.status);
                    return (
                      <TableRow key={campaign.id} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                        <TableCell sx={{ px: 2.5, py: 2.5, fontSize: 14, color: '#2d3748' }}>#{campaign.id}</TableCell>
                        <TableCell sx={{ px: 2.5, py: 2.5, fontSize: 14, fontWeight: 600, color: '#1a1f36' }}>
                          {campaign.campaign_title || 'Untitled Campaign'}
                        </TableCell>
                        <TableCell sx={{ px: 2.5, py: 2.5, fontSize: 14, color: '#6c757d' }}>
                          {campaign.business_name || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ px: 2.5, py: 2.5 }}>
                          <Box component="span" sx={{
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 2,
                            fontSize: 13,
                            fontWeight: 600,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            display: 'inline-block'
                          }}>
                            {campaign.status}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: 2.5, py: 2.5, fontSize: 14, color: '#6c757d' }}>
                          {campaign.influencer_count || 0}
                        </TableCell>
                        <TableCell sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
                          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                bgcolor: '#667eea',
                                borderRadius: 2,
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: 'none',
                                minWidth: 10 / 8,
                                py: 1,
                                px: 2,
                                '&:hover': { bgcolor: '#5a67d8' }
                              }}
                              onClick={() => handleViewDetail(campaign)}
                            >
                              View
                            </Button>
                            {campaign.status === 'Active' && (
                              <Button
                                variant="contained"
                                size="small"
                                sx={{
                                  bgcolor: '#f59e0b',
                                  borderRadius: 2,
                                  color: '#fff',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  boxShadow: 'none',
                                  minWidth: 10 / 8,
                                  py: 1,
                                  px: 2,
                                  '&:hover': { bgcolor: '#d97706' }
                                }}
                                onClick={() => handleDeactivate(campaign.id)}
                              >
                                Deactivate
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>

      {/* Campaign Detail Modal */}
      <Modal open={showDetailModal && !!selectedCampaign} onClose={() => setShowDetailModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 3,
          maxWidth: 'sm',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 6
        }}>
          {/* Modal Header */}
          <Box sx={{ p: 4, borderBottom: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontFamily: "'Inter', sans-serif" }}>
                  {selectedCampaign?.campaign_title || 'Untitled Campaign'}
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#6c757d', fontFamily: "'Inter', sans-serif" }}>
                  {selectedCampaign?.business_name || 'Unnamed UMKM'}
                </Typography>
              </Box>
              <Button
                onClick={() => setShowDetailModal(false)}
                sx={{
                  bgcolor: 'transparent',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  color: '#1a1f36',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 0,
                  p: 0,
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: '#e2e8f0',
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: 24 }} />
              </Button>
            </Box>
          </Box>

          {/* Modal Body */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1, fontFamily: "'Inter', sans-serif" }}>
                Campaign Description
              </Typography>
              <Typography sx={{ fontSize: 15, color: '#6c757d', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                {selectedCampaign?.description || 'No description provided.'}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 13, color: '#6c757d', mb: 0.5 }}>Budget</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36' }}>
                  Rp {(selectedCampaign?.total_budget || 0).toLocaleString('id-ID')}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: '#6c757d', mb: 0.5 }}>Price Per Post</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36' }}>
                  Rp {(selectedCampaign?.price_per_post || 0).toLocaleString('id-ID')}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: '#6c757d', mb: 0.5 }}>Influencers Needed</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1f36' }}>
                  {selectedCampaign?.influencer_count || 0}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, color: '#6c757d', mb: 0.5 }}>Status</Typography>
                <Box component="span" sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: 15,
                  fontWeight: 700,
                  background: getStatusColor(selectedCampaign?.status).bg,
                  color: getStatusColor(selectedCampaign?.status).color,
                  display: 'inline-block'
                }}>
                  {selectedCampaign?.status}
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
              {selectedCampaign?.status === 'Draft' && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: 2,
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 'none',
                      fontFamily: "'Inter', sans-serif",
                      py: 1.5,
                      '&:hover': { bgcolor: '#059669' }
                    }}
                    onClick={handleApproveCampaign}
                  >
                    <CompletedIcon sx={{ mr: 1, fontSize: 22 }} /> Approve Campaign
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: '#ef4444',
                      borderRadius: 2,
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 'none',
                      fontFamily: "'Inter', sans-serif",
                      py: 1.5,
                      '&:hover': { bgcolor: '#dc2626' }
                    }}
                    onClick={handleRejectCampaign}
                  >
                    <CancelIcon sx={{ mr: 1, fontSize: 22 }} /> Reject Campaign
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default ManageCampaigns;
