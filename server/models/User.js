import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Do not return password by default
    },
    googleId: {
      type: String,
      default: null,
      sparse: true
    },
    isGoogleUser: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: 'avatar-1'
    },
    dailyGoal: {
      type: Number,
      default: 120, // in minutes (2 hours)
      min: [1, 'Daily goal must be at least 1 minute']
    },
    weeklyGoal: {
      type: Number,
      default: 720, // in minutes (12 hours)
      min: [1, 'Weekly goal must be at least 1 minute']
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'light'
      },
      defaultFocusDuration: {
        type: Number,
        default: 25, // minutes
        min: 1,
        max: 180
      },
      defaultBreakDuration: {
        type: Number,
        default: 5, // minutes
        min: 1,
        max: 60
      },
      soundEnabled: {
        type: Boolean,
        default: true
      },
      autoStartBreaks: {
        type: Boolean,
        default: false
      },
      emailNotifications: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
