import StudySession from '../models/StudySession.js';
import User from '../models/User.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// Helper to format Date to YYYY-MM-DD
const toISODate = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get comprehensive overview statistics
// @route   GET /api/analytics/overview
// @access  Private
export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Fetch all user sessions
    const sessions = await StudySession.find({ userId }).sort({ startedAt: -1 });

    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const totalHours = Number((totalSeconds / 3600).toFixed(1));

    // Calculate streaks
    const streakInfo = calculateStreak(sessions);

    // Today's boundaries
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todaySeconds = sessions
      .filter((s) => s.startedAt >= startOfToday && s.startedAt <= endOfToday)
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const todayMinutes = Math.round(todaySeconds / 60);

    // This week's boundaries (Sunday or Monday start - let's use 7 days ago to now)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weekSeconds = sessions
      .filter((s) => s.startedAt >= sevenDaysAgo)
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const thisWeekMinutes = Math.round(weekSeconds / 60);

    // Longest single session
    let longestSession = { durationMinutes: 0, subject: 'None' };
    if (sessions.length > 0) {
      const maxSession = sessions.reduce(
        (max, s) => ((s.duration || 0) > (max.duration || 0) ? s : max),
        sessions[0]
      );
      longestSession = {
        id: maxSession._id,
        durationMinutes: Math.round((maxSession.duration || 0) / 60),
        durationSeconds: maxSession.duration,
        subject: maxSession.subject,
        date: maxSession.startedAt
      };
    }

    // Most studied subject
    const subjectMap = {};
    sessions.forEach((s) => {
      subjectMap[s.subject] = (subjectMap[s.subject] || 0) + (s.duration || 0);
    });

    let mostStudiedSubject = 'None';
    let highestSubjectSeconds = 0;
    Object.entries(subjectMap).forEach(([subj, secs]) => {
      if (secs > highestSubjectSeconds) {
        highestSubjectSeconds = secs;
        mostStudiedSubject = subj;
      }
    });

    // Average daily study time (over total active days or 7 days)
    const avgDailyMinutes =
      streakInfo.totalStudyDays > 0
        ? Math.round(totalMinutes / streakInfo.totalStudyDays)
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalStudySeconds: totalSeconds,
        totalStudyMinutes: totalMinutes,
        totalStudyHours: totalHours,
        totalSessions: sessions.length,
        todayMinutes,
        thisWeekMinutes,
        dailyGoalMinutes: user.dailyGoal || 120,
        weeklyGoalMinutes: user.weeklyGoal || 720,
        dailyGoalProgress: Math.min(
          100,
          Math.round((todayMinutes / (user.dailyGoal || 120)) * 100)
        ),
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        totalStudyDays: streakInfo.totalStudyDays,
        averageDailyMinutes: avgDailyMinutes,
        longestSession,
        mostStudiedSubject: {
          subject: mostStudiedSubject,
          totalMinutes: Math.round(highestSubjectSeconds / 60),
          totalHours: Number((highestSubjectSeconds / 3600).toFixed(1))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 7-day study time & weekly comparison
// @route   GET /api/analytics/weekly
// @access  Private
export const getWeeklyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Last 14 days to compare this week with last week
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await StudySession.find({
      userId,
      startedAt: { $gte: fourteenDaysAgo }
    }).sort({ startedAt: 1 });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Build array for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoStr = toISODate(d);
      const dayName = dayNames[d.getDay()];

      const daySessions = sessions.filter((s) => toISODate(s.startedAt) === isoStr);
      const daySeconds = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      const dayMinutes = Math.round(daySeconds / 60);
      const dayHours = Number((daySeconds / 3600).toFixed(1));

      last7Days.push({
        date: isoStr,
        day: dayName,
        minutes: dayMinutes,
        hours: dayHours,
        sessionsCount: daySessions.length
      });
    }

    // Previous 7 days (days -13 to -7)
    let previousWeekMinutes = 0;
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoStr = toISODate(d);
      const daySessions = sessions.filter((s) => toISODate(s.startedAt) === isoStr);
      const daySeconds = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      previousWeekMinutes += Math.round(daySeconds / 60);
    }

    const currentWeekMinutes = last7Days.reduce((acc, d) => acc + d.minutes, 0);
    const diffMinutes = currentWeekMinutes - previousWeekMinutes;
    const percentChange =
      previousWeekMinutes > 0
        ? Math.round((diffMinutes / previousWeekMinutes) * 100)
        : currentWeekMinutes > 0
        ? 100
        : 0;

    res.status(200).json({
      success: true,
      data: last7Days,
      comparison: {
        currentWeekMinutes,
        previousWeekMinutes,
        percentChange,
        direction: diffMinutes >= 0 ? 'increase' : 'decrease'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 30-day study trend
// @route   GET /api/analytics/monthly
// @access  Private
export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await StudySession.find({
      userId,
      startedAt: { $gte: thirtyDaysAgo }
    }).sort({ startedAt: 1 });

    const monthData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoStr = toISODate(d);

      const daySessions = sessions.filter((s) => toISODate(s.startedAt) === isoStr);
      const daySeconds = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      const dayMinutes = Math.round(daySeconds / 60);
      const dayHours = Number((daySeconds / 3600).toFixed(1));

      monthData.push({
        date: isoStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        minutes: dayMinutes,
        hours: dayHours,
        sessionsCount: daySessions.length
      });
    }

    const totalMonthMinutes = monthData.reduce((acc, d) => acc + d.minutes, 0);
    const activeDaysInMonth = monthData.filter((d) => d.minutes > 0).length;

    res.status(200).json({
      success: true,
      data: monthData,
      totalMonthMinutes,
      totalMonthHours: Number((totalMonthMinutes / 60).toFixed(1)),
      activeDaysInMonth
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study breakdown by subject
// @route   GET /api/analytics/subjects
// @access  Private
export const getSubjectAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sessions = await StudySession.find({ userId });

    const totalSecondsAll = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    const subjectMap = {};
    sessions.forEach((s) => {
      const subj = s.subject || 'Uncategorized';
      if (!subjectMap[subj]) {
        subjectMap[subj] = {
          subject: subj,
          totalSeconds: 0,
          totalMinutes: 0,
          totalHours: 0,
          sessionsCount: 0
        };
      }
      subjectMap[subj].totalSeconds += s.duration || 0;
      subjectMap[subj].sessionsCount += 1;
    });

    const subjects = Object.values(subjectMap).map((item) => {
      const mins = Math.round(item.totalSeconds / 60);
      const hrs = Number((item.totalSeconds / 3600).toFixed(1));
      const percentage =
        totalSecondsAll > 0
          ? Math.round((item.totalSeconds / totalSecondsAll) * 100)
          : 0;

      return {
        subject: item.subject,
        minutes: mins,
        hours: hrs,
        sessionsCount: item.sessionsCount,
        percentage
      };
    });

    // Sort descending by minutes studied
    subjects.sort((a, b) => b.minutes - a.minutes);

    res.status(200).json({
      success: true,
      subjects,
      totalSubjects: subjects.length
    });
  } catch (error) {
    next(error);
  }
};
