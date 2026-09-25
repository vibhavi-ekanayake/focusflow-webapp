import StudySession from '../models/StudySession.js';
import User from '../models/User.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// 10 realistic bot student competitors with calibrated focus metrics
const BOT_STUDENTS = [
  {
    id: 'bot-1',
    name: 'Elena Rostova',
    avatar: 'avatar-2',
    subject: 'Bioengineering',
    streak: 18,
    isBot: true,
    minutes: {
      all: 1960,  // ~32.6 hrs
      week: 420,  // 7.0 hrs
      today: 110  // 1.8 hrs
    }
  },
  {
    id: 'bot-2',
    name: 'Marcus Chen',
    avatar: 'avatar-3',
    subject: 'Computer Science',
    streak: 15,
    isBot: true,
    minutes: {
      all: 1695,  // ~28.2 hrs
      week: 380,  // 6.3 hrs
      today: 95   // 1.5 hrs
    }
  },
  {
    id: 'bot-3',
    name: 'Priya Sharma',
    avatar: 'avatar-4',
    subject: 'Neuroscience',
    streak: 12,
    isBot: true,
    minutes: {
      all: 1530,  // ~25.5 hrs
      week: 340,  // 5.6 hrs
      today: 85   // 1.4 hrs
    }
  },
  {
    id: 'bot-4',
    name: 'Liam O\'Connor',
    avatar: 'avatar-5',
    subject: 'Applied Mathematics',
    streak: 10,
    isBot: true,
    minutes: {
      all: 1330,  // ~22.1 hrs
      week: 290,  // 4.8 hrs
      today: 75   // 1.2 hrs
    }
  },
  {
    id: 'bot-5',
    name: 'Sophia Patel',
    avatar: 'avatar-6',
    subject: 'Economics & Finance',
    streak: 9,
    isBot: true,
    minutes: {
      all: 1185,  // ~19.7 hrs
      week: 260,  // 4.3 hrs
      today: 60   // 1.0 hr
    }
  },
  {
    id: 'bot-6',
    name: 'Jun-Ho Park',
    avatar: 'avatar-1',
    subject: 'Software Engineering',
    streak: 8,
    isBot: true,
    minutes: {
      all: 1040,  // ~17.3 hrs
      week: 230,  // 3.8 hrs
      today: 50   // 50 mins
    }
  },
  {
    id: 'bot-7',
    name: 'Maya Al-Mansoor',
    avatar: 'avatar-2',
    subject: 'Architecture & Design',
    streak: 7,
    isBot: true,
    minutes: {
      all: 900,   // 15.0 hrs
      week: 190,  // 3.1 hrs
      today: 45   // 45 mins
    }
  },
  {
    id: 'bot-8',
    name: 'Lucas Silva',
    avatar: 'avatar-3',
    subject: 'Data Science',
    streak: 6,
    isBot: true,
    minutes: {
      all: 760,   // ~12.6 hrs
      week: 160,  // 2.6 hrs
      today: 35   // 35 mins
    }
  },
  {
    id: 'bot-9',
    name: 'Chloe Dubois',
    avatar: 'avatar-4',
    subject: 'Literature & Philosophy',
    streak: 4,
    isBot: true,
    minutes: {
      all: 615,   // ~10.2 hrs
      week: 130,  // 2.1 hrs
      today: 25   // 25 mins
    }
  },
  {
    id: 'bot-10',
    name: 'Noah Kim',
    avatar: 'avatar-5',
    subject: 'Electrical Engineering',
    streak: 3,
    isBot: true,
    minutes: {
      all: 510,   // 8.5 hrs
      week: 100,  // 1.6 hrs
      today: 15   // 15 mins
    }
  }
];

