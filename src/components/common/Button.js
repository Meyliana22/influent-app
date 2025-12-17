import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { COLORS } from '../../constants/colors';

/**
 * Reusable Button Component
 * @param {string} variant - Button style variant: 'primary', 'secondary', 'outline', 'danger', 'success', 'ghost'
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} fullWidth - If true, button takes full width
 * @param {boolean} disabled - If true, button is disabled
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {object} sx - Additional styles
 */
const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  sx = {},
  ...props
}) => {
  const getMuiVariant = () => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getMuiColor = () => {
    switch (variant) {
      case 'danger':
        return 'error';
      case 'success':
        return 'success';
      case 'secondary':
        return 'secondary';
      case 'primary':
      default:
        return 'primary';
    }
  };

  const getCustomStyles = () => {
    const baseSx = {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: "'Montserrat', sans-serif",
      boxShadow: variant === 'ghost' || variant === 'outline' ? 'none' : undefined,
    };

    if (variant === 'primary') {
      return {
        ...baseSx,
        background: COLORS.gradientPrimary,
        color: COLORS.textWhite,
        '&:hover': {
          opacity: 0.9,
          background: COLORS.gradientPrimary
        }
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseSx,
        background: COLORS.gradientSecondary,
        color: COLORS.textWhite,
        '&:hover': {
          opacity: 0.9,
          background: COLORS.gradientSecondary
        }
      };
    }

    return baseSx;
  };

  return (
    <MuiButton
      variant={getMuiVariant()}
      color={getMuiColor()}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      sx={{
        ...getCustomStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
