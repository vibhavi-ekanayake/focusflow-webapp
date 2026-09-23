import User from '../models/User.js';
import StudySession from '../models/StudySession.js';

// @desc    Get current daily and weekly goals and their live progress
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await StudySession.find({
      userId: user._id,
      startedAt: { $gte: sevenDaysAgo }
    });

    const todaySeconds = sessions
      .filter((s) => s.startedAt >= startOfToday && s.startedAt <= endOfToday)
      .reduce((sum, s) => sum + (s.duration || 0), 0);
    const todayMinutes = Math.round(todaySeconds / 60);

    const weekSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const weekMinutes = Math.round(weekSeconds / 60);

    const dailyGoal = user.dailyGoal || 120; // default 2 hours
    const weeklyGoal = user.weeklyGoal || 720; // default 12 hours

    const dailyProgress = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));
    const weeklyProgress = Math.min(100, Math.round((weekMinutes / weeklyGoal) * 100));

    res.status(200).json({
      success: true,
      goals: {
        dailyGoal,
        weeklyGoal,
        todayMinutes,
        weekMinutes,
        dailyProgress,
        weeklyProgress,
        dailyRemainingMinutes: Math.max(0, dailyGoal - todayMinutes),
        weeklyRemainingMinutes: Math.max(0, weeklyGoal - weekMinutes)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update daily and weekly goals
// @route   PUT /api/goals
// @access  Private
export const updateGoals = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { dailyGoal, weeklyGoal } = req.body;

    if (dailyGoal !== undefined) {
      const dg = Number(dailyGoal);
      if (isNaN(dg) || dg < 1 || dg > 1440) {
        return res.status(400).json({
          success: false,
          message: 'Daily goal must be between 1 and 1440 minutes (24 hours)'
        });
      }
      user.dailyGoal = Math.round(dg);
    }

    if (weeklyGoal !== undefined) {
      const wg = Number(weeklyGoal);
      if (isNaN(wg) || wg < 1 || wg > 10080) {
        return res.status(400).json({
          success: false,
          message: 'Weekly goal must be between 1 and 10080 minutes (168 hours)'
        });
      }
      user.weeklyGoal = Math.round(wg);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Goals updated successfully',
      dailyGoal: user.dailyGoal,
      weeklyGoal: user.weeklyGoal
    });
  } catch (error) {
    next(error);
  }
};
