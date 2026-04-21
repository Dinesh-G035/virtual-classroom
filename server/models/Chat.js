const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
    },
  },
  { timestamps: true }
);

// Index for getting chat per video ordered by time
chatSchema.index({ video: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
