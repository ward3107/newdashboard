import React from 'react';

/**
 * Input Component - Modern, Accessible Text Input
 *
 * Features:
 * - Clean, minimal design
 * - Focus states
 * - Error states
 * - Icon support
 * - Accessibility built-in
 */

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  errorMessage,
  icon,
  iconPosition = 'right',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyles = {
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
  };

  const inputStyles = {
    width: '100%',
    height: '40px',
    padding: icon
      ? iconPosition === 'right'
        ? '0 var(--space-10) 0 var(--space-4)'
        : '0 var(--space-4) 0 var(--space-10)'
      : '0 var(--space-4)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-gray-900)',
    backgroundColor: disabled ? 'var(--color-gray-100)' : 'var(--bg-primary)',
    border: `1px solid ${
      error
        ? 'var(--color-error)'
        : isFocused
        ? 'var(--color-primary-500)'
        : 'var(--color-gray-300)'
    }`,
    borderRadius: 'var(--radius-lg)',
    outline: 'none',
    transition: 'all var(--transition-base)',
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: isFocused && !error ? '0 0 0 3px var(--color-primary-100)' : 'none',
  };

  const iconStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [iconPosition === 'right' ? 'right' : 'left']: 'var(--space-3)',
    color: error ? 'var(--color-error)' : 'var(--color-gray-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  const errorMessageStyles = {
    marginTop: 'var(--space-2)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-error)',
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div style={containerStyles} className={className}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        style={inputStyles}
        aria-invalid={error}
        aria-describedby={error && errorMessage ? 'error-message' : undefined}
        {...props}
      />

      {icon && <div style={iconStyles}>{icon}</div>}

      {error && errorMessage && (
        <div id="error-message" style={errorMessageStyles} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Input;
