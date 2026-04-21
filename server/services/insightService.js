const Feedback = require('../models/Feedback');
const AIResponse = require('../models/AIResponse');
const { batchAnalyze } = require('./sentimentService');

/**
 * Generate comprehensive insights for a specific video
 * @param {string} videoId - The video's ObjectId
 * @returns {object} - Aggregated insights
 */
const generateVideoInsights = async (videoId) => {
  // Get all feedback for the video
  const feedbacks = await Feedback.find({ video: videoId })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

  if (feedbacks.length === 0) {
    return {
      totalFeedback: 0,
      averageRating: 0,
      satisfactionScore: 0,
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      topKeywords: [],
      commonIssues: [],
      improvements: [],
      emojiDistribution: {},
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentFeedback: [],
    };
  }

  // Get AI responses for all feedbacks
  const feedbackIds = feedbacks.map((f) => f._id);
  const aiResponses = await AIResponse.find({ feedback: { $in: feedbackIds } });

  // Build lookup map
  const aiResponseMap = {};
  aiResponses.forEach((ar) => {
    aiResponseMap[ar.feedback.toString()] = ar;
  });

  // Calculate average rating
  const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = totalRating / feedbacks.length;

  // Rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach((f) => {
    ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
  });

  // Emoji distribution
  const emojiDistribution = {};
  feedbacks.forEach((f) => {
    if (f.emoji) {
      emojiDistribution[f.emoji] = (emojiDistribution[f.emoji] || 0) + 1;
    }
  });

  // Sentiment distribution from AI responses
  const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
  aiResponses.forEach((ar) => {
    sentimentDistribution[ar.sentiment] = (sentimentDistribution[ar.sentiment] || 0) + 1;
  });

  // Batch analyze all comments for keywords
  const comments = feedbacks.map((f) => f.comment);
  const batchResult = batchAnalyze(comments);

  // Generate common issues (from negative feedback keywords)
  const negativeResponses = aiResponses.filter((ar) => ar.sentiment === 'negative');
  const issueKeywords = negativeResponses.flatMap((ar) => ar.keywords);
  const issueCounts = {};
  issueKeywords.forEach((kw) => {
    issueCounts[kw] = (issueCounts[kw] || 0) + 1;
  });
  const commonIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));

  // Generate improvement suggestions based on issues
  const improvements = generateImprovementSuggestions(commonIssues);

  // Satisfaction score (0-100 based on ratings and sentiment)
  const ratingScore = (averageRating / 5) * 100;
  const sentimentScore =
    feedbacks.length > 0
      ? ((sentimentDistribution.positive * 100 +
          sentimentDistribution.neutral * 50 +
          sentimentDistribution.negative * 0) /
          feedbacks.length)
      : 50;
  const satisfactionScore = Math.round(ratingScore * 0.6 + sentimentScore * 0.4);

  // Recent feedback with AI responses
  const recentFeedback = feedbacks.slice(0, 10).map((f) => {
    const aiResp = aiResponseMap[f._id.toString()];
    return {
      _id: f._id,
      student: f.student,
      comment: f.comment,
      rating: f.rating,
      emoji: f.emoji,
      createdAt: f.createdAt,
      aiResponse: aiResp
        ? {
            sentiment: aiResp.sentiment,
            reply: aiResp.reply,
            keywords: aiResp.keywords,
          }
        : null,
    };
  });

  return {
    totalFeedback: feedbacks.length,
    averageRating: Math.round(averageRating * 10) / 10,
    satisfactionScore,
    sentimentDistribution,
    topKeywords: batchResult.topKeywords,
    commonIssues,
    improvements,
    emojiDistribution,
    ratingDistribution,
    recentFeedback,
  };
};

/**
 * Generate teacher-wide summary across all videos
 * @param {string} teacherId - The teacher's user ObjectId
 * @returns {object} - Cross-video summary
 */
