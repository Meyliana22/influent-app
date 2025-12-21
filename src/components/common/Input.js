import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
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
 * @param {object} sx - Additional styles
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
  sx = {},
  ...props
}) => {
  const hasError = Boolean(error || errors.length > 0);
  
  // Combine error messages
  const errorMessage = error || (errors.length > 0 ? errors[0] : null);
  
  // Additional errors if any
  const additionalErrors = errors.length > 1 ? errors.slice(1) : [];

  return (
    <Box sx={{ mb: 2.5, width: '100%', ...sx }}>
      {label && (
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: COLORS.textPrimary,
            fontSize: '0.95rem'
          }}
        >
          {label}
          {required && <span style={{ color: COLORS.danger }}> *</span>}
        </Typography>
      )}
      <TextField
        type={type}
        fullWidth
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        error={hasError}
        helperText={errorMessage}
        variant="outlined"
        size="medium"
        InputProps={{
          sx: {
            borderRadius: '10px',
            bgcolor: disabled ? COLORS.backgroundLight : COLORS.white,
            fontSize: '1rem',
            '& fieldset': {
              borderColor: hasError ? COLORS.danger : COLORS.border,
            },
            '&:hover fieldset': {
              borderColor: hasError ? COLORS.danger : COLORS.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: hasError ? COLORS.danger : COLORS.primary,
            },
          }
        }}
        {...props}
      />
      
      {additionalErrors.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          {additionalErrors.map((err, index) => (
            <Typography 
              key={index} 
              variant="caption" 
              color="error" 
              sx={{ display: 'block', ml: 1.5 }}
            >
              {err}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Input;
