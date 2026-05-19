import React, { memo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Button Component
 * Reusable button with variants, loading state, and mobile-optimized touch handling
 */
const Button: React.FC<ButtonProps> = memo(({ 
  children, 
  variant = 'primary', 
  isLoading, 
  size = 'md',
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = `
    font-medium transition-all duration-200 
    flex items-center justify-center gap-2 
    disabled:opacity-50 disabled:cursor-not-allowed 
    tracking-wide touch-manipulation
    active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
  `;
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 rounded-md text-xs',
    md: 'px-4 py-2.5 rounded-lg text-sm',
    lg: 'px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base'
  };
  
  const variants = {
    primary: `
      bg-indigo-600 hover:bg-indigo-500 text-white 
      shadow-lg shadow-indigo-500/20 
      border border-indigo-500/50 hover:border-indigo-400
      focus-visible:ring-indigo-500
      active:bg-indigo-700
    `,
    secondary: `
      bg-zinc-800 hover:bg-zinc-700 text-zinc-200 
      border border-zinc-700 hover:border-zinc-600 
      shadow-sm
      focus-visible:ring-zinc-500
      active:bg-zinc-900
    `,
    danger: `
      bg-red-500/10 hover:bg-red-500/20 text-red-400 
      border border-red-500/20 hover:border-red-500/40
      focus-visible:ring-red-500
      active:bg-red-500/30
    `,
    ghost: `
      text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50
      focus-visible:ring-zinc-500
      active:bg-zinc-800
    `
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`.replace(/\s+/g, ' ').trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
