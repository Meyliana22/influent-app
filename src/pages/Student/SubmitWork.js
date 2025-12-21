import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  LinearProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack, CloudUpload, CheckCircle } from '@mui/icons-material';

export default function SubmitWork({ collaboration, onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        alert('File size should not exceed 100MB');
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file type (JPEG, PNG, PDF, MP4, MOV)');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) progress = 100;
      setUploadProgress(progress);
      if (progress === 100) {
        clearInterval(interval);
        setIsSubmitted(true);
      }
    }, 300);
  };

  if (isSubmitted) {
    return (
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack sx={{ fontSize: '0.9rem' }} />}
          onClick={onBack}
          sx={{
            mb: 3,
            color: '#6E00BE',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(110, 0, 190, 0.05)',
            },
          }}
        >
          Back to Collaboration
        </Button>

        <Card
          sx={{
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #f5f3ff 0%, #faf8ff 100%)',
            textAlign: 'center',
            p: 4,
          }}
        >
          <CardContent>
            <CheckCircle
              sx={{
                fontSize: '5rem',
                color: '#2d8659',
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                mb: 1.5,
              }}
            >
              Work Submitted Successfully!
            </Typography>
            <Typography
              sx={{
                color: '#6c757d',
                fontSize: '1rem',
                lineHeight: 1.6,
                maxWidth: '500px',
                mx: 'auto',
                mb: 3,
              }}
            >
              Your work proof and details have been uploaded. Please wait for{' '}
              <span style={{ fontWeight: 600, color: '#1a1a2e' }}>
                {collaboration.brand}
              </span>{' '}
              to review your work. We'll notify you once they've reviewed it.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                onClick={onBack}
                sx={{
                  background: '#6E00BE',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                }}
              >
                Back to Collaborations
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack sx={{ fontSize: '0.9rem' }} />}
        onClick={onBack}
        sx={{
          mb: 3,
          color: '#6E00BE',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(110, 0, 190, 0.05)',
          },
        }}
      >
        Back to Collaboration
      </Button>

      <Card
        sx={{
          borderRadius: '16px',
          border: 'none',
          background: 'linear-gradient(135deg, #f5f3ff 0%, #faf8ff 100%)',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 1,
            }}
          >
            Submit Your Work
          </Typography>
          <Typography
            sx={{
              color: '#6c757d',
              mb: 3,
            }}
          >
            Campaign: <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{collaboration.title}</span>
          </Typography>

          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: '12px',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              border: 'none',
            }}
          >
            Please upload your work proof and provide details about your submission.
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Work Title */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#6c757d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1,
                }}
              >
                Work Title
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g., Instagram Reel - Summer Campaign"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#6E00BE',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6E00BE',
                    },
                  },
                }}
              />
            </Box>

            {/* Description */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#6c757d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1,
                }}
              >
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Describe your work, what you did, any challenges you overcame, etc."
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#6E00BE',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6E00BE',
                    },
                  },
                }}
              />
            </Box>

            {/* File Upload */}
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#6c757d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1,
                }}
              >
                Upload Proof
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #6E00BE',
                  borderRadius: '12px',
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backgroundColor: formData.file ? 'rgba(45, 134, 89, 0.05)' : 'rgba(110, 0, 190, 0.02)',
                  '&:hover': {
                    backgroundColor: formData.file ? 'rgba(45, 134, 89, 0.1)' : 'rgba(110, 0, 190, 0.08)',
                  },
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                component="label"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.size > 100 * 1024 * 1024) {
                      alert('File size should not exceed 100MB');
                      return;
                    }
                    const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/quicktime'];
                    if (!validTypes.includes(file.type)) {
                      alert('Please upload a valid file type (JPEG, PNG, PDF, MP4, MOV)');
                      return;
                    }
                    setFormData(prev => ({
                      ...prev,
                      file: file
                    }));
                  }
                }}
              >
                <input
                  hidden
                  accept="image/jpeg,image/png,application/pdf,video/mp4,video/quicktime"
                  type="file"
                  onChange={handleFileChange}
                />
                <Box sx={{ 
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: formData.file ? 'rgba(45, 134, 89, 0.1)' : 'rgba(110, 0, 190, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}>
                  <CloudUpload
                    sx={{
                      fontSize: '2.5rem',
                      color: formData.file ? '#2d8659' : '#6E00BE',
                    }}
                  />
                </Box>
                <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a2e',
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      lineHeight: 1.4,
                    }}
                  >
                    {formData.file ? 'File Selected' : 'Click to upload or drag and drop'}
                  </Typography>
                  <Typography sx={{ 
                    color: '#6c757d', 
                    fontSize: '0.875rem',
                    mb: 2,
                    lineHeight: 1.5,
                  }}>
                    PNG, JPG, PDF, MP4 or MOV (Max 100MB)
                  </Typography>
                </Box>
                {formData.file && (
                  <Box sx={{ 
                    mt: 3,
                    p: 2,
                    backgroundColor: 'rgba(45, 134, 89, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '500px',
                    mx: 'auto',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(45, 134, 89, 0.2)'
                  }}>
                    <Typography
                      sx={{
                        color: '#2d8659',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        pr: 1
                      }}
                      title={formData.file.name}
                    >
                      ✓ {formData.file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#2d8659',
                        flexShrink: 0,
                        ml: 1,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                disabled={!formData.title || !formData.description || !formData.file}
                onClick={handleSubmit}
                sx={{
                  background: '#6E00BE',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: '12px',
                  flex: 1,
                  '&:disabled': {
                    background: '#cccccc',
                    cursor: 'not-allowed',
                  },
                }}
              >
                {uploadProgress > 0 && uploadProgress < 100 
                  ? `Uploading... ${Math.round(uploadProgress)}%` 
                  : 'Submit Work'}
              </Button>
              <Button
                variant="outlined"
                onClick={onBack}
                sx={{
                  borderColor: '#6E00BE',
                  color: '#6E00BE',
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: '12px',
                  flex: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(110, 0, 190, 0.05)',
                    borderColor: '#6E00BE',
                  },
                }}
              >
                Cancel
              </Button>
            </Box>

            {/* Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 8,
                    borderRadius: '4px',
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      background: '#6E00BE',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
