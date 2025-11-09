import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Link
} from '@mui/material';
import {
  Close as CloseIcon,
  Instagram as InstagramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkOutlined as LinkIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const ApplicantDetailModal = ({ isOpen, onClose, applicant }) => {
  if (!applicant) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin!`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Detail Influencer
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Header Section with Avatar */}
        <Box sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              margin: '0 auto 16px',
              bgcolor: '#fff',
              color: '#667eea',
              fontSize: '2.5rem',
              fontWeight: 600,
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {applicant.fullName.charAt(0)}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
            {applicant.fullName}
          </Typography>
          <Typography variant="body1" sx={{ color: '#667eea', fontWeight: 500, mb: 1 }}>
            @{applicant.influencerName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {applicant.niche?.map((n, idx) => (
              <Chip
                key={idx}
                label={n}
                size="small"
                sx={{ bgcolor: 'white', fontWeight: 500 }}
              />
            ))}
          </Box>
        </Box>

        {/* Stats Section */}
        <Box sx={{ display: 'flex', bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ flex: 1, p: 2, textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
              {formatNumber(applicant.followers)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Followers
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
              {applicant.engagementRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Engagement
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, textAlign: 'center' }}>
            <Chip
              label={applicant.status}
              size="small"
              sx={{
                bgcolor: applicant.status === 'Accepted' ? '#4caf50' : 
                         applicant.status === 'Rejected' ? '#f44336' : '#ff9800',
                color: 'white',
                fontWeight: 600
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Status
            </Typography>
          </Box>
        </Box>

        {/* Details Section */}
        <Box sx={{ p: 3 }}>
          {/* Bio */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
              📝 Bio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {applicant.bio}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Personal Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
              👤 Informasi Personal
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Lokasi
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  📍 {applicant.location}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Usia
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  🎂 {applicant.age} tahun
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {applicant.gender === 'Female' ? '👩' : '👨'} {applicant.gender}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Applied Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  📅 {new Date(applicant.appliedDate).toLocaleDateString('id-ID')}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Contact Info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
              📞 Kontak
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#666', fontSize: 20 }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {applicant.email}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(applicant.email, 'Email')}
                  sx={{ color: '#667eea' }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ color: '#666', fontSize: 20 }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {applicant.phone}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(applicant.phone, 'Nomor telepon')}
                  sx={{ color: '#667eea' }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InstagramIcon sx={{ color: '#666', fontSize: 20 }} />
                <Link
                  href={applicant.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ flex: 1, textDecoration: 'none', color: '#667eea', fontWeight: 500 }}
                >
                  @{applicant.influencerName}
                </Link>
                <IconButton
                  size="small"
                  href={applicant.instagram}
                  target="_blank"
                  sx={{ color: '#667eea' }}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Portfolio */}
          {applicant.portfolioLink && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                  🎨 Portfolio
                </Typography>
                <Link
                  href={applicant.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    color: '#667eea',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  <LinkIcon fontSize="small" />
                  Lihat Portfolio
                </Link>
              </Box>
            </>
          )}

          {/* Previous Brands */}
          {applicant.previousBrands && applicant.previousBrands.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                  🤝 Kolaborasi Brand Sebelumnya
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {applicant.previousBrands.map((brand, idx) => (
                    <Chip
                      key={idx}
                      label={brand}
                      size="small"
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantDetailModal;
