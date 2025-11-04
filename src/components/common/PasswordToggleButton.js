import React from 'react';
import eyeIcon from '../../assets/auth/eye.svg';
import eyeOffIcon from '../../assets/auth/eye-off.svg';

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

  const imgStyles = {
    width: '20px',
    height: '20px',
    display: 'block',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={buttonStyles}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
    >
      <img
        src={show ? eyeOffIcon : eyeIcon}
        alt={show ? 'Hide password' : 'Show password'}
        style={imgStyles}
      />
    </button>
  );
};

export default PasswordToggleButton;
