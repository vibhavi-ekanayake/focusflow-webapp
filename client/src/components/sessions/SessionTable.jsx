import React, { useState } from 'react';
import { Trash2, Calendar, Clock, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { formatDurationHuman, formatDate, formatTimeOfDay } from '../../utils/formatters';
import ConfirmDialog from '../common/ConfirmDialog';
import Button from '../common/Button';

const SessionTable = ({
  sessions = [],
  pagination = {},
  onPageChange,
  onDeleteSession,
  isDeleting = false
}) => {
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await onDeleteSession(sessionToDelete._id);
      setSessionToDelete(null);
    }
  };

  const { page = 1, pages = 1, total = 0 } = pagination;

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-6">Subject</th>
              <th className="py-3.5 px-6">Duration</th>
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6">Time Window</th>
              <th className="py-3.5 px-6">Notes</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {sessions.map((session) => (
              <tr
                key={session._id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{session.subject}</span>
                  </div>
                </td>
                <td className="py-4 px-6 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                  {formatDurationHuman(session.duration)}
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                  {formatDate(session.startedAt)}
                </td>
                <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                  {formatTimeOfDay(session.startedAt)} &rarr; {formatTimeOfDay(session.completedAt)}
                </td>
                <td className="py-4 px-6 max-w-xs text-xs text-slate-600 dark:text-slate-400 truncate">
                  {session.notes || <span className="text-slate-400 italic">No notes recorded</span>}
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => setSessionToDelete(session)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete session"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack View */}
      <div className="md:hidden space-y-3">
        {sessions.map((session) => (
          <div
            key={session._id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {session.subject}
                </span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                  {formatDurationHuman(session.duration)}
                </div>
              </div>
              <button
                onClick={() => setSessionToDelete(session)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                aria-label="Delete session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {session.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {session.notes}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(session.startedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeOfDay(session.startedAt)} - {formatTimeOfDay(session.completedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing page <strong className="text-slate-700 dark:text-slate-200">{page}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{pages}</strong> ({total} total)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Session Deletion */}
      <ConfirmDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Study Session?"
        message={`Are you sure you want to delete this ${sessionToDelete?.subject} session (${formatDurationHuman(
          sessionToDelete?.duration
        )})? This will update your streak and analytics.`}
        confirmText="Delete Session"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SessionTable;
