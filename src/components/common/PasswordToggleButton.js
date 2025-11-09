import React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { COLORS } from '../../constants/colors';

/**
 * PasswordToggleButton - Reusable button for show/hide password
 * 
 * Props:
 * - show (boolean): Whether password is currently visible
 * - onClick (function): Handler when button is clicked
 * - style (object): Additional styles
 */
const PasswordToggleButton = ({ show, onClick, style = {} }) => {
  const buttonStyles = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    ...style,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={buttonStyles}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
    >
      {show ? (
        <VisibilityOffIcon sx={{ fontSize: 22, color: COLORS.textSecondary }} />
      ) : (
        <VisibilityIcon sx={{ fontSize: 22, color: COLORS.textSecondary }} />
      )}
    </button>
  );
};

export default PasswordToggleButton;
