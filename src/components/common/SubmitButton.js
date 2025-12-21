import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { COLORS } from '../../constants/colors';

function SubmitButton({ 
  isLoading = false, 
  text = 'Submit', 
  loadingText = 'Loading...', 
  type = 'submit',
  onClick = null,
  fullWidth = true,
  disabled = false,
  sx = {}
}) {
  return (
    <Button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      fullWidth={fullWidth}
      variant="contained"
      sx={{
        py: 2, // 16px
        fontSize: '1rem',
        fontWeight: 600,
        color: 'white',
        background: (isLoading || disabled) ? '#a0aec0' : '#6E00BE',
        borderRadius: 3, // 12px
        boxShadow: (isLoading || disabled) ? 'none' : '0 4px 15px rgba(110, 0, 190, 0.4)',
        textTransform: 'none',
        fontFamily: "'Montserrat', sans-serif",
        transition: 'all 0.3s',
        '&:hover': {
          background: '#5a009e',
          transform: (!isLoading && !disabled) ? 'translateY(-2px)' : 'none',
          boxShadow: (!isLoading && !disabled) ? '0 6px 20px rgba(110, 0, 190, 0.5)' : 'none',
        },
        ...sx
      }}
    >
      {isLoading ? (
        <>
          <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export default SubmitButton;
