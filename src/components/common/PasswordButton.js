import React from 'react';
import eyeIcon from '../../assets/auth/eye.svg';
import eyeOffIcon from '../../assets/auth/eye-off.svg';

const PasswordButton = ({
  show,
  onClick,
  style = {},
  ...props
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
    style={{
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      padding: 0,
      ...style
    }}
    {...props}
  >
    {show
      ? <img src={eyeIcon} alt="Hide password" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
      : <img src={eyeOffIcon} alt="Show password" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
    }
  </button>
);

export default PasswordButton;