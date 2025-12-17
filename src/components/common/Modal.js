import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Box
} from '@mui/material';
import { COLORS } from '../../constants/colors';
import Button from './Button';

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {function} onConfirm - Confirm button handler
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {string} variant - Modal variant: 'default', 'danger', 'success'
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'default',
  showActions = true,
}) => {
  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          boxShadow: `0 8px 32px ${COLORS.shadowLarge}`,
        }
      }}
    >
      {title && (
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 1,
          fontWeight: 700, 
          fontSize: '1.5rem',
          color: COLORS.textPrimary 
        }}>
          {title}
        </DialogTitle>
      )}

      <DialogContent sx={{ py: 2 }}>
        <Box sx={{ color: COLORS.textSecondary }}>
          {children}
        </Box>
      </DialogContent>

      {showActions && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outline" onClick={onClose} sx={{ mr: 1 }}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button variant={getConfirmVariant()} onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
