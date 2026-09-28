import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
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

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user by email including password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
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

// @desc    Log out current user
// @route   POST /api/auth/logout
// @access  Public / Private
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      dailyGoal: req.user.dailyGoal,
      weeklyGoal: req.user.weeklyGoal,
      settings: req.user.settings,
      createdAt: req.user.createdAt
    }
  });
};

// @desc    Google Sign In / Register
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    const { credential, googleId, email, name, avatar } = req.body;
    let resolvedEmail = email;
    let resolvedName = name;
    let resolvedAvatar = avatar;
    let resolvedGoogleId = googleId;

    // If Google ID token credential was provided, verify with Google tokeninfo endpoint
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          if (payload.email) {
            resolvedEmail = payload.email;
            resolvedName = payload.name || resolvedName;
            resolvedAvatar = payload.picture || resolvedAvatar;
            resolvedGoogleId = payload.sub || resolvedGoogleId;
          }
        }
      } catch (fetchErr) {
        console.warn('[Google Auth] Tokeninfo verification skipped:', fetchErr.message);
      }
    }

    if (!resolvedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication failed: Email address is required'
      });
    }

    const cleanEmail = resolvedEmail.toLowerCase().trim();

    // Check if user already exists by email or googleId
    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(resolvedGoogleId ? [{ googleId: resolvedGoogleId }] : [])
      ]
    });

    if (user) {
      // User exists - update googleId and avatar if not set
      let updated = false;
      if (!user.googleId && resolvedGoogleId) {
        user.googleId = resolvedGoogleId;
        user.isGoogleUser = true;
        updated = true;
      }
      if ((!user.avatar || user.avatar.startsWith('avatar-')) && resolvedAvatar) {
        user.avatar = resolvedAvatar;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // User does not exist - create new account
      const randomPassword = crypto.randomBytes(24).toString('hex');
      user = await User.create({
        name: resolvedName ? resolvedName.trim() : cleanEmail.split('@')[0],
        email: cleanEmail,
        password: randomPassword,
        avatar: resolvedAvatar || 'avatar-1',
        googleId: resolvedGoogleId || `google_${Date.now()}`,
        isGoogleUser: true,
        dailyGoal: 120,
        weeklyGoal: 720,
        settings: {
          theme: 'light',
          defaultFocusDuration: 25,
          defaultBreakDuration: 5,
          soundEnabled: true,
          autoStartBreaks: false,
          emailNotifications: true
        }
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        dailyGoal: user.dailyGoal,
        weeklyGoal: user.weeklyGoal,
        settings: user.settings,
        isGoogleUser: true,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
