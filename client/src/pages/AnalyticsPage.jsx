import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChartCard from '../components/analytics/ChartCard';
import StatCard from '../components/dashboard/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatMinutesHuman } from '../utils/formatters';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Clock,
  Flame,
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SUBJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#84cc16'  // Lime
];

const CustomTooltip = ({ active, payload, label, unit = 'min' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/90 dark:bg-slate-800/90 text-white text-xs border border-slate-700 shadow-xl backdrop-blur-md">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        <p className="font-bold text-indigo-400">
          {payload[0].value} {unit}
          {unit === 'min' && payload[0].value >= 60 && (
            <span className="text-slate-400 ml-1">
              ({formatMinutesHuman(payload[0].value)})
            </span>
          )}
        </p>
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyComparison, setWeeklyComparison] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isDark } = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [ovRes, wkRes, moRes, sbRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/weekly'),
          api.get('/analytics/monthly'),
          api.get('/analytics/subjects')
        ]);

        if (ovRes.data?.success) setOverview(ovRes.data.stats);
        if (wkRes.data?.success) {
          setWeeklyData(wkRes.data.data || []);
          setWeeklyComparison(wkRes.data.comparison);
        }
        if (moRes.data?.success) setMonthlyData(moRes.data.data || []);
        if (sbRes.data?.success) setSubjectsData(sbRes.data.subjects || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Crunching your study metrics...</p>
      </div>
    );
  }

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Format data for Weekly comparison bar chart
  const weeklyCompareChartData = [
    {
      name: 'Previous 7 Days',
      minutes: weeklyComparison?.previousWeekMinutes || 0,
      hours: Number(((weeklyComparison?.previousWeekMinutes || 0) / 60).toFixed(1))
    },
    {
      name: 'Last 7 Days',
      minutes: weeklyComparison?.currentWeekMinutes || 0,
      hours: Number(((weeklyComparison?.currentWeekMinutes || 0) / 60).toFixed(1))
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Study Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visual insights into your focus habits, subjects, and study consistency.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Study Hours */}
        <StatCard
          title="Total Study Hours"
          value={`${overview?.totalStudyHours || 0}h`}
          subtitle={`${overview?.totalSessions || 0} total sessions logged`}
          icon={Clock}
          badgeType="indigo"
        />

        {/* Average Daily Study Time */}
        <StatCard
          title="Daily Average"
          value={formatMinutesHuman(overview?.averageDailyMinutes || 0)}
          subtitle={`Across ${overview?.totalStudyDays || 0} active study days`}
          icon={Calendar}
          badgeType="indigo"
        />

        {/* Longest Session */}
        <StatCard
          title="Longest Session"
          value={formatMinutesHuman(overview?.longestSession?.durationMinutes || 0)}
          subtitle={overview?.longestSession?.subject || 'None'}
          icon={Award}
          badgeType="emerald"
        />

        {/* Most Studied Subject */}
        <StatCard
          title="Top Subject"
          value={overview?.mostStudiedSubject?.subject || 'None'}
          subtitle={
            overview?.mostStudiedSubject?.totalHours
              ? `${overview.mostStudiedSubject.totalHours}h invested`
              : 'No sessions yet'
          }
          icon={BookOpen}
          badgeType="indigo"
        />

        {/* Current Streak */}
        <StatCard
          title="Active Streak"
          value={`${overview?.currentStreak || 0} days`}
          subtitle={`Best: ${overview?.longestStreak || 0} days`}
          icon={Flame}
          badge={overview?.currentStreak > 0 ? '🔥 On Fire' : 'Inactive'}
          badgeType={overview?.currentStreak > 0 ? 'amber' : 'indigo'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Study time over the last 7 days */}
        <ChartCard
          title="Study Time (Last 7 Days)"
          subtitle="Daily focus minutes completed each day"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="day" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Study time over the last 30 days */}
        <ChartCard
          title="30-Day Focus Trend"
          subtitle="Daily trend over the past month"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" stroke={textColor} fontSize={10} tickLine={false} interval={4} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMinutes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Study time by subject */}
        <ChartCard
          title="Study Time by Subject"
          subtitle="Proportional breakdown across disciplines"
        >
          {subjectsData.length === 0 ? (
            <div className="text-center text-xs text-slate-400">
              No subject data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={subjectsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="minutes"
                  nameKey="subject"
                >
                  {subjectsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} min (${formatMinutesHuman(value)})`,
                    name
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 4. Weekly study comparison */}
        <ChartCard
          title="Weekly Comparison"
          subtitle="Compare this week's progress to the previous week"
          action={
            weeklyComparison && (
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  weeklyComparison.direction === 'increase'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}
              >
                {weeklyComparison.direction === 'increase' ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {weeklyComparison.percentChange > 0
                    ? `${weeklyComparison.percentChange}% ${weeklyComparison.direction}`
                    : 'Even'}
                </span>
              </div>
            )
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={weeklyCompareChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
