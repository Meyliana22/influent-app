import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Statistic Card Component for displaying metrics
 * @param {string} label - Card label
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Additional info
 * @param {string} variant - Card variant: 'primary', 'white'
 * @param {string} valueColor - Custom color for value
 */
const StatCard = ({ 
  label, 
  value, 
  subtitle, 
  variant = 'white',
  valueColor,
}) => {
  const getVariantStyles = () => {
    if (variant === 'primary') {
      return {
        background: COLORS.gradientPrimary,
        color: COLORS.white,
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
      };
    }
    return {
      background: COLORS.white,
      color: COLORS.textPrimary,
      boxShadow: `0 4px 16px ${COLORS.shadowMedium}`,
    };
  };

  const variantStyles = getVariantStyles();

  return (
    <div
      style={{
        ...variantStyles,
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div style={{ 
        fontSize: '0.9rem', 
        opacity: variant === 'primary' ? 0.9 : 1,
        color: variant === 'primary' ? COLORS.white : COLORS.textSecondary,
        marginBottom: '8px' 
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: 700,
        color: valueColor || (variant === 'primary' ? COLORS.white : COLORS.textPrimary),
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: '0.85rem', 
          opacity: variant === 'primary' ? 0.8 : 1,
          color: variant === 'primary' ? COLORS.white : COLORS.textSecondary,
          marginTop: '8px' 
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
