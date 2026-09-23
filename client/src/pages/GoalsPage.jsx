import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatMinutesHuman } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Target, Award, Calendar, CheckCircle2, Flame, Sparkles } from 'lucide-react';

const GoalsPage = () => {
  const [goalsData, setGoalsData] = useState(null);
  const [dailyGoalHours, setDailyGoalHours] = useState('2');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState('12');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { addToast } = useToast();

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      if (res.data?.success) {
        setGoalsData(res.data.goals);
        setDailyGoalHours(String(Number((res.data.goals.dailyGoal / 60).toFixed(1))));
        setWeeklyGoalHours(String(Number((res.data.goals.weeklyGoal / 60).toFixed(1))));
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    const dgHours = parseFloat(dailyGoalHours);
    const wgHours = parseFloat(weeklyGoalHours);

    if (isNaN(dgHours) || dgHours <= 0 || dgHours > 24) {
      addToast('Daily goal must be between 0.5 and 24 hours', 'error');
      return;
    }

    if (isNaN(wgHours) || wgHours <= 0 || wgHours > 168) {
      addToast('Weekly goal must be between 1 and 168 hours', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put('/goals', {
        dailyGoal: Math.round(dgHours * 60),
        weeklyGoal: Math.round(wgHours * 60)
      });

      if (res.data?.success) {
        addToast('Goals updated successfully!', 'success');
        // Refresh goal progress
        await fetchGoals();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update goals';
      addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading goals and targets...</p>
      </div>
    );
  }

  const {
    dailyGoal = 120,
    weeklyGoal = 720,
    todayMinutes = 0,
    weekMinutes = 0,
    dailyProgress = 0,
    weeklyProgress = 0,
    dailyRemainingMinutes = 0,
    weeklyRemainingMinutes = 0
  } = goalsData || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Study Goals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Define daily and weekly focus commitments to cultivate disciplined study habits.
        </p>
      </div>

      {/* Live Goal Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goal Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daily Study Goal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Goal: {formatMinutesHuman(dailyGoal)}
                  </p>
                </div>
              </div>

              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                {dailyProgress}%
              </span>
            </div>

            {/* Numbers: '2h 15m / 3h' */}
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-3">
              {formatMinutesHuman(todayMinutes)}{' '}
              <span className="text-base sm:text-lg font-medium text-slate-400 dark:text-slate-500">
                / {formatMinutesHuman(dailyGoal)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            {todayMinutes >= dailyGoal ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                Daily goal achieved today!
              </span>
            ) : (
              <span>
                {formatMinutesHuman(dailyRemainingMinutes)} remaining to hit your target
              </span>
            )}
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Weekly Study Goal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Goal: {formatMinutesHuman(weeklyGoal)}
                  </p>
                </div>
              </div>

              <span className="text-lg font-extrabold text-violet-600 dark:text-violet-400">
                {weeklyProgress}%
              </span>
            </div>

            {/* Numbers: '10h 30m / 15h' */}
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-3">
              {formatMinutesHuman(weekMinutes)}{' '}
              <span className="text-base sm:text-lg font-medium text-slate-400 dark:text-slate-500">
                / {formatMinutesHuman(weeklyGoal)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            {weekMinutes >= weeklyGoal ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                Weekly goal achieved! Outstanding!
              </span>
            ) : (
              <span>
                {formatMinutesHuman(weeklyRemainingMinutes)} remaining this week
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Goal Adjustment Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Adjust Study Targets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set sustainable goals that challenge you without causing burnout.
          </p>
        </div>

        <form onSubmit={handleSaveGoals} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Daily Goal Input */}
            <div className="space-y-3">
              <Input
                label="Daily Goal (Hours)"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(e.target.value)}
                helperText="Typical recommendation: 2.0 to 3.5 hours per day."
                required
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {['1.5', '2.0', '3.0', '4.0', '5.0'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDailyGoalHours(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      dailyGoalHours === val
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {val}h
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Goal Input */}
            <div className="space-y-3">
              <Input
                label="Weekly Goal (Hours)"
                type="number"
                step="1"
                min="1"
                max="168"
                value={weeklyGoalHours}
                onChange={(e) => setWeeklyGoalHours(e.target.value)}
                helperText="Typical recommendation: 10 to 20 hours per week."
                required
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {['10', '15', '20', '25', '30'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setWeeklyGoalHours(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      weeklyGoalHours === val
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {val}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={CheckCircle2}
              isLoading={isSaving}
            >
              Save Goals
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalsPage;
