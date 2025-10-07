import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    primary: 'text-white shadow hover:opacity-90',
    secondary: 'shadow-sm hover:opacity-90',
    outline: 'border shadow-sm hover:opacity-90',
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        };
      default:
        return {};
    }
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </button>
  );
};