import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Statistic Card Component for displaying metrics
 * @param {string} label - Card label (legacy support)
 * @param {string} title - Card title/label
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Additional info
 * @param {string} icon - Emoji icon to display (legacy support)
 * @param {Component} IconComponent - Material-UI icon component
 * @param {string} variant - Card variant: 'primary', 'white'
 * @param {string} gradient - Custom gradient background
 * @param {string} valueColor - Custom color for value
 */
const StatCard = ({ 
  label,
  title, 
  value, 
  subtitle,
  icon,
  IconComponent,
  variant = 'white',
  gradient,
  valueColor,
}) => {
  const displayTitle = title || label; // Support both title and label props

  const getVariantStyles = () => {
    // If gradient is provided, use it
    if (gradient) {
      return {
        background: gradient,
        color: COLORS.white,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      };
    }

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
  const isColoredBackground = variant === 'primary' || gradient;

  return (
    <div
      style={{
        ...variantStyles,
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
    >
      {/* Icon (if provided) */}
      {(icon || IconComponent) && (
        <div style={{ 
          fontSize: '2rem', 
          marginBottom: '12px',
          opacity: isColoredBackground ? 0.9 : 1
        }}>
          {IconComponent ? (
            <IconComponent sx={{ fontSize: 40, color: isColoredBackground ? COLORS.white : COLORS.primary }} />
          ) : (
            icon
          )}
        </div>
      )}

      {/* Title/Label */}
      {displayTitle && (
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: '600',
          opacity: isColoredBackground ? 0.9 : 1,
          color: isColoredBackground ? COLORS.white : COLORS.textSecondary,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {displayTitle}
        </div>
      )}

      {/* Value */}
      <div style={{ 
        fontSize: '2.5rem', 
        fontWeight: 700,
        color: valueColor || (isColoredBackground ? COLORS.white : COLORS.textPrimary),
        lineHeight: '1'
      }}>
        {value}
      </div>

      {/* Subtitle (if provided) */}
      {subtitle && (
        <div style={{ 
          fontSize: '0.85rem', 
          opacity: isColoredBackground ? 0.8 : 1,
          color: isColoredBackground ? COLORS.white : COLORS.textSecondary,
          marginTop: '8px' 
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
