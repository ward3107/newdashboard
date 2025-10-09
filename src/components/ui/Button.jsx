import React from 'react';

/**
 * Button Component - Modern, Accessible, Professional
 *
 * Variants:
 * - primary: Main action button (blue, filled)
 * - secondary: Secondary action (white, bordered)
 * - ghost: Subtle action (transparent, hover effect)
 * - danger: Destructive action (red, filled)
 *
 * Sizes:
 * - sm: Small (32px height)
 * - md: Medium (40px height) - default
 * - lg: Large (48px height)
 */

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--font-medium)',
    borderRadius: 'var(--radius-lg)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.5 : 1,
  };

  // Size variants
  const sizeStyles = {
    sm: {
      height: '32px',
      padding: '0 var(--space-3)',
      fontSize: 'var(--text-sm)',
      gap: 'var(--space-2)',
    },
    md: {
      height: '40px',
      padding: '0 var(--space-4)',
      fontSize: 'var(--text-sm)',
      gap: 'var(--space-2)',
    },
    lg: {
      height: '48px',
      padding: '0 var(--space-6)',
      fontSize: 'var(--text-base)',
      gap: 'var(--space-3)',
    },
  };

  // Color variants
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary-600)',
      color: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--color-gray-700)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--color-gray-300)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-gray-700)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  // Hover styles
  const getHoverStyles = () => {
    if (disabled || loading) return {};

    const hoverMap = {
      primary: {
        backgroundColor: 'var(--color-primary-700)',
      },
      secondary: {
        backgroundColor: 'var(--color-gray-50)',
        borderColor: 'var(--color-gray-400)',
      },
      ghost: {
        backgroundColor: 'var(--color-gray-100)',
      },
      danger: {
        backgroundColor: '#dc2626',
      },
    };

    return hoverMap[variant] || {};
  };

  // Active/Pressed styles
  const getActiveStyles = () => {
    if (disabled || loading) return {};

    const activeMap = {
      primary: {
        backgroundColor: 'var(--color-primary-800)',
        transform: 'translateY(1px)',
      },
      secondary: {
        backgroundColor: 'var(--color-gray-100)',
        transform: 'translateY(1px)',
      },
      ghost: {
        backgroundColor: 'var(--color-gray-200)',
        transform: 'translateY(1px)',
      },
      danger: {
        backgroundColor: '#b91c1c',
        transform: 'translateY(1px)',
      },
    };

    return activeMap[variant] || {};
  };

  const buttonStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered ? getHoverStyles() : {}),
    ...(isPressed ? getActiveStyles() : {}),
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      style={buttonStyles}
      className={className}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
          aria-label="טוען..."
        />
      )}

      {!loading && icon && iconPosition === 'right' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}

      {!loading && children}

      {!loading && icon && iconPosition === 'left' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
    </button>
  );
};

// Add keyframe animation for loading spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}

export default Button;
