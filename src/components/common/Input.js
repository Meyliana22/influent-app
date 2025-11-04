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
 * @param {string} error - Error message to display (single string)
 * @param {array} errors - Multiple error messages to display (array of strings)
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
  errors = [],
  style = {},
  ...props
}) => {
  const hasError = error || errors.length > 0;
  
  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${hasError ? COLORS.danger : COLORS.border}`,
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'Montserrat, Arial, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: disabled ? COLORS.backgroundLight : COLORS.white,
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box',
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
    marginTop: '8px',
    fontSize: '0.85rem',
    color: COLORS.danger,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const errorItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
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
          if (!hasError) {
            e.target.style.borderColor = COLORS.primary;
          }
        }}
        onBlur={(e) => {
          if (!hasError) {
            e.target.style.borderColor = COLORS.border;
          }
        }}
        {...props}
      />
      {error && (
        <div style={errorStyles}>
          <span style={{ fontSize: '1rem' }}>❌</span>
          {error}
        </div>
      )}
      {errors.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          {errors.map((err, index) => (
            <div key={index} style={errorItemStyles}>
              <span style={{ fontSize: '1rem', color: COLORS.danger }}>❌</span>
              <span style={{ fontSize: '0.85rem', color: COLORS.danger }}>{err}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Input;
