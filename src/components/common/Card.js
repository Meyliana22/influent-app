import React, { useState } from 'react';
import { Box } from '@mui/material';
import { COLORS } from '../../constants/colors';

/**
 * Reusable Card Component
 * @param {React.ReactNode} children - Card content
 * @param {string} padding - Card padding size: 'small', 'medium', 'large'
 * @param {boolean} hoverable - If true, card has hover effect
 * @param {function} onClick - Click handler
 * @param {object} sx - Additional styles using sx prop
 */
const Card = ({
  children,
  padding = 'medium',
  hoverable = false,
  onClick,
  sx = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPaddingSize = () => {
    const paddings = {
      small: 2, // 16px
      medium: 3, // 24px
      large: 4, // 32px
    };
    return paddings[padding] || paddings.medium;
  };

  return (
    <Box
      sx={{
        bgcolor: COLORS.white,
        borderRadius: 4, // 16px
        p: getPaddingSize(),
        boxShadow: `0 4px 16px ${COLORS.shadowMedium}`,
        transition: 'all 0.3s',
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        flex: 1,
        transform: hoverable && isHovered ? 'translateY(-4px)' : 'none',
        '&:hover': hoverable ? {
          boxShadow: `0 8px 24px ${COLORS.shadowLarge}`,
        } : {},
        ...sx,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card;
