import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Session must belong to a user'],
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
      index: true
    },
    duration: {
      type: Number,
      required: [true, 'Duration in seconds is required'],
      min: [10, 'Session duration must be at least 10 seconds']
    },
    startedAt: {
      type: Date,
      required: [true, 'Start timestamp is required'],
      index: true
    },
    completedAt: {
      type: Date,
      required: [true, 'Completion timestamp is required']
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user's sessions by date efficiently
StudySessionSchema.index({ userId: 1, startedAt: -1 });
StudySessionSchema.index({ userId: 1, subject: 1 });

export default mongoose.model('StudySession', StudySessionSchema);
