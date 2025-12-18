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
  // Status configuration for Material UI
  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { color: 'warning', icon: <HourglassEmptyIcon />, label: 'Menunggu Review' },
      'Selected': { color: 'info', icon: <CheckCircleIcon />, label: 'Dipilih' },
      'Accepted': { color: 'success', icon: <CheckCircleIcon />, label: 'Diterima' },
      'Rejected': { color: 'error', icon: <CancelIcon />, label: 'Ditolak' }
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
        border: isFavorite ? '2px solid #ffa726' : '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          borderColor: isFavorite ? '#ff9800' : '#bdbdbd'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={3}>
          {/* Avatar & Star Favorite */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: '#667eea',
                fontSize: 40,
                fontWeight: 700,
                mb: 1.5
              }}
            >
              {applicant.fullName.charAt(0).toUpperCase()}
            </Avatar>
            
            {/* Star Favorite Button */}
            {applicant.status !== 'Rejected' && (
              <IconButton
                onClick={() => onToggleFavorite && onToggleFavorite(applicant)}
                sx={{ 
                  bgcolor: isFavorite ? '#fff3e0' : 'transparent',
                  '&:hover': { bgcolor: isFavorite ? '#ffe0b2' : '#f5f5f5' }
                }}
              >
                {isFavorite ? (
                  <StarIcon sx={{ fontSize: 32, color: '#ffa726' }} />
                ) : (
                  <StarBorderIcon sx={{ fontSize: 32, color: '#bdbdbd' }} />
                )}
              </IconButton>
            )}
            {isFavorite && (
              <Typography variant="caption" sx={{ color: '#ffa726', fontWeight: 600, mt: 0.5 }}>
                Favorit
              </Typography>
            )}
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 0.5 }}>
                  {applicant.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 600 }}>
                  @{applicant.instagram || applicant.influencerName}
                </Typography>
              </Box>
              <Chip 
                icon={statusConfig.icon}
                label={statusConfig.label}
                color={statusConfig.color}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            {/* Bio */}
            {applicant.bio && (
              <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 2, fontStyle: 'italic' }}>
                "{applicant.bio}"
              </Typography>
            )}

            {/* Stats */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: '#78909c' }} />
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  {applicant.location}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 18, color: '#667eea' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                  {applicant.followers?.toLocaleString('id-ID') || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 18, color: '#66bb6a' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                  {applicant.engagementRate}%
                </Typography>
              </Box>
            </Stack>

            {/* Contact Info */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              {applicant.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailIcon sx={{ fontSize: 16, color: '#78909c' }} />
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {applicant.email}
                  </Typography>
                </Box>
              )}
              {applicant.instagram && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <InstagramIcon sx={{ fontSize: 16, color: '#E1306C' }} />
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {applicant.instagram}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Niche Tags */}
            {applicant.niche && Array.isArray(applicant.niche) && applicant.niche.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <LocalOfferIcon sx={{ fontSize: 16, color: '#78909c' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                    Niche
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {applicant.niche.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ bgcolor: '#ede7f6', color: '#673ab7', fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Previous Brands */}
            {applicant.previousBrands && applicant.previousBrands.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <BusinessIcon sx={{ fontSize: 16, color: '#78909c' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                    Previous Collaborations
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {applicant.previousBrands.map((brand, index) => (
                    <Chip 
                      key={index}
                      label={brand}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#e0e0e0' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Quick Actions */}
            <Stack direction="row" spacing={1.5} sx={{ mb: showActions ? 2 : 0 }}>
              <MuiButton
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => onShowDetail && onShowDetail(applicant)}
                sx={{ 
                  flex: 1,
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#5568d3', bgcolor: '#f5f7ff' }
                }}
              >
                Detail
              </MuiButton>
              <MuiButton
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={() => onChat && onChat(applicant)}
                sx={{ 
                  flex: 1,
                  bgcolor: '#667eea',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#5568d3' }
                }}
              >
                Chat
              </MuiButton>
            </Stack>

            {/* Action Buttons - Conditional */}
            {showActions && (
              <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 2 }}>
                {applicant.status === 'Pending' && (
                  <Stack direction="row" spacing={1.5}>
                    <MuiButton
                      variant="contained"
                      onClick={() => onAccept(applicant.id)}
                      sx={{ 
                        flex: 1,
                        bgcolor: '#66bb6a',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#57a95b' }
                      }}
                    >
                      ✓ Accept
                    </MuiButton>
                    <MuiButton
                      variant="contained"
                      onClick={() => onReject(applicant.id)}
                      sx={{ 
                        flex: 1,
                        bgcolor: '#ef5350',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#e53935' }
                      }}
                    >
                      ✕ Reject
                    </MuiButton>
                  </Stack>
                )}

                {applicant.status === 'Selected' && (
                  <MuiButton
                    variant="outlined"
                    onClick={() => onCancel(applicant.id)}
                    sx={{ 
                      width: '100%',
                      borderColor: '#ef5350',
                      color: '#ef5350',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#e53935', bgcolor: '#ffebee' }
                    }}
                  >
                    Cancel Selection
                  </MuiButton>
                )}

                {applicant.status === 'Accepted' && (
                  <Box 
                    sx={{ 
                      bgcolor: '#e8f5e9',
                      color: '#2e7d32',
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      textAlign: 'center',
                      fontWeight: 700
                    }}
                  >
                    ✓ Accepted
                  </Box>
                )}

                {applicant.status === 'Rejected' && (
                  <Box 
                    sx={{ 
                      bgcolor: '#ffebee',
                      color: '#c62828',
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      textAlign: 'center',
                      fontWeight: 700
                    }}
                  >
                    ✕ Rejected
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