// @desc    Get leaderboard rankings combining bots and real user's study records
// @route   GET /api/rankings
// @access  Private
export const getLeaderboard = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe === 'today' ? 'today' : req.query.timeframe === 'week' ? 'week' : 'all';
    const userId = req.user._id;

    // Fetch user details and all completed study sessions
    const [user, allSessions] = await Promise.all([
      User.findById(userId).select('name email avatar'),
      StudySession.find({ userId }).sort({ startedAt: -1 })
    ]);

    // Calculate user's overall streak
    const streakInfo = calculateStreak(allSessions);
    const userStreak = streakInfo.currentStreak || 0;

    // Filter sessions based on requested timeframe
    const now = new Date();
    let timeframeSessions = allSessions;

    if (timeframe === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      timeframeSessions = allSessions.filter(
        (s) => s.startedAt >= startOfToday && s.startedAt <= endOfToday
      );
    } else if (timeframe === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      timeframeSessions = allSessions.filter((s) => s.startedAt >= sevenDaysAgo);
    }

    // Calculate user's total minutes studied in this timeframe
    const userTotalSeconds = timeframeSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const userTotalMinutes = Math.round(userTotalSeconds / 60);

    // Identify user's most studied subject in this timeframe
    const subjectCounts = {};
    timeframeSessions.forEach((s) => {
      const subj = s.subject || 'General Studies';
      subjectCounts[subj] = (subjectCounts[subj] || 0) + (s.duration || 0);
    });
    let topSubject = 'General Studies';
    let maxSeconds = 0;
    Object.entries(subjectCounts).forEach(([subj, sec]) => {
      if (sec > maxSeconds) {
        maxSeconds = sec;
        topSubject = subj;
      }
    });

    // Format real user entry
    const userEntry = {
      id: user._id.toString(),
      name: user.name || 'You',
      avatar: user.avatar || 'avatar-1',
      subject: topSubject,
      streak: userStreak,
      totalMinutes: userTotalMinutes,
      isCurrentUser: true,
      isBot: false,
      sessionsCount: timeframeSessions.length
    };

    // Format bot competitors for the selected timeframe
    const botEntries = BOT_STUDENTS.map((bot) => ({
      id: bot.id,
      name: bot.name,
      avatar: bot.avatar,
      subject: bot.subject,
      streak: bot.streak,
      totalMinutes: bot.minutes[timeframe] || 0,
      isCurrentUser: false,
      isBot: true,
      sessionsCount: Math.max(1, Math.round((bot.minutes[timeframe] || 30) / 35))
    }));

    // Combine bots and user, then sort descending by total study minutes
    const combined = [...botEntries, userEntry].sort((a, b) => {
      if (b.totalMinutes !== a.totalMinutes) {
        return b.totalMinutes - a.totalMinutes;
      }
      return b.streak - a.streak;
    });

    // Assign 1-indexed ranks
    const leaderboard = combined.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));

    // Find user's exact standing
    const userRankIndex = leaderboard.findIndex((entry) => entry.isCurrentUser);
    const userRank = userRankIndex + 1;
    const totalCompetitors = leaderboard.length;

    // Calculate distance to overtake competitor immediately ahead (if not #1)
    let nextRankAhead = null;
    let minutesToOvertake = 0;
    if (userRankIndex > 0) {
      const aheadCompetitor = leaderboard[userRankIndex - 1];
      minutesToOvertake = Math.max(1, aheadCompetitor.totalMinutes - userTotalMinutes + 1);
      nextRankAhead = {
        name: aheadCompetitor.name,
        rank: aheadCompetitor.rank,
        minutesNeeded: minutesToOvertake
      };
    }

    // Calculate percentile
    const percentileVal = Math.max(1, Math.round(((totalCompetitors - userRank + 1) / totalCompetitors) * 100));
    const percentile = `Top ${101 - percentileVal}%`;

    res.json({
      success: true,
      timeframe,
      userStanding: {
        rank: userRank,
        totalCompetitors,
        totalMinutes: userTotalMinutes,
        streak: userStreak,
        sessionsCount: timeframeSessions.length,
        percentile,
        nextRankAhead
      },
      leaderboard
    });
  } catch (err) {
    next(err);
  }
};
