import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-slate-200 dark:border-slate-800 border-t-indigo-600 animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingSpinner;
