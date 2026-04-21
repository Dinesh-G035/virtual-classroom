const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    emoji: {
      type: String,
      enum: ['😊', '😐', '😞', '👍', '👎', '🎉', '❤️', ''],
      default: '',
    },
    timestamp: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
feedbackSchema.index({ video: 1, createdAt: -1 });
feedbackSchema.index({ student: 1, createdAt: -1 });

// Prevent duplicate feedback from same student on same video
feedbackSchema.index({ student: 1, video: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
