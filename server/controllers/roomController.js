import crypto from 'crypto';
import StudyRoom from '../models/StudyRoom.js';

// Helper: Generate a cryptographically secure 8-character human-friendly room code
const generateUniqueRoomCode = async () => {
  let code = '';
  let exists = true;
  while (exists) {
    const bytes = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 hex characters
    code = `STUDY-${bytes.substring(0, 4)}-${bytes.substring(4, 8)}`;
    const found = await StudyRoom.findOne({ code });
    if (!found) exists = false;
  }
  return code;
};

// @desc    Create a new collaborative study room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req, res, next) => {
  try {
    const { name, subject, description, passcode, maxParticipants } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    const code = await generateUniqueRoomCode();
    const hasPasscode = !!(passcode && passcode.trim());

    const room = new StudyRoom({
      name: name.trim(),
      subject: subject.trim(),
      description: description ? description.trim() : '',
      code,
      host: req.user._id,
      isPasswordProtected: hasPasscode,
      ...(hasPasscode && { passcode: passcode.trim() }),
      maxParticipants: maxParticipants ? Math.min(50, Math.max(2, parseInt(maxParticipants, 10))) : 20,
      members: [
        {
          user: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar || 'avatar-1',
          joinedAt: new Date(),
          role: 'host',
          status: 'idle',
          currentSubject: subject.trim(),
          lastActive: new Date()
        }
      ],
      messages: [
        {
          sender: req.user._id,
          name: 'System',
          avatar: 'system',
          text: `Welcome to ${name.trim()}! Study room initialized.`
        }
      ]
    });

    await room.save();

    // Return room without passcode hash
    const savedRoom = await StudyRoom.findById(room._id);

    res.status(201).json({
      success: true,
      message: 'Study room created successfully',
      room: savedRoom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a study room using room code and optional passcode
// @route   POST /api/rooms/join
// @access  Private
export const joinRoom = async (req, res, next) => {
  try {
    const { code, passcode } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Room code is required' });
    }

    const formattedCode = code.trim().toUpperCase();

    // Find room including passcode field
    const room = await StudyRoom.findOne({ code: formattedCode, isActive: true }).select('+passcode');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found. Please verify the room code.'
      });
    }

    // Check if already a member
    const isAlreadyMember = room.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      const sanitized = await StudyRoom.findById(room._id);
      return res.status(200).json({
        success: true,
        message: 'Already a member of this room',
        room: sanitized
      });
    }

    // Check passcode protection if room requires it
    if (room.isPasswordProtected) {
      if (!passcode || !passcode.trim()) {
        return res.status(401).json({
          success: false,
          requiresPasscode: true,
          message: 'This room is protected by a passcode'
        });
      }

      const isMatch = await room.matchPasscode(passcode.trim());
      if (!isMatch) {
        return res.status(403).json({
          success: false,
          requiresPasscode: true,
          message: 'Incorrect room passcode'
        });
      }
    }

    // Check capacity
    if (room.members.length >= room.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Room has reached its maximum participant capacity'
      });
    }

    // Add user to members
    room.members.push({
      user: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar || 'avatar-1',
      joinedAt: new Date(),
      role: 'member',
      status: 'idle',
      currentSubject: room.subject,
      lastActive: new Date()
    });

    // Add join notification to messages
    room.messages.push({
      sender: req.user._id,
      name: 'System',
      avatar: 'system',
      text: `${req.user.name} joined the study room.`
    });

    await room.save();

    const updated = await StudyRoom.findById(room._id);

    res.status(200).json({
      success: true,
      message: 'Joined study room successfully',
      room: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's joined and hosted rooms
// @route   GET /api/rooms/my-rooms
// @access  Private
export const getMyRooms = async (req, res, next) => {
  try {
    const rooms = await StudyRoom.find({
      'members.user': req.user._id,
      isActive: true
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full study room details (members only)
// @route   GET /api/rooms/:code
// @access  Private
export const getRoomByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const formattedCode = code.trim().toUpperCase();

    const room = await StudyRoom.findOne({ code: formattedCode, isActive: true });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    // Verify membership
    const memberIndex = room.members.findIndex(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(403).json({
        success: false,
        requiresJoin: true,
        isPasswordProtected: room.isPasswordProtected,
        name: room.name,
        subject: room.subject,
        message: 'You must join this room before accessing the study workspace'
      });
    }

    // Update lastActive timestamp for this member
    room.members[memberIndex].lastActive = new Date();
    await room.save();

    res.status(200).json({
      success: true,
      room,
      isHost: room.host.toString() === req.user._id.toString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update synchronized room focus timer (host only)
// @route   POST /api/rooms/:code/timer
// @access  Private
export const updateRoomTimer = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { action, duration, mode } = req.body; // 'start', 'pause', 'reset', 'set-mode'

    const room = await StudyRoom.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    // Strict host authorization
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the room host can control the synchronized timer'
      });
    }

    const timer = room.timer || {};

    if (action === 'start') {
      const durSeconds = duration ? Number(duration) : (timer.duration || 1500);
      timer.duration = durSeconds;
      timer.isRunning = true;
      timer.startedAt = new Date();
      timer.targetEndTime = new Date(Date.now() + (timer.pausedRemaining || durSeconds) * 1000);
    } else if (action === 'pause') {
      if (timer.targetEndTime) {
        const remaining = Math.max(0, Math.round((new Date(timer.targetEndTime) - Date.now()) / 1000));
        timer.pausedRemaining = remaining;
      }
      timer.isRunning = false;
    } else if (action === 'reset') {
      timer.isRunning = false;
      timer.pausedRemaining = timer.duration || 1500;
      timer.startedAt = null;
      timer.targetEndTime = null;
    } else if (action === 'set-mode') {
      timer.mode = mode === 'break' ? 'break' : 'focus';
      const defaultDuration = timer.mode === 'break' ? 300 : 1500;
      timer.duration = duration ? Number(duration) : defaultDuration;
      timer.pausedRemaining = timer.duration;
      timer.isRunning = false;
      timer.targetEndTime = null;
    }

    room.timer = timer;
    await room.save();

    res.status(200).json({
      success: true,
      message: `Timer ${action} updated`,
      timer: room.timer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current member's study status
// @route   PUT /api/rooms/:code/status
// @access  Private
export const updateMemberStatus = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { status, currentSubject } = req.body; // 'focusing' | 'break' | 'idle'

    const room = await StudyRoom.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    const member = room.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ success: false, message: 'Not a member of this room' });
    }

    if (status && ['focusing', 'break', 'idle'].includes(status)) {
      member.status = status;
    }

    if (currentSubject !== undefined) {
      member.currentSubject = currentSubject.trim();
    }

    member.lastActive = new Date();
    await room.save();

    res.status(200).json({
      success: true,
      members: room.members
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a message to the room wall
// @route   POST /api/rooms/:code/messages
// @access  Private
export const postRoomMessage = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const room = await StudyRoom.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    // Verify member
    const isMember = room.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You must join before messaging' });
    }

    const newMessage = {
      sender: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar || 'avatar-1',
      text: text.trim().substring(0, 500),
      createdAt: new Date()
    };

    room.messages.push(newMessage);

    // Keep last 100 messages
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }

    await room.save();

    res.status(201).json({
      success: true,
      message: newMessage,
      messages: room.messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave a study room
// @route   POST /api/rooms/:code/leave
// @access  Private
export const leaveRoom = async (req, res, next) => {
  try {
    const { code } = req.params;
    const room = await StudyRoom.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    const isHost = room.host.toString() === req.user._id.toString();

    // Remove user from members
    room.members = room.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );

    if (room.members.length === 0) {
      // No one left, close room
      room.isActive = false;
    } else if (isHost) {
      // Transfer host to next senior member
      room.host = room.members[0].user;
      room.members[0].role = 'host';
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: 'You have left the study room'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate room invite code (host only)
// @route   POST /api/rooms/:code/regenerate-code
// @access  Private
export const regenerateRoomCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const room = await StudyRoom.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the host can regenerate the room code' });
    }

    const newCode = await generateUniqueRoomCode();
    room.code = newCode;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room invite code regenerated successfully',
      code: newCode
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/close a study room (host only)
// @route   DELETE /api/rooms/:code
// @access  Private
export const deleteRoom = async (req, res, next) => {
  try {
    const { code } = req.params;
    const room = await StudyRoom.findOne({ code: code.trim().toUpperCase() });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Study room not found' });
    }

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the host can delete this room' });
    }

    await StudyRoom.deleteOne({ _id: room._id });

    res.status(200).json({
      success: true,
      message: 'Study room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
