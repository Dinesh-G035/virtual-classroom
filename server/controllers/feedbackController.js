const Feedback = require('../models/Feedback');
const AIResponse = require('../models/AIResponse');
const { analyzeSentiment } = require('../services/sentimentService');
const { generateSmartReply } = require('../services/smartReplyService');

// @desc    Submit feedback (auto-triggers AI analysis)
// @route   POST /api/feedback
// @access  Private (Student only)
const submitFeedback = async (req, res) => {
  try {
    const { videoId, comment, rating, emoji, timestamp } = req.body;

    // Check if student already gave feedback on this video
    const existing = await Feedback.findOne({ student: req.user._id, video: videoId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this video',
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      student: req.user._id,
      video: videoId,
      comment,
      rating,
      emoji: emoji || '',
      timestamp: timestamp || 0,
    });

    // --- AI Analysis (runs automatically) ---
    const sentimentResult = analyzeSentiment(comment);
    const smartReply = generateSmartReply(comment, sentimentResult.sentiment);

    const aiResponse = await AIResponse.create({
      feedback: feedback._id,
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.comparative,
      reply: smartReply,
      keywords: sentimentResult.keywords,
    });

    // Populate student info
    await feedback.populate('student', 'name email avatar');

    res.status(201).json({
      success: true,
      data: {
        feedback,
        aiResponse: {
          sentiment: aiResponse.sentiment,
          sentimentScore: aiResponse.sentimentScore,
          reply: aiResponse.reply,
          keywords: aiResponse.keywords,
        },
      },
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this video',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all feedback for a video
// @route   GET /api/feedback/video/:videoId
// @access  Private
const getVideoFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ video: req.params.videoId })
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 });

    // Get AI responses for each feedback
    const feedbackIds = feedbacks.map((f) => f._id);
    const aiResponses = await AIResponse.find({ feedback: { $in: feedbackIds } });

    const aiMap = {};
    aiResponses.forEach((ar) => {
      aiMap[ar.feedback.toString()] = {
        sentiment: ar.sentiment,
        sentimentScore: ar.sentimentScore,
        reply: ar.reply,
        keywords: ar.keywords,
      };
    });

    const data = feedbacks.map((f) => ({
      ...f.toObject(),
      aiResponse: aiMap[f._id.toString()] || null,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's own feedback history
// @route   GET /api/feedback/my-feedback
// @access  Private (Student)
const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.user._id })
      .populate('video', 'title thumbnailPath teacher')
      .sort({ createdAt: -1 });

    // Get AI responses
    const feedbackIds = feedbacks.map((f) => f._id);
    const aiResponses = await AIResponse.find({ feedback: { $in: feedbackIds } });

    const aiMap = {};
    aiResponses.forEach((ar) => {
      aiMap[ar.feedback.toString()] = {
        sentiment: ar.sentiment,
        reply: ar.reply,
      };
    });

    const data = feedbacks.map((f) => ({
      ...f.toObject(),
      aiResponse: aiMap[f._id.toString()] || null,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitFeedback, getVideoFeedback, getMyFeedback };
