import React from 'react';

/**
 * Card Component - Modern Container
 *
 * Variants:
 * - default: Standard card with border
 * - elevated: Card with shadow
 * - flat: No border, no shadow
 * - gradient: Light blue to purple gradient background
 *
 * Features:
 * - Hover effects
 * - Clickable option
 * - Padding variants
 * - Custom gradient support
 */

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  style = {},
  gradient = null,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const paddingMap = {
    none: '0',
    sm: 'var(--space-4)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)',
  };

  const baseStyles = {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-xl)',
    padding: paddingMap[padding],
    transition: 'all var(--transition-base)',
    cursor: clickable ? 'pointer' : 'default',
  };

  const variantStyles = {
    default: {
      border: '1px solid var(--color-gray-200)',
      boxShadow: 'none',
    },
    elevated: {
      border: '1px solid var(--color-gray-200)',
      boxShadow: 'var(--shadow-sm)',
    },
    flat: {
      border: 'none',
      boxShadow: 'none',
    },
    gradient: {
      border: 'none',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  };

  const hoverStyles =
    (hoverable || clickable) && isHovered
      ? {
          borderColor: 'var(--color-gray-300)',
          boxShadow: 'var(--shadow-md)',
          transform: 'translateY(-2px)',
        }
      : {};

  const cardStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...hoverStyles,
    ...style,
  };

  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      style={cardStyles}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => (hoverable || clickable) && setIsHovered(true)}
      onMouseLeave={() => (hoverable || clickable) && setIsHovered(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
