import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTimer } from '../../context/TimerContext';
import { formatTime } from '../../utils/formatters';
import { Play, Pause, Maximize2, Sparkles, BookOpen } from 'lucide-react';

const DynamicIsland = () => {
  const {
    isRunning,
    isPaused,
    remainingSeconds,
    subject,
    mode,
    pauseTimer,
    resumeTimer,
    openFinishModal
  } = useTimer();

  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show if timer hasn't started or if we are already on fullscreen /timer page
  if (!isRunning && !isPaused) return null;
  if (location.pathname === '/timer') return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none animate-bounce-in">
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/90 text-white border border-white/20 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-spring ${
          isExpanded ? 'scale-105 shadow-indigo-500/20' : 'scale-100'
        }`}
      >
        {/* Pulsing Status Dot */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPaused
                ? 'bg-amber-400'
                : 'bg-emerald-400 animate-ping'
            }`}
          />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 hidden sm:inline">
            {isPaused ? 'Paused' : mode === 'break' ? 'Break' : 'Focus'}
          </span>
        </div>

        <span className="text-slate-600 text-xs">|</span>

        {/* Subject & Digital Time */}
        <div
          onClick={() => navigate('/timer')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Click to open full timer"
        >
          <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate max-w-[100px]">
            {subject || 'Study Block'}
          </span>
          <span className="text-sm font-extrabold font-mono text-white tracking-tight">
            {formatTime(remainingSeconds)}
          </span>
        </div>

        {/* Quick Play/Pause Control Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isRunning) {
              pauseTimer();
            } else {
              resumeTimer();
            }
          }}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-white"
          title={isRunning ? 'Pause' : 'Resume'}
          aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
        </button>

        {/* Maximize to dedicated timer page */}
        <button
          onClick={() => navigate('/timer')}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Open fullscreen timer"
          aria-label="Open full timer page"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DynamicIsland;
