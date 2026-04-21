const mongoose = require('mongoose');

const aiResponseSchema = new mongoose.Schema(
  {
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
      unique: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      required: true,
    },
    sentimentScore: {
      type: Number,
      required: true,
    },
    reply: {
      type: String,
      required: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

// feedback field is already indexed because of unique: true constraint

module.exports = mongoose.model('AIResponse', aiResponseSchema);
