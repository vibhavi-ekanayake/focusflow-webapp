import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: 'avatar-1'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['host', 'member'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['focusing', 'break', 'idle'],
      default: 'idle'
    },
    currentSubject: {
      type: String,
      default: ''
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: 'avatar-1'
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const StudyRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [60, 'Room name cannot exceed 60 characters']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [60, 'Subject cannot exceed 60 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    passcode: {
      type: String,
      select: false // Never return passcode hash in queries
    },
    isPasswordProtected: {
      type: Boolean,
      default: false
    },
    maxParticipants: {
      type: Number,
      default: 20,
      min: [2, 'Minimum 2 participants'],
      max: [50, 'Maximum 50 participants']
    },
    members: [MemberSchema],
    timer: {
      isRunning: {
        type: Boolean,
        default: false
      },
      mode: {
        type: String,
        enum: ['focus', 'break'],
        default: 'focus'
      },
      duration: {
        type: Number,
        default: 1500 // 25 minutes default in seconds
      },
      startedAt: {
        type: Date
      },
      targetEndTime: {
        type: Date
      },
      pausedRemaining: {
        type: Number,
        default: 1500
      }
    },
    messages: [MessageSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash passcode if provided or modified
StudyRoomSchema.pre('save', async function (next) {
  if (!this.isModified('passcode') || !this.passcode) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passcode = await bcrypt.hash(this.passcode, salt);
  next();
});

// Compare entered passcode with hashed passcode
StudyRoomSchema.methods.matchPasscode = async function (enteredPasscode) {
  if (!this.passcode) return true;
  return await bcrypt.compare(enteredPasscode, this.passcode);
};

export default mongoose.model('StudyRoom', StudyRoomSchema);
