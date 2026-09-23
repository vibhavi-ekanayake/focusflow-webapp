import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.95] hover:scale-[1.01]';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-ios-sm hover:shadow-ios-hover shadow-indigo-500/25 border border-indigo-400/30 focus-visible:ring-indigo-500',
    secondary: 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 focus-visible:ring-slate-400',
    outline: 'border border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 backdrop-blur-md focus-visible:ring-indigo-500 shadow-ios-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-ios-sm shadow-rose-500/20 border border-rose-400/30 focus-visible:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-ios-sm shadow-emerald-500/20 border border-emerald-400/30 focus-visible:ring-emerald-500',
    ghost: 'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-indigo-500'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-xl',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-2xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl font-bold'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
