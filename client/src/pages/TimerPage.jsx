import React, { useState } from 'react';
import { useTimer, BREAK_PRESETS } from '../context/TimerContext';
import TimerDisplay from '../components/timer/TimerDisplay';
import TimerControls from '../components/timer/TimerControls';
import TimerPresets from '../components/timer/TimerPresets';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { BookOpen, Coffee, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

const COMMON_SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'History',
  'Economics',
  'Psychology',
  'Language Study'
];

const TimerPage = () => {
  const {
    mode,
    setMode,
    initialDuration,
    remainingSeconds,
    isRunning,
    isPaused,
    subject,
    setSubject,
    notes,
    setNotes,
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

  const handleFinishClick = () => {
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Focus Session Timer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Distraction-free environment with tab-proof accuracy.
        </p>
      </div>

      {/* Mode Switcher: Focus Mode vs Break Timer */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-full ios-card shadow-ios border border-white/40 dark:border-white/10 backdrop-blur-xl">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => selectPreset(25 * 60, 'focus')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ios-press ${
              mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            } disabled:opacity-50`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => selectPreset(5 * 60, 'break')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ios-press ${
              mode === 'break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            } disabled:opacity-50`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Break Timer</span>
          </button>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="p-8 sm:p-12 rounded-[36px] ios-card shadow-ios border border-white/40 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Presets */}
        <div className="mb-4 z-10">
          {mode === 'focus' ? (
            <TimerPresets
              currentDuration={initialDuration}
              onSelectPreset={(sec) => selectPreset(sec, 'focus')}
              disabled={isRunning}
            />
          ) : (
            <div className="flex items-center gap-2">
              {BREAK_PRESETS.map((bp) => (
                <button
                  key={bp.value}
                  disabled={isRunning}
                  onClick={() => selectPreset(bp.value, 'break')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    initialDuration === bp.value
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {bp.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Circular SVG Timer Display */}
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

        {/* Subject & Notes Setup Area */}
        {mode === 'focus' && (
          <div className="w-full max-w-lg mt-4 space-y-4 z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Subject
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={subject}
                    disabled={isRunning}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60 transition-colors"
                    list="timer-subjects"
                  />
                  <datalist id="timer-subjects">
                    {COMMON_SUBJECTS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Session Notes
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Algebra revision"
                    className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 z-10">
          <TimerControls
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={startTimer}
            onPause={pauseTimer}
            onResume={resumeTimer}
            onReset={resetTimer}
            onFinish={handleFinishClick}
            canFinish={mode === 'focus'}
          />
        </div>
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
              {elapsedSeconds}s logged
            </span>
          </div>

          <Input
            label="Subject"
            value={modalSubject}
            onChange={(e) => setModalSubject(e.target.value)}
            placeholder="e.g. Mathematics"
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
              placeholder="e.g. Algebra revision, practice problems 1-15"
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
              icon={CheckCircle2}
              isLoading={isSaving}
            >
              Save Session Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimerPage;
