import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { playCompletionChime } from '../utils/audio';

const TimerContext = createContext(null);

export const TIMER_PRESETS = [
  { label: '25 min', value: 25 * 60, name: 'Pomodoro' },
  { label: '50 min', value: 50 * 60, name: 'Deep Work' },
  { label: '90 min', value: 90 * 60, name: 'Extended' }
];

export const BREAK_PRESETS = [
  { label: '5 min', value: 5 * 60, name: 'Short Break' },
  { label: '15 min', value: 15 * 60, name: 'Long Break' }
];

export const TimerProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [initialDuration, setInitialDuration] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [subject, setSubject] = useState('Computer Science');
  const [notes, setNotes] = useState('');
  const [actualStartedAt, setActualStartedAt] = useState(null);

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const targetEndTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Sync default duration with user settings if available
  useEffect(() => {
    if (user?.settings?.defaultFocusDuration && !isRunning && !isPaused && remainingSeconds === initialDuration) {
      const defaultSecs = user.settings.defaultFocusDuration * 60;
      setInitialDuration(defaultSecs);
      setRemainingSeconds(defaultSecs);
    }
  }, [user?.settings?.defaultFocusDuration]);

  // Main countdown ticker based on timestamps to eliminate background tab throttling drift
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setIsPaused(false);

          // Play audio notification chime
          if (user?.settings?.soundEnabled !== false) {
            playCompletionChime();
          }

          if (mode === 'focus') {
            setIsFinishModalOpen(true);
            window.dispatchEvent(new Event('trigger-confetti'));
            addToast('Focus session complete! Great work!', 'success');
          } else {
            addToast('Break complete! Ready to refocus?', 'info');
            setMode('focus');
            const focusDuration = (user?.settings?.defaultFocusDuration || 25) * 60;
            setInitialDuration(focusDuration);
            setRemainingSeconds(focusDuration);
          }
        }
      }, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, user?.settings?.soundEnabled, user?.settings?.defaultFocusDuration, addToast]);

  const startTimer = useCallback(() => {
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    if (!actualStartedAt) {
      setActualStartedAt(new Date());
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [remainingSeconds, actualStartedAt]);

  const pauseTimer = useCallback(() => {
    if (targetEndTimeRef.current) {
      const now = Date.now();
      const currentRemaining = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));
      setRemainingSeconds(currentRemaining);
    }
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    setIsRunning(true);
    setIsPaused(false);
  }, [remainingSeconds]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(initialDuration);
    setActualStartedAt(null);
    targetEndTimeRef.current = null;
  }, [initialDuration]);

  const selectPreset = useCallback((seconds, presetMode = 'focus') => {
    setIsRunning(false);
    setIsPaused(false);
    setMode(presetMode);
    setInitialDuration(seconds);
    setRemainingSeconds(seconds);
    setActualStartedAt(null);
    targetEndTimeRef.current = null;
  }, []);

  const adjustTime = useCallback((secondsDelta) => {
    if (isRunning && targetEndTimeRef.current) {
      targetEndTimeRef.current += secondsDelta * 1000;
      const now = Date.now();
      const diff = Math.max(60, Math.round((targetEndTimeRef.current - now) / 1000));
      setRemainingSeconds(diff);
      setInitialDuration((prev) => Math.max(60, prev + secondsDelta));
    } else {
      setRemainingSeconds((prev) => {
        const next = Math.max(60, prev + secondsDelta);
        setInitialDuration(next);
        return next;
      });
    }
  }, [isRunning]);

  const openFinishModal = useCallback(() => {
    pauseTimer();
    setIsFinishModalOpen(true);
  }, [pauseTimer]);

  const closeFinishModal = useCallback(() => {
    setIsFinishModalOpen(false);
  }, []);

  const saveSession = useCallback(async (sessionDetails = {}) => {
    if (isSaving) return;

    const finalSubject = (sessionDetails.subject || subject || 'General Study').trim();
    const finalNotes = (sessionDetails.notes !== undefined ? sessionDetails.notes : notes).trim();
    const elapsedSeconds = Math.max(10, initialDuration - remainingSeconds);

    setIsSaving(true);
    try {
      const res = await api.post('/sessions', {
        subject: finalSubject,
        duration: elapsedSeconds,
        startedAt: actualStartedAt || new Date(Date.now() - elapsedSeconds * 1000),
        completedAt: new Date(),
        notes: finalNotes
      });

      if (res.data?.success) {
        addToast(`Session saved: ${finalSubject} (+${Math.round(elapsedSeconds / 60)}m)`, 'success');
        // Notify any active dashboards/history components to refetch
        window.dispatchEvent(new Event('study-session-updated'));

        // Reset timer state cleanly
        resetTimer();
        setIsFinishModalOpen(false);
        setNotes('');
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save study session';
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, subject, notes, initialDuration, remainingSeconds, actualStartedAt, addToast, resetTimer]);

  return (
    <TimerContext.Provider
      value={{
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
        actualStartedAt,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        selectPreset,
        adjustTime,
        openFinishModal,
        closeFinishModal,
        isFinishModalOpen,
        saveSession,
        isSaving,
        elapsedSeconds: Math.max(0, initialDuration - remainingSeconds)
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
