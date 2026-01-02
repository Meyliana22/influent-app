import React from 'react';
import { COLORS } from '../../constants/colors';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Avatar, 
  Chip, 
  IconButton, 
  Stack,
  Divider,
  Button as MuiButton
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ChatIcon from '@mui/icons-material/Chat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BusinessIcon from '@mui/icons-material/Business';

/**
 * ApplicantCard Component - Simplified with Material UI and Star Favorite
 */
const ApplicantCard = ({ 
  applicant, 
  onAccept, 
  onReject,
  onCancel,
  onToggleFavorite,
  onChat,
  onShowDetail,
  showActions = true,
  canSelectApplicants = false
}) => {
  const apiImage = process.env.REACT_APP_API_IMAGE_URL;
  // Status configuration for Material UI with custom flat styling
  const getProfileImage = (profileImage) => {
    if (profileImage) {
      return `${profileImage}`;
    }
    // return 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
  };
  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { 
        bgcolor: '#f1f5f9', 
        color: '#64748b', 
        icon: <HourglassEmptyIcon style={{ fontSize: 16 }} />, 
        label: 'Menunggu Review' 
      },
      'Selected': { 
        bgcolor: '#fff7ed', 
        color: '#f97316', 
        icon: <StarIcon style={{ fontSize: 16 }} />, 
        label: 'Terpilih' 
      },
      'Accepted': { 
        bgcolor: '#ecfdf5', 
        color: '#10b981', 
        icon: <CheckCircleIcon style={{ fontSize: 16 }} />, 
        label: 'Diterima' 
      },
      'Rejected': { 
        bgcolor: '#fef2f2', 
        color: '#ef4444', 
        icon: <CancelIcon style={{ fontSize: 16 }} />, 
        label: 'Ditolak' 
      }
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(applicant.status);
  const isFavorite = applicant.isSelected || false;

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 2,
        border: isFavorite ? '2px solid #f59e0b' : '1px solid #e2e8f0',
        borderRadius: 3,
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: isFavorite ? '#f59e0b' : '#cbd5e1',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Avatar & Star Favorite */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
            <Avatar 
              src={getProfileImage(applicant.profileImage)}
              alt={applicant.fullName}
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: '#eff6ff',
                color: '#6E00BE',
                fontSize: 40,
                fontWeight: 700,
                mb: 1.5,
                border: '1px solid #e2e8f0'
              }}
            >
              {applicant.fullName.charAt(0).toUpperCase()}
            </Avatar>
            
            {/* Star Favorite Button */}
          
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                  {applicant.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6E00BE', fontWeight: 600 }}>
                  @{applicant.instagram || applicant.influencerName}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  px: 1.5, 
                  py: 0.75, 
                  bgcolor: statusConfig.bgcolor, 
                  color: statusConfig.color, 
                  borderRadius: 2,
                  fontSize: '0.75rem', 
                  fontWeight: 600
                }}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Box>
            </Stack>

            {/* Bio */}
            {applicant.bio && (
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontStyle: 'italic' }}>
                "{applicant.bio}"
              </Typography>
            )}

            {/* Stats */}
            <Stack direction="row" spacing={3} sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {applicant.location}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 18, color: '#6E00BE' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {applicant.followers?.toLocaleString('id-ID') || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 18, color: '#10b981' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {applicant.engagementRate}%
                </Typography>
              </Box>
            </Stack>

            {/* Contact Info */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              {applicant.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {applicant.email}
                  </Typography>
                </Box>
              )}
              {applicant.instagram && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <InstagramIcon sx={{ fontSize: 16, color: '#E1306C' }} />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {applicant.instagram}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Niche Tags */}
            {applicant.niche && Array.isArray(applicant.niche) && applicant.niche.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <LocalOfferIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Kategori
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                  {applicant.niche.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ 
                        bgcolor: '#f1f5f9', 
                        color: '#475569', 
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Previous Brands */}
            {applicant.previousBrands && applicant.previousBrands.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <BusinessIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    Kolaborasi Sebelumnya
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                  {applicant.previousBrands.map((brand, index) => (
                    <Chip 
                      key={index}
                      label={brand}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#e2e8f0', color: '#64748b' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

            {/* Quick Actions */}
            <Stack direction="row" spacing={1.5} sx={{ mb: showActions ? 2 : 0 }}>
              <MuiButton
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => onShowDetail && onShowDetail(applicant)}
                sx={{ 
                  flex: 1,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc', color: '#1e293b' }
                }}
              >
                Detail
              </MuiButton>
              <MuiButton
                variant="contained"
                disableElevation
                startIcon={<ChatIcon />}
                onClick={() => onChat && onChat(applicant)}
                sx={{ 
                  flex: 1,
                  bgcolor: '#6E00BE',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#5a009e' }
                }}
                disabled={!applicant.userId}
              >
                Chat
              </MuiButton>
            </Stack>

            {/* Action Buttons - Conditional */}
            {showActions && (
              <Box sx={{ borderTop: '1px solid #f1f5f9', pt: 2 }}>
                {applicant.status === 'Pending' && (
                  <Stack direction="row" spacing={1.5}>
                    <MuiButton
                      variant="contained"
                      disableElevation
                      onClick={() => onAccept(applicant.id)}
                      sx={{ 
                        flex: 1,
                        bgcolor: '#10b981',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      Terima
                    </MuiButton>
                    <MuiButton
                      variant="contained"
                      disableElevation
                      onClick={() => onReject(applicant.id)}
                      sx={{ 
                        flex: 1,
                        bgcolor: '#ef4444',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#dc2626' }
                      }}
                    >
                      Tolak
                    </MuiButton>
                  </Stack>
                )}

                {applicant.status === 'Selected' && (
                  <MuiButton
                    variant="outlined"
                    onClick={() => onCancel(applicant.id)}
                    sx={{ 
                      width: '100%',
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' }
                    }}
                  >
                    Batalkan
                  </MuiButton>
                )}

                {applicant.status === 'Accepted' && (
                  <Box 
                    sx={{ 
                      bgcolor: '#ecfdf5',
                      color: '#059669',
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                      fontWeight: 700,
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    ✓ Diterima
                  </Box>
                )}

                {applicant.status === 'Rejected' && (
                  <Box 
                    sx={{ 
                      bgcolor: '#fef2f2',
                      color: '#ef4444',
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                      fontWeight: 700,
                      border: '1px solid #fecaca'
                    }}
                  >
                    ✕ Ditolak
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ApplicantCard;
