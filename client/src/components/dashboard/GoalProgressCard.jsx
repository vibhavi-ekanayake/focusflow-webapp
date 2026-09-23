import React from 'react';
import { Target, Award, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMinutesHuman } from '../../utils/formatters';

const GoalProgressCard = ({
  todayMinutes = 0,
  dailyGoalMinutes = 120,
  className = ''
}) => {
  const percentage = dailyGoalMinutes > 0
    ? Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))
    : 0;

  const remaining = Math.max(0, dailyGoalMinutes - todayMinutes);
  const isGoalReached = todayMinutes >= dailyGoalMinutes && dailyGoalMinutes > 0;

  return (
    <div className={`p-6 sm:p-7 rounded-[28px] ios-card shadow-ios border border-white/60 dark:border-white/10 flex flex-col justify-between transition-all duration-300 ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Daily Goal Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target: {formatMinutesHuman(dailyGoalMinutes)}
              </p>
            </div>
          </div>

          <Link
            to="/goals"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-0.5"
          >
            <span>Adjust</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress ratio numbers */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatMinutesHuman(todayMinutes)}
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500 ml-1.5">
              / {formatMinutesHuman(dailyGoalMinutes)}
            </span>
          </span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {percentage}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGoalReached
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        {isGoalReached ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <Award className="w-4 h-4" />
            Goal achieved today! Outstanding effort.
          </span>
        ) : (
          <span>
            {formatMinutesHuman(remaining)} left to complete today's goal
          </span>
        )}
      </div>
    </div>
  );
};

export default GoalProgressCard;
