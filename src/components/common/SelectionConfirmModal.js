import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box
} from '@mui/material';
import Button from './Button';

const SelectionConfirmModal = ({
  isOpen,
  onClose,
  applicantName,
  influencerName,
  currentSelection,
  onConfirm
}) => {
  const action = currentSelection ? 'membatalkan pilihan' : 'memilih';
  const actionColor = currentSelection ? 'error' : 'success';

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          padding: '8px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Konfirmasi {currentSelection ? 'Batalkan' : 'Pilih'} Influencer
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Yakin mau <strong>{action}</strong> influencer ini?
          </Typography>
          
          <Box 
            sx={{ 
              bgcolor: '#f5f5f5',
              borderRadius: '8px',
              padding: '12px 16px',
              mb: 2
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Nama Influencer
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {applicantName}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
              @{influencerName}
            </Typography>
          </Box>

          {!currentSelection && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              💡 Influencer yang dipilih akan ditandai dan bisa Anda hubungi untuk kolaborasi.
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ 
            minWidth: '100px',
            borderColor: '#e0e0e0',
            color: '#666'
          }}
        >
          Batal
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          color={actionColor}
          sx={{ 
            minWidth: '140px',
            bgcolor: currentSelection ? '#f44336' : '#4caf50',
            '&:hover': {
              bgcolor: currentSelection ? '#d32f2f' : '#45a049'
            }
          }}
        >
          Ya, {currentSelection ? 'Batalkan' : 'Pilih'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectionConfirmModal;
