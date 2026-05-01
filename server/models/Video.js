const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a video title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    filePath: {
      type: String,
      required: [true, 'Video file path is required'],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'video/mp4',
    },
    thumbnailPath: {
      type: String,
      default: '',
    },
    subtitles: {
      type: String,
      default: '',
    },
    captions: [
      {
        startTime: Number, // Start time in seconds
        endTime: Number, // End time in seconds
        text: String, // Caption text
        speaker: String, // Optional: speaker name
      },
    ],
    signLanguageUrl: {
      type: String,
      default: '',
    },
    signLanguageInterpreter: {
      type: String,
      default: '', // URL to sign language interpreter video
    },
    captionsGenerated: {
      type: Boolean,
      default: false,
    },
    captionProvider: {
      type: String,
      enum: ['openai', 'google', 'mock', 'manual', 'none'],
      default: 'none',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: get feedback count
videoSchema.virtual('feedbackCount', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'video',
  count: true,
});

// Index for efficient queries
videoSchema.index({ teacher: 1, createdAt: -1 });
videoSchema.index({ tags: 1 });

module.exports = mongoose.model('Video', videoSchema);
