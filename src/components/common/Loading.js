import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Reusable Loading Component
 * @param {string} size - Loading spinner size: 'small', 'medium', 'large'
 * @param {string} text - Optional loading text
 * @param {boolean} fullScreen - If true, covers full screen
 */
const Loading = ({ size = 'medium', text, fullScreen = false }) => {
  const getSizeStyles = () => {
    const sizes = {
      small: { width: '24px', height: '24px', borderWidth: '3px' },
      medium: { width: '40px', height: '40px', borderWidth: '4px' },
      large: { width: '60px', height: '60px', borderWidth: '5px' },
    };
    return sizes[size] || sizes.medium;
  };

  const sizeStyles = getSizeStyles();

  const spinnerStyles = {
    ...sizeStyles,
    border: `${sizeStyles.borderWidth} solid ${COLORS.borderLight}`,
    borderTop: `${sizeStyles.borderWidth} solid ${COLORS.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyles = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyles}>
        <div style={spinnerStyles} />
        {text && (
          <div
            style={{
              marginTop: '12px',
              color: COLORS.textSecondary,
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          >
            {text}
          </div>
        )}
      </div>
    </>
  );
};

export default Loading;
