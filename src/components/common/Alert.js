import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Reusable Alert/Toast Component
 * @param {boolean} show - Controls alert visibility
 * @param {string} message - Alert message
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Auto-hide duration in ms (0 = don't auto-hide)
 * @param {function} onClose - Close handler
 */
const Alert = ({
  show,
  message,
  type = 'success',
  duration = 3000,
  onClose,
  position = 'top-right',
}) => {
  React.useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getTypeStyles = () => {
    const types = {
      success: {
        background: COLORS.success,
        icon: '✓',
      },
      error: {
        background: COLORS.danger,
        icon: '✕',
      },
      warning: {
        background: COLORS.warning,
        icon: '⚠',
      },
      info: {
        background: COLORS.info,
        icon: 'ℹ',
      },
    };
    return types[type] || types.success;
  };

  const getPositionStyles = () => {
    const positions = {
      'top-right': { top: '24px', right: '24px' },
      'top-left': { top: '24px', left: '24px' },
      'top-center': { top: '24px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '24px', right: '24px' },
      'bottom-left': { bottom: '24px', left: '24px' },
      'bottom-center': { bottom: '24px', left: '50%', transform: 'translateX(-50%)' },
    };
    return positions[position] || positions['top-right'];
  };

  const typeStyles = getTypeStyles();
  const positionStyles = getPositionStyles();

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles,
        background: typeStyles.background,
        color: COLORS.white,
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: `0 4px 12px ${COLORS.shadowLarge}`,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
        {typeStyles.icon}
      </span>
      <span style={{ flex: 1, fontWeight: 600 }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.white,
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0 4px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
