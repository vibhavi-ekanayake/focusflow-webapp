import React, { useState, useEffect } from 'react';
import { formatTime, formatDurationHuman } from '../../utils/formatters';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Crown, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { playCompletionChime } from '../../utils/audio';

const RoomTimerWidget = ({
  roomCode,
  timer = {},
  isHost = false,
  subject = '',
  onTimerUpdated,
  onSavePersonalSession
}) => {
  const [remaining, setRemaining] = useState(timer.pausedRemaining || timer.duration || 1500);
  const [isUpdating, setIsUpdating] = useState(false);
  const { addToast } = useToast();

  const isRunning = !!timer.isRunning;
  const targetEndTime = timer.targetEndTime ? new Date(timer.targetEndTime).getTime() : null;
  const initialDuration = timer.duration || 1500;
  const mode = timer.mode || 'focus';

  // Calculate live countdown based on host's synced targetEndTime
  useEffect(() => {
    if (isRunning && targetEndTime) {
      const updateCountdown = () => {
        const diff = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
        setRemaining(diff);

        if (diff <= 0) {
          playCompletionChime();
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 500);
      return () => clearInterval(interval);
    } else {
      setRemaining(timer.pausedRemaining || timer.duration || 1500);
    }
  }, [isRunning, targetEndTime, timer.pausedRemaining, timer.duration]);

  const handleTimerAction = async (action, duration = null) => {
    if (!isHost || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await api.post(`/rooms/${roomCode}/timer`, {
        action,
        duration: duration || initialDuration,
        mode
      });
      if (res.data?.success) {
        onTimerUpdated(res.data.timer);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update timer';
      addToast(msg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModeToggle = async (newMode) => {
    if (!isHost || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await api.post(`/rooms/${roomCode}/timer`, {
        action: 'set-mode',
        mode: newMode,
        duration: newMode === 'break' ? 300 : 1500
      });
      if (res.data?.success) {
        onTimerUpdated(res.data.timer);
      }
    } catch (err) {
      addToast('Failed to switch timer mode', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // SVG parameters
  const size = 240;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = initialDuration > 0
    ? Math.min(100, Math.max(0, ((initialDuration - remaining) / initialDuration) * 100))
    : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="p-6 sm:p-8 rounded-[32px] ios-card shadow-ios border border-white/40 dark:border-white/10 flex flex-col items-center justify-between text-center relative overflow-hidden backdrop-blur-xl">
      {/* Top Tag */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Synchronized Room Timer</span>
        </div>

        {isHost ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Crown className="w-3 h-3" />
            Host Controls
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400">
            Synced with Host
          </span>
        )}
      </div>

      {/* Mode pills (Host can toggle mode) */}
      <div className="my-2">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            disabled={!isHost || isRunning}
            onClick={() => handleModeToggle('focus')}
            className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'focus'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            } disabled:opacity-75`}
          >
            Focus (25m)
          </button>
          <button
            type="button"
            disabled={!isHost || isRunning}
            onClick={() => handleModeToggle('break')}
            className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'break'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            } disabled:opacity-75`}
          >
            Break (5m)
          </button>
        </div>
      </div>

      {/* Circular Timer Ring */}
      <div className="relative w-[240px] h-[240px] flex items-center justify-center my-3 select-none">
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`transition-all duration-300 ${
              mode === 'break' ? 'stroke-emerald-500' : 'stroke-indigo-600'
            }`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatTime(remaining)}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400">
            {isRunning ? (
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Session Active
              </span>
            ) : (
              <span>Paused / Waiting</span>
            )}
          </div>
        </div>
      </div>

      {/* Host Controls */}
      {isHost ? (
        <div className="flex items-center gap-2 mt-2">
          {!isRunning ? (
            <Button
              onClick={() => handleTimerAction('start')}
              variant="primary"
              size="md"
              icon={Play}
              isLoading={isUpdating}
            >
              Start Synced Timer
            </Button>
          ) : (
            <Button
              onClick={() => handleTimerAction('pause')}
              variant="secondary"
              size="md"
              icon={Pause}
              isLoading={isUpdating}
            >
              Pause Timer
            </Button>
          )}

          <Button
            onClick={() => handleTimerAction('reset')}
            variant="ghost"
            size="md"
            icon={RotateCcw}
            title="Reset room timer"
            disabled={isUpdating}
          >
            Reset
          </Button>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          The host controls the synchronized timer for all room members.
        </p>
      )}

      {/* Log study session to personal history */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Elapsed: {formatDurationHuman(Math.max(0, initialDuration - remaining))}
        </span>

        <button
          onClick={() => onSavePersonalSession(Math.max(60, initialDuration - remaining))}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save to My History</span>
        </button>
      </div>
    </div>
  );
};

export default RoomTimerWidget;
