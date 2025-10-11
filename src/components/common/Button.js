import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Reusable Button Component
 * @param {string} variant - Button style variant: 'primary', 'secondary', 'outline', 'danger', 'success'
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} fullWidth - If true, button takes full width
 * @param {boolean} disabled - If true, button is disabled
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {object} style - Additional inline styles
 */
const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    const variants = {
      primary: {
        background: COLORS.gradientPrimary,
        color: COLORS.textWhite,
        border: 'none',
      },
      secondary: {
        background: COLORS.gradientSecondary,
        color: COLORS.textWhite,
        border: 'none',
      },
      outline: {
        background: 'transparent',
        color: COLORS.primary,
        border: `2px solid ${COLORS.primary}`,
      },
      danger: {
        background: COLORS.danger,
        color: COLORS.textWhite,
        border: 'none',
      },
      success: {
        background: COLORS.success,
        color: COLORS.textWhite,
        border: 'none',
      },
      ghost: {
        background: 'transparent',
        color: COLORS.textSecondary,
        border: 'none',
      },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      small: {
        padding: '8px 16px',
        fontSize: '0.875rem',
      },
      medium: {
        padding: '12px 24px',
        fontSize: '1rem',
      },
      large: {
        padding: '16px 32px',
        fontSize: '1.1rem',
      },
    };
    return sizes[size] || sizes.medium;
  };

  const buttonStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    borderRadius: '10px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'Montserrat, Arial, sans-serif',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  return (
    <button
      style={buttonStyles}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
