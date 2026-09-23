import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  actionText,
  onAction,
  actionIcon: ActionIcon
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      {Icon && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4 ring-1 ring-indigo-500/10">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} icon={ActionIcon} size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
