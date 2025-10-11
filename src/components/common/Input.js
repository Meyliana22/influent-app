import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Reusable Input Component
 * @param {string} type - Input type (text, email, password, tel, etc.)
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {boolean} required - If true, field is required
 * @param {boolean} disabled - If true, input is disabled
 * @param {string} error - Error message to display
 * @param {object} style - Additional inline styles
 */
const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  style = {},
  ...props
}) => {
  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${error ? COLORS.danger : COLORS.border}`,
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'Montserrat, Arial, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: disabled ? COLORS.backgroundLight : COLORS.white,
    cursor: disabled ? 'not-allowed' : 'text',
    ...style,
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: COLORS.textPrimary,
    fontSize: '0.95rem',
  };

  const errorStyles = {
    marginTop: '6px',
    fontSize: '0.85rem',
    color: COLORS.danger,
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: COLORS.danger }}> *</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={inputStyles}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = COLORS.primary;
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = COLORS.border;
          }
        }}
        {...props}
      />
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

export default Input;
