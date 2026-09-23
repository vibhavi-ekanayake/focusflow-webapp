import User from '../models/User.js';
import StudySession from '../models/StudySession.js';
import { calculateStreak } from '../utils/streakCalculator.js';

// @desc    Get user profile and summary statistics
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Retrieve all completed sessions to calculate accurate stats
    const sessions = await StudySession.find({ userId: user._id }).sort({ startedAt: -1 });

    const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalHours = Number((totalSeconds / 3600).toFixed(1));
    const streakInfo = calculateStreak(sessions);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        dailyGoal: user.dailyGoal,
        weeklyGoal: user.weeklyGoal,
        settings: user.settings,
        createdAt: user.createdAt,
        stats: {
          totalStudySeconds: totalSeconds,
          totalStudyHours: totalHours,
          totalSessions: sessions.length,
          currentStreak: streakInfo.currentStreak,
          longestStreak: streakInfo.longestStreak,
          totalStudyDays: streakInfo.totalStudyDays
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (name, avatar, or password)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, avatar, currentPassword, newPassword } = req.body;

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your current password to set a new password'
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match'
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        dailyGoal: user.dailyGoal,
        weeklyGoal: user.weeklyGoal,
        settings: user.settings,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user app settings
// @route   PUT /api/users/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      theme,
      defaultFocusDuration,
      defaultBreakDuration,
      soundEnabled,
      autoStartBreaks,
      emailNotifications
    } = req.body;

    user.settings = {
      ...user.settings,
      ...(theme && { theme }),
      ...(defaultFocusDuration !== undefined && { defaultFocusDuration: Number(defaultFocusDuration) }),
      ...(defaultBreakDuration !== undefined && { defaultBreakDuration: Number(defaultBreakDuration) }),
      ...(soundEnabled !== undefined && { soundEnabled: Boolean(soundEnabled) }),
      ...(autoStartBreaks !== undefined && { autoStartBreaks: Boolean(autoStartBreaks) }),
      ...(emailNotifications !== undefined && { emailNotifications: Boolean(emailNotifications) })
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};
