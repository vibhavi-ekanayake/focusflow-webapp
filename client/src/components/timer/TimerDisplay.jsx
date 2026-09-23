import React from 'react';
import { formatTime } from '../../utils/formatters';
import { BookOpen, Coffee, Plus, Minus } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

const TimerDisplay = ({
  remainingSeconds,
  initialDuration,
  mode = 'focus',
  subject = '',
  isRunning = false,
  isPaused = false
}) => {
  const { adjustTime } = useTimer();

  const percentage = initialDuration > 0
    ? Math.min(100, Math.max(0, ((initialDuration - remainingSeconds) / initialDuration) * 100))
    : 0;

  // SVG circular progress parameters
  const size = 300;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isBreak = mode === 'break';

  return (
    <div className="relative flex flex-col items-center justify-center my-3">
      {/* SVG Circular Progress Ring with ambient glow */}
      <div className="relative w-[300px] h-[300px] sm:w-[330px] sm:h-[330px] flex items-center justify-center">
        {/* Ambient subtle glow ring */}
        <div
          className={`absolute inset-4 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-500 ${
            isRunning
              ? isBreak
                ? 'bg-emerald-500'
                : 'bg-indigo-500'
              : 'opacity-0'
          }`}
        />

        <svg
          className="w-full h-full transform -rotate-90 filter drop-shadow-sm"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200/80 dark:stroke-slate-800/80"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle with smooth round caps */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isBreak ? 'url(#breakGradient)' : 'url(#focusGradient)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none">
          {/* iOS Capsule Mode Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold mb-2 tracking-wide uppercase transition-all duration-300 shadow-ios-sm ${
              isBreak
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
            }`}
          >
            {isBreak ? (
              <>
                <Coffee className="w-3.5 h-3.5" />
                <span>Break Time</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>{subject || 'Focus Mode'}</span>
              </>
            )}
          </div>

          {/* Digital Timer with tactile nudge buttons */}
          <div className="flex items-center justify-center gap-2">
            {/* Quick -5m button */}
            <button
              type="button"
              onClick={() => adjustTime(-300)}
              title="Minus 5 minutes"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Digital Digits */}
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono min-w-[170px] sm:min-w-[200px]">
              {formatTime(remainingSeconds)}
            </div>

            {/* Quick +5m button */}
            <button
              type="button"
              onClick={() => adjustTime(300)}
              title="Add 5 minutes"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Status Subtitle */}
          <div className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            {isRunning ? (
              <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Deep Focus Active
              </span>
            ) : isPaused ? (
              <span className="text-amber-500 font-bold">Session Paused</span>
            ) : (
              <span>Tap Start to Begin</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
