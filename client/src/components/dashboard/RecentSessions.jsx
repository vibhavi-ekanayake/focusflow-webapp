import React from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowRight, Clock, Calendar } from 'lucide-react';
import { formatDurationHuman, formatDate, formatTimeOfDay } from '../../utils/formatters';

const RecentSessions = ({ sessions = [], className = '' }) => {
  return (
    <div
      className={`p-6 sm:p-7 rounded-[28px] ios-card shadow-ios border border-white/60 dark:border-white/10 flex flex-col justify-between transition-all duration-300 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recent Sessions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest completed study activity
              </p>
            </div>
          </div>

          <Link
            to="/sessions"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No study sessions yet today.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Start your first focus session and your progress will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 4).map((session) => (
              <div
                key={session._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between gap-3 border border-slate-100 dark:border-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {session.subject}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {formatDurationHuman(session.duration)}
                    </span>
                  </div>

                  {session.notes ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {session.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-1">No notes</p>
                  )}
                </div>

                <div className="text-right shrink-0 text-[11px] text-slate-400">
                  <div className="flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(session.startedAt)}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeOfDay(session.startedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <Link
            to="/sessions"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Review all {sessions.length} recorded sessions &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentSessions;
