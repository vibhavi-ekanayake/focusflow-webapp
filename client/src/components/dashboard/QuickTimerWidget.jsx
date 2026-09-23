import React, { useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import TimerDisplay from '../timer/TimerDisplay';
import TimerControls from '../timer/TimerControls';
import TimerPresets from '../timer/TimerPresets';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Maximize2, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const POPULAR_SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Biology',
  'Literature',
  'History',
  'Economics',
  'Chemistry'
];

const QuickTimerWidget = ({ className = '' }) => {
  const {
    remainingSeconds,
    initialDuration,
    mode,
    subject,
    setSubject,
    notes,
    setNotes,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    selectPreset,
    isFinishModalOpen,
    openFinishModal,
    closeFinishModal,
    saveSession,
    isSaving,
    elapsedSeconds
  } = useTimer();

  const [modalSubject, setModalSubject] = useState(subject);
  const [modalNotes, setModalNotes] = useState(notes);

  const handleFinishModalOpen = () => {
    setModalSubject(subject);
    setModalNotes(notes);
    openFinishModal();
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();
    await saveSession({
      subject: modalSubject,
      notes: modalNotes
    });
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-[36px] ios-card shadow-ios border border-white/60 dark:border-white/10 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="w-full flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Focus Session
          </h2>
        </div>

        <Link
          to="/timer"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Open Fullscreen Focus Mode"
        >
          <span>Fullscreen</span>
          <Maximize2 className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Presets selector */}
      <div className="w-full my-1 z-10">
        <TimerPresets
          currentDuration={initialDuration}
          onSelectPreset={selectPreset}
          disabled={isRunning}
        />
      </div>

      {/* Circular Progress & Display */}
      <div className="z-10">
        <TimerDisplay
          remainingSeconds={remainingSeconds}
          initialDuration={initialDuration}
          mode={mode}
          subject={subject}
          isRunning={isRunning}
          isPaused={isPaused}
        />
      </div>

      {/* Subject & Controls */}
      <div className="w-full space-y-4 max-w-md z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={subject}
              disabled={isRunning}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Study subject (e.g. Mathematics)"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 transition-colors"
              list="popular-subjects"
            />
            <datalist id="popular-subjects">
              {POPULAR_SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Buttons: Start, Pause, Resume, Reset, Finish */}
        <TimerControls
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onFinish={handleFinishModalOpen}
        />
      </div>

      {/* Finish Session Confirmation Modal */}
      <Modal
        isOpen={isFinishModalOpen}
        onClose={closeFinishModal}
        title="Complete Study Session"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmSave} className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Time Studied
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(elapsedSeconds / 60)} minutes
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {elapsedSeconds}s recorded
            </span>
          </div>

          <Input
            label="Subject"
            value={modalSubject}
            onChange={(e) => setModalSubject(e.target.value)}
            placeholder="e.g. Computer Science"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Session Notes
            </label>
            <textarea
              rows={3}
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="What did you learn or accomplish during this focus block?"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeFinishModal}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save to Study History
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuickTimerWidget;
