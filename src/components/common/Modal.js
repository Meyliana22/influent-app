import React from 'react';
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
  if (!isOpen) return null;

  const getVariantColor = () => {
    const variants = {
      default: 'primary',
      danger: 'danger',
      success: 'success',
    };
    return variants[variant] || 'primary';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: `0 8px 32px ${COLORS.shadowLarge}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <h3
            style={{
              margin: '0 0 20px 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: COLORS.textPrimary,
            }}
          >
            {title}
          </h3>
        )}

        {/* Content */}
        <div style={{ marginBottom: showActions ? '24px' : 0 }}>
          {children}
        </div>

        {/* Actions */}
        {showActions && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button variant={getVariantColor()} onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
