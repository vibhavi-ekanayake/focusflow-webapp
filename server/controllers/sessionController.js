import StudySession from '../models/StudySession.js';

// @desc    Create a new study session record
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res, next) => {
  try {
    const { subject, duration, startedAt, completedAt, notes } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum < 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid session duration of at least 5 seconds is required'
      });
    }

    const session = await StudySession.create({
      userId: req.user._id,
      subject: subject.trim(),
      duration: Math.round(durationNum),
      startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - durationNum * 1000),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Study session recorded successfully',
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's study sessions with filtering, search, and pagination
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res, next) => {
  try {
    const { search, subject, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    // Search query matches subject or notes
    if (search && search.trim()) {
      query.$or = [
        { subject: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Exact subject filter
    if (subject && subject.trim() && subject !== 'All') {
      query.subject = subject.trim();
    }

    // Date range filters
    if (startDate || endDate) {
      query.startedAt = {};
      if (startDate) {
        query.startedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.startedAt.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await StudySession.countDocuments(query);
    const sessions = await StudySession.find(query)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get list of distinct subjects the user has studied for easy filtering dropdown
    const distinctSubjects = await StudySession.distinct('subject', { userId: req.user._id });

    res.status(200).json({
      success: true,
      sessions,
      distinctSubjects,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study session by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a study session
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found or you are not authorized to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Study session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
