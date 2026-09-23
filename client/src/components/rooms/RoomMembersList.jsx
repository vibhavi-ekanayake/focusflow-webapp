import React from 'react';
import { Users, Crown, Zap, Coffee, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RoomMembersList = ({
  members = [],
  hostId,
  currentMemberStatus,
  onStatusChange
}) => {
  const { user } = useAuth();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'focusing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Focusing
          </span>
        );
      case 'break':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Coffee className="w-2.5 h-2.5" />
            Break
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            <Moon className="w-2.5 h-2.5" />
            Idle
          </span>
        );
    }
  };

  return (
    <div className="p-5 rounded-[28px] ios-card shadow-ios border border-white/40 dark:border-white/10 space-y-4 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Study Buddies ({members.length})
          </h3>
        </div>

        {/* Quick status selector for current user */}
        <select
          value={currentMemberStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="focusing">⚡ I'm Focusing</option>
          <option value="break">☕ Taking Break</option>
          <option value="idle">💤 Idle</option>
        </select>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {members.map((member) => {
          const isCurrentUser = member.user === user?.id || member.user === user?._id;
          const isHostMember = member.role === 'host' || member.user === hostId;

          return (
            <div
              key={member.user}
              className={`p-2.5 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                isCurrentUser
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40'
                  : 'bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {member.name} {isCurrentUser && <span className="font-normal text-slate-400">(You)</span>}
                    </p>
                    {isHostMember && (
                      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Room Host" />
                    )}
                  </div>
                  {member.currentSubject && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {member.currentSubject}
                    </p>
                  )}
                </div>
              </div>

              <div>{getStatusBadge(member.status)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomMembersList;
