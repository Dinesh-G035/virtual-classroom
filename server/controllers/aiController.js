const { generateVideoInsights, generateTeacherSummary } = require('../services/insightService');
const Video = require('../models/Video');

// @desc    Get AI analysis for all feedback on a video
// @route   GET /api/ai/insights/:videoId
// @access  Private (Teacher only)
const getVideoInsights = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Ensure the teacher owns this video
    if (video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const insights = await generateVideoInsights(req.params.videoId);

    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher-wide summary across all videos
// @route   GET /api/ai/teacher-summary
// @access  Private (Teacher only)
const getTeacherSummary = async (req, res) => {
  try {
    const summary = await generateTeacherSummary(req.user._id);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Get teacher summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getVideoInsights, getTeacherSummary };
