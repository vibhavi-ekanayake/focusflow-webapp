import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'rose'
  className = ''
}) => {
  const badgeStyles = {
    indigo: 'bg-indigo-50/80 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-50/80 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-50/80 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'bg-rose-50/80 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border-rose-500/20'
  };

  const iconStyles = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
  };

  return (
    <div
      className={`p-6 rounded-[28px] ios-card transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-ios-hover flex flex-col justify-between group ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-ios-sm ${iconStyles[badgeType] || iconStyles.indigo}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {badge && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-ios-sm ${
                badgeStyles[badgeType] || badgeStyles.indigo
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