const generateTeacherSummary = async (teacherId) => {
  const Video = require('../models/Video');
  const videos = await Video.find({ teacher: teacherId });

  if (videos.length === 0) {
    return {
      totalVideos: 0,
      totalFeedback: 0,
      overallRating: 0,
      overallSatisfaction: 0,
      sentimentOverview: { positive: 0, negative: 0, neutral: 0 },
      topIssues: [],
      videoBreakdown: [],
    };
  }

  const videoIds = videos.map((v) => v._id);
  const allFeedback = await Feedback.find({ video: { $in: videoIds } });
  const allAIResponses = await AIResponse.find({
    feedback: { $in: allFeedback.map((f) => f._id) },
  });

  // Overall rating
  const totalRating = allFeedback.reduce((sum, f) => sum + f.rating, 0);
  const overallRating = allFeedback.length > 0 ? totalRating / allFeedback.length : 0;

  // Sentiment overview
  const sentimentOverview = { positive: 0, negative: 0, neutral: 0 };
  allAIResponses.forEach((ar) => {
    sentimentOverview[ar.sentiment] = (sentimentOverview[ar.sentiment] || 0) + 1;
  });

  // Top issues across all videos
  const allKeywords = allAIResponses
    .filter((ar) => ar.sentiment === 'negative')
    .flatMap((ar) => ar.keywords);
  const issueCounts = {};
  allKeywords.forEach((kw) => {
    issueCounts[kw] = (issueCounts[kw] || 0) + 1;
  });
  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([issue, count]) => ({ issue, count }));

  // Per-video breakdown
  const videoBreakdown = videos.map((video) => {
    const videoFeedback = allFeedback.filter(
      (f) => f.video.toString() === video._id.toString()
    );
    const avgRating =
      videoFeedback.length > 0
        ? videoFeedback.reduce((sum, f) => sum + f.rating, 0) / videoFeedback.length
        : 0;
    return {
      videoId: video._id,
      title: video.title,
      feedbackCount: videoFeedback.length,
      averageRating: Math.round(avgRating * 10) / 10,
      views: video.views,
    };
  });

  // Overall satisfaction
  const ratingScore = (overallRating / 5) * 100;
  const total = allAIResponses.length || 1;
  const sentimentScore =
    (sentimentOverview.positive * 100 + sentimentOverview.neutral * 50) / total;
  const overallSatisfaction = Math.round(ratingScore * 0.6 + sentimentScore * 0.4);

  return {
    totalVideos: videos.length,
    totalFeedback: allFeedback.length,
    overallRating: Math.round(overallRating * 10) / 10,
    overallSatisfaction,
    sentimentOverview,
    topIssues,
    videoBreakdown,
  };
};

/**
 * Generate improvement suggestions based on common issues
 */
const generateImprovementSuggestions = (commonIssues) => {
  const suggestionMap = {
    speed: '⏱️ Consider adjusting the lecture pace. Use pauses after key concepts.',
    audio: '🎙️ Improve microphone quality and check audio levels before recording.',
    video: '📹 Record in higher resolution (1080p+) and ensure good lighting.',
    clarity:
      '📝 Add more visual aids, diagrams, and step-by-step breakdowns for complex topics.',
    content: '📚 Include more real-world examples and practical demonstrations.',
    engagement: '🎯 Add interactive elements like quizzes or discussion prompts.',
    duration: '⏰ Consider breaking long lectures into shorter segments (15-20 min each).',
    subtitles: '📄 Ensure all videos have accurate, well-timed subtitles.',
    accessibility: '♿ Add sign language interpretation and enhance accessibility features.',
  };

  return commonIssues
    .map((issue) => ({
      issue: issue.issue,
      suggestion: suggestionMap[issue.issue] || `📌 Address "${issue.issue}" based on student feedback.`,
      priority: issue.count >= 3 ? 'high' : issue.count >= 2 ? 'medium' : 'low',
    }));
};

module.exports = { generateVideoInsights, generateTeacherSummary };
