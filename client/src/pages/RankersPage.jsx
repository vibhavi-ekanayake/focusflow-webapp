import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatMinutesHuman } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import UserAvatar from '../components/common/UserAvatar';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';

const AVATAR_COLORS = [
  'bg-gradient-to-tr from-indigo-500 to-violet-600',
  'bg-gradient-to-tr from-rose-500 to-pink-600',
  'bg-gradient-to-tr from-amber-500 to-orange-600',
  'bg-gradient-to-tr from-emerald-500 to-teal-600',
  'bg-gradient-to-tr from-blue-500 to-cyan-600',
  'bg-gradient-to-tr from-purple-500 to-fuchsia-600'
];

const getAvatarColor = (name = '') => {
  const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const RankersPage = () => {
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'week', 'today'
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRankings = useCallback(async (selectedTimeframe = timeframe) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/rankings?timeframe=${selectedTimeframe}`);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard rankings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchRankings(timeframe);
  }, [timeframe, fetchRankings]);

  const leaderboard = data?.leaderboard || [];
  const userStanding = data?.userStanding || {};

  // Top 3 Podium: 2nd (left), 1st (center), 3rd (right)
  const firstPlace = leaderboard.find((item) => item.rank === 1);
  const secondPlace = leaderboard.find((item) => item.rank === 2);
  const thirdPlace = leaderboard.find((item) => item.rank === 3);

  const topTime = firstPlace?.totalMinutes || 1;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold mb-2 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>Academic Focus Honor Roll</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Student Rankers Leaderboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track study dedication, benchmark your deep work hours, and climb the podium.
          </p>
        </div>

        {/* Action Controls: Refresh & Start Studying */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRankings(timeframe)}
            className="p-2.5 rounded-full ios-card border border-white/40 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm ios-press transition-all"
            title="Refresh rankings"
            aria-label="Refresh rankings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            onClick={() => navigate('/timer')}
            variant="primary"
            size="sm"
            icon={Zap}
            className="shadow-md shadow-indigo-500/20"
          >
            Study Now to Rank Up
          </Button>
        </div>
      </div>

      {/* Timeframe Selector Pill Bar */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-full ios-card shadow-ios border border-white/40 dark:border-white/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setTimeframe('all')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ios-press ${
              timeframe === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All-Time Focus
          </button>

          <button
            type="button"
            onClick={() => setTimeframe('week')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ios-press ${
              timeframe === 'week'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            This Week
          </button>

          <button
            type="button"
            onClick={() => setTimeframe('today')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ios-press ${
              timeframe === 'today'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-400 mt-3 font-medium">Computing student leaderboard standings...</p>
        </div>
      ) : (
        <>
          {/* User's Personal Standing Showcase Banner */}
          <div className="p-6 sm:p-8 rounded-[32px] ios-card shadow-ios border border-indigo-200/50 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                    <Trophy className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Your Current Ranking
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                        {userStanding.percentile || 'Top Tier'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        #{userStanding.rank || 11}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">
                        of {userStanding.totalCompetitors || 11} Rankers
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                  You have logged <strong className="text-indigo-600 dark:text-indigo-400">{formatMinutesHuman(userStanding.totalMinutes || 0)}</strong> of focused deep work {timeframe === 'today' ? 'today' : timeframe === 'week' ? 'this week' : 'overall'}.
                  {userStanding.nextRankAhead ? (
                    <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      ⚡ Need {formatMinutesHuman(userStanding.nextRankAhead.minutesNeeded)} more study time to overtake {userStanding.nextRankAhead.name} for Rank #{userStanding.nextRankAhead.rank}!
                    </span>
                  ) : (
                    <span className="block mt-1 text-amber-500 font-bold">
                      👑 Exceptional work! You are currently Rank #1 at the top of the leaderboard!
                    </span>
                  )}
                </p>
              </div>

              {/* KPI Badges */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 shadow-sm text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Focus Logged</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatMinutesHuman(userStanding.totalMinutes || 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 shadow-sm text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Study Streak</span>
                  <span className="text-sm font-extrabold text-amber-500 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    {userStanding.streak || 0}d
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 shadow-sm text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Sessions</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {userStanding.sessionsCount || 0} completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 Olympic Podium Showcase */}
          <div className="p-6 sm:p-10 rounded-[36px] ios-card shadow-ios border border-white/40 dark:border-white/10 backdrop-blur-2xl">
            <div className="text-center max-w-md mx-auto mb-8">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">
                Top Performers
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                The Study Podium
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
              {/* 2nd Place: Silver (Left) */}
              {secondPlace && (
                <div className="order-2 md:order-1 flex flex-col items-center text-center">
                  <div className="relative mb-3 group">
                    <UserAvatar avatar={secondPlace.avatar} name={secondPlace.name} size="lg" className="ring-4 ring-slate-300 shadow-lg" />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-800 border border-slate-300 shadow-sm z-10">
                      🥈 #2
                    </span>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                      {secondPlace.name}
                      {secondPlace.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-extrabold">You</span>
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-400">{secondPlace.subject}</span>
                  </div>

                  {/* Pedestal Bar */}
                  <div className="w-full h-32 rounded-t-[28px] bg-gradient-to-b from-slate-200 to-slate-300/60 dark:from-slate-800 dark:to-slate-900/60 border-t border-x border-slate-300 dark:border-slate-700/60 flex flex-col items-center justify-center p-3 shadow-sm">
                    <span className="text-base font-black text-slate-800 dark:text-slate-100">
                      {formatMinutesHuman(secondPlace.totalMinutes)}
                    </span>
                    <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {secondPlace.streak}d streak
                    </span>
                  </div>
                </div>
              )}

              {/* 1st Place: Gold (Center - Tallest) */}
              {firstPlace && (
                <div className="order-1 md:order-2 flex flex-col items-center text-center">
                  <div className="relative mb-3 group">
                    <Crown className="w-7 h-7 text-amber-400 absolute -top-7 left-1/2 -translate-x-1/2 filter drop-shadow-md animate-bounce z-10" />
                    <UserAvatar avatar={firstPlace.avatar} name={firstPlace.name} size="xl" className="ring-4 ring-amber-400 shadow-xl shadow-amber-500/20" />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-amber-950 border border-amber-300 shadow-md z-10">
                      🥇 #1
                    </span>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                      {firstPlace.name}
                      {firstPlace.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-extrabold">You</span>
                      )}
                    </h3>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{firstPlace.subject}</span>
                  </div>

                  {/* Gold Pedestal Bar */}
                  <div className="w-full h-44 rounded-t-[32px] bg-gradient-to-b from-amber-200/80 via-amber-100 to-amber-200/40 dark:from-amber-950/60 dark:via-amber-900/30 dark:to-slate-900/80 border-t border-x border-amber-300/80 dark:border-amber-700/60 flex flex-col items-center justify-center p-3 shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-400/5 dark:bg-amber-400/10 pointer-events-none" />
                    <span className="text-lg font-black text-amber-950 dark:text-amber-100 relative z-10">
                      {formatMinutesHuman(firstPlace.totalMinutes)}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-1 relative z-10">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      {firstPlace.streak}d streak
                    </span>
                    <span className="text-[10px] font-bold text-amber-700/80 dark:text-amber-300/80 uppercase tracking-widest mt-1 relative z-10">
                      Honor Leader
                    </span>
                  </div>
                </div>
              )}

              {/* 3rd Place: Bronze (Right) */}
              {thirdPlace && (
                <div className="order-3 flex flex-col items-center text-center">
                  <div className="relative mb-3 group">
                    <UserAvatar avatar={thirdPlace.avatar} name={thirdPlace.name} size="lg" className="ring-4 ring-amber-700 shadow-lg" />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-700 text-amber-100 border border-amber-800 shadow-sm z-10">
                      🥉 #3
                    </span>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                      {thirdPlace.name}
                      {thirdPlace.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-extrabold">You</span>
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-400">{thirdPlace.subject}</span>
                  </div>

                  {/* Bronze Pedestal Bar */}
                  <div className="w-full h-24 rounded-t-[28px] bg-gradient-to-b from-amber-100/60 to-amber-200/40 dark:from-amber-950/40 dark:to-slate-900/60 border-t border-x border-amber-300/40 dark:border-amber-900/50 flex flex-col items-center justify-center p-3 shadow-sm">
                    <span className="text-base font-black text-slate-800 dark:text-slate-100">
                      {formatMinutesHuman(thirdPlace.totalMinutes)}
                    </span>
                    <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {thirdPlace.streak}d streak
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Leaderboard Table (Ranks 1 through 11) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>All Academic Rankers</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {leaderboard.length} Students
                </span>
              </h3>
              <span className="text-xs text-slate-400">
                Sorted by total minutes studied
              </span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((student) => {
                const isUser = student.isCurrentUser;
                const percentOfTop = Math.min(100, Math.round((student.totalMinutes / (topTime || 1)) * 100));

                return (
                  <div
                    key={student.id}
                    className={`p-4 sm:p-5 rounded-[24px] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isUser
                        ? 'ios-card ring-2 ring-indigo-500/70 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-ios border border-indigo-300 dark:border-indigo-700/60 scale-[1.01]'
                        : 'ios-card shadow-sm border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {/* Left: Rank + Avatar + Name & Subject */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Rank Indicator */}
                      <div className="flex items-center justify-center w-8 h-8 shrink-0">
                        {student.rank === 1 ? (
                          <span className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-sm">
                            1
                          </span>
                        ) : student.rank === 2 ? (
                          <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shadow-sm">
                            2
                          </span>
                        ) : student.rank === 3 ? (
                          <span className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            #{student.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <UserAvatar avatar={student.avatar} name={student.name} size="md" />

                      {/* Name & Specialization */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {student.name}
                          </h4>
                          {isUser && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shrink-0 shadow-xs">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {student.subject}
                        </p>
                      </div>
                    </div>

                    {/* Right: Streak + Time + Relative Progress */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Streak */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 shrink-0">
                        <Flame className="w-4 h-4 fill-amber-500" />
                        <span>{student.streak}d streak</span>
                      </div>

                      {/* Total Time & Progress Bar */}
                      <div className="text-right min-w-[130px]">
                        <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
                          {formatMinutesHuman(student.totalMinutes)}
                        </div>
                        <div className="w-28 sm:w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1 ml-auto">
                          <div
                            className={`h-full rounded-full ${
                              student.rank === 1
                                ? 'bg-amber-400'
                                : isUser
                                ? 'bg-indigo-600'
                                : 'bg-slate-400 dark:bg-slate-600'
                            }`}
                            style={{ width: `${percentOfTop}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RankersPage;
