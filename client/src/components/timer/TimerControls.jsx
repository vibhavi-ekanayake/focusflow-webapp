import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

const TimerControls = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinish,
  canFinish = true,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 select-none ${className}`}>
      {/* Primary Action Button: Start / Pause / Resume */}
      {!isRunning && !isPaused ? (
        <Button
          onClick={onStart}
          variant="primary"
          size="lg"
          icon={Play}
          className="px-8 shadow-md shadow-indigo-500/25 min-w-[140px]"
        >
          Start
        </Button>
      ) : isRunning ? (
        <Button
          onClick={onPause}
          variant="secondary"
          size="lg"
          icon={Pause}
          className="px-8 min-w-[140px]"
        >
          Pause
        </Button>
      ) : (
        <Button
          onClick={onResume}
          variant="primary"
          size="lg"
          icon={Play}
          className="px-8 shadow-md shadow-indigo-500/25 min-w-[140px]"
        >
          Resume
        </Button>
      )}

      {/* Finish Session button (active once session has commenced) */}
      {(isRunning || isPaused) && canFinish && (
        <Button
          onClick={onFinish}
          variant="success"
          size="lg"
          icon={CheckCircle2}
          className="shadow-sm"
        >
          Finish Session
        </Button>
      )}

      {/* Reset Button */}
      {(isRunning || isPaused) && (
        <Button
          onClick={onReset}
          variant="ghost"
          size="lg"
          icon={RotateCcw}
          title="Reset timer"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          Reset
        </Button>
      )}
    </div>
  );
};

export default TimerControls;
