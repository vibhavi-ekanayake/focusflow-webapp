import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGreeting, getRandomMotivationalQuote, formatMinutesHuman } from '../utils/formatters';
import api from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import QuickTimerWidget from '../components/dashboard/QuickTimerWidget';
import GoalProgressCard from '../components/dashboard/GoalProgressCard';
import RecentSessions from '../components/dashboard/RecentSessions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Clock, Flame, Calendar, BookOpen, Target, Sparkles, RefreshCw } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quote] = useState(() => getRandomMotivationalQuote());

  const fetchDashboardData = useCallback(async () => {
    try {
      const [overviewRes, sessionsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/sessions?limit=5')
      ]);

      if (overviewRes.data?.success) {
        setStats(overviewRes.data.stats);
      }
      if (sessionsRes.data?.success) {
        setRecentSessions(sessionsRes.data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Listen for custom event when timer completes and saves session
    const handleSessionUpdate = () => {
      fetchDashboardData();
    };

    window.addEventListener('study-session-updated', handleSessionUpdate);
    return () => {
      window.removeEventListener('study-session-updated', handleSessionUpdate);
    };
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading your study metrics...</p>
      </div>
    );
  }

  const todayMinutes = stats?.todayMinutes || 0;
  const thisWeekMinutes = stats?.thisWeekMinutes || 0;
  const totalSessions = stats?.totalSessions || 0;
  const currentStreak = stats?.currentStreak || 0;
  const dailyGoalMinutes = stats?.dailyGoalMinutes || (user?.dailyGoal || 120);
  const dailyGoalProgress = stats?.dailyGoalProgress || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {getGreeting(user?.name?.split(' ')[0] || 'Student')}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="italic">"{quote}"</span>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto p-2.5 rounded-full ios-card border border-white/40 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm ios-press transition-all"
          title="Refresh metrics"
          aria-label="Refresh dashboard"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Study Time */}
        <StatCard
          title="Today's Focus"
          value={formatMinutesHuman(todayMinutes)}
          subtitle={`Goal: ${formatMinutesHuman(dailyGoalMinutes)}`}
          icon={Clock}
          badge={todayMinutes >= dailyGoalMinutes ? 'Goal Met' : undefined}
          badgeType="emerald"
        />

        {/* This Week's Study Time */}
        <StatCard
          title="This Week"
          value={formatMinutesHuman(thisWeekMinutes)}
          subtitle="Past 7 days accumulated"
          icon={Calendar}
          badgeType="indigo"
        />

        {/* Study Sessions Count */}
        <StatCard
          title="Study Sessions"
          value={totalSessions}
          subtitle="Completed sessions"
          icon={BookOpen}
          badgeType="indigo"
        />

        {/* Current Streak */}
        <StatCard
          title="Current Streak"
          value={`${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`}
          subtitle={stats?.longestStreak ? `Best: ${stats.longestStreak} days` : 'Keep it going!'}
          icon={Flame}
          badge={currentStreak > 0 ? '🔥 Active' : 'Start streak'}
          badgeType={currentStreak > 0 ? 'amber' : 'indigo'}
        />

        {/* Daily Goal Progress */}
        <StatCard
          title="Goal Progress"
          value={`${dailyGoalProgress}%`}
          subtitle={`${formatMinutesHuman(todayMinutes)} / ${formatMinutesHuman(dailyGoalMinutes)}`}
          icon={Target}
          badge={dailyGoalProgress >= 100 ? '100%' : `${dailyGoalProgress}%`}
          badgeType={dailyGoalProgress >= 100 ? 'emerald' : 'indigo'}
        />
      </div>

      {/* Main Focus Area: Timer Widget & Goal / History side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Prominent Focus Timer Widget */}
        <div className="lg:col-span-7">
          <QuickTimerWidget />
        </div>

        {/* Side Stack: Daily Goal Progress & Recent Sessions */}
        <div className="lg:col-span-5 space-y-6">
          <GoalProgressCard
            todayMinutes={todayMinutes}
            dailyGoalMinutes={dailyGoalMinutes}
          />

          <RecentSessions sessions={recentSessions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
