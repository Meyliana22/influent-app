import React from 'react';
import { COLORS } from '../../constants/colors';

/**
 * Reusable Card Component
 * @param {React.ReactNode} children - Card content
 * @param {string} padding - Card padding size: 'small', 'medium', 'large'
 * @param {boolean} hoverable - If true, card has hover effect
 * @param {function} onClick - Click handler
 * @param {object} style - Additional inline styles
 */
const Card = ({
  children,
  padding = 'medium',
  hoverable = false,
  onClick,
  style = {},
  ...props
}) => {
  const getPaddingSize = () => {
    const paddings = {
      small: '16px',
      medium: '24px',
      large: '32px',
    };
    return paddings[padding] || paddings.medium;
  };

  const baseStyles = {
    background: COLORS.white,
    borderRadius: '16px',
    padding: getPaddingSize(),
    boxShadow: `0 4px 16px ${COLORS.shadowMedium}`,
    transition: 'all 0.3s',
    cursor: onClick ? 'pointer' : 'default',
    width: '100%',
    flex: '1',
    ...style,
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const hoverStyles = hoverable && isHovered ? {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${COLORS.shadowLarge}`,
  } : {};

  return (
    <div
      style={{ ...baseStyles, ...hoverStyles }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
