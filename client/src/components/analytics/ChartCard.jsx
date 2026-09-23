import React from 'react';

const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  className = ''
}) => {
  return (
    <div
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
