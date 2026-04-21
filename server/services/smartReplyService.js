/**
 * Smart Reply Generator
 * Generates contextual AI replies to student feedback based on
 * keyword matching, sentiment, and pattern recognition.
 */

// Pattern-based reply rules (ordered by specificity)
const replyPatterns = [
  // Speed-related
  {
    keywords: ['too fast', 'very fast', 'so fast', 'rushing', 'rush'],
    reply: "Thank you for your feedback! We'll adjust the pace and slow down in future sessions to ensure better understanding.",
  },
  {
    keywords: ['too slow', 'very slow', 'so slow', 'dragging'],
    reply: "Thanks for letting us know! We'll pick up the pace and keep the content more engaging in upcoming lectures.",
  },
  {
    keywords: ['fast', 'speed', 'pace', 'quick', 'rapid'],
    reply: "We appreciate your feedback about the pacing. We'll work on finding the right speed for future sessions.",
  },

  // Audio-related
  {
    keywords: ['audio', 'sound', 'volume', 'hear', 'loud', 'quiet', 'mic', 'microphone'],
    reply: "Thanks for flagging the audio issue! We'll improve the sound quality and ensure clear audio in future recordings.",
  },

  // Video quality
  {
    keywords: ['blur', 'blurry', 'resolution', 'quality', 'pixelated'],
    reply: "We've noted the video quality concern. We'll record in higher resolution for upcoming lectures. Thank you!",
  },

  // Clarity/Understanding
  {
    keywords: ['confusing', 'confused', 'unclear', 'difficult to understand', 'hard to follow'],
    reply: "We understand your concern about clarity. We'll add more examples and break down complex topics step by step.",
  },
  {
    keywords: ['not clear', 'didnt understand', "didn't understand", 'not understand'],
    reply: "Thank you for the honest feedback. We'll revisit this topic with simpler explanations and visual aids.",
  },

  // Content requests
  {
    keywords: ['more examples', 'need examples', 'practical', 'hands-on', 'demo'],
    reply: "Great suggestion! We'll include more practical examples and live demonstrations in future lectures.",
  },
  {
    keywords: ['too short', 'brief', 'need more detail', 'not enough'],
    reply: "Thank you! We'll create more detailed content and expand on key concepts in upcoming sessions.",
  },
  {
    keywords: ['too long', 'lengthy', 'boring', 'dull', 'monotone'],
    reply: "We appreciate your feedback! We'll work on making the content more concise and engaging with interactive elements.",
  },

  // Subtitles/Accessibility
  {
    keywords: ['subtitle', 'subtitles', 'caption', 'captions'],
    reply: "Thanks for the feedback about subtitles! We'll ensure accurate and well-timed captions for all future videos.",
  },
  {
    keywords: ['sign language', 'deaf', 'accessible', 'accessibility'],
    reply: "Accessibility is our priority! We'll enhance sign language support and add more accessibility features.",
  },

  // Positive feedback
  {
    keywords: ['excellent', 'amazing', 'fantastic', 'wonderful', 'outstanding', 'brilliant'],
    reply: "Thank you so much for the wonderful feedback! 🎉 We're thrilled you enjoyed the lecture. More great content coming soon!",
  },
  {
    keywords: ['great', 'good', 'nice', 'helpful', 'useful', 'informative'],
    reply: "Thank you for the positive feedback! We're glad you found the lecture helpful. Keep watching and learning! 😊",
  },
  {
    keywords: ['love', 'loved', 'enjoy', 'enjoyed', 'perfect'],
    reply: "We're so happy you loved it! ❤️ Your encouragement motivates us to create even better content.",
  },
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    reply: "You're welcome! We're glad the content was valuable. Stay tuned for more lectures! 🙏",
  },
];

// Sentiment-based fallback replies
const sentimentFallbacks = {
  positive: [
    "Thank you for the positive feedback! We're glad you're enjoying the content. 😊",
    "We appreciate your kind words! Your feedback helps us keep improving.",
    "Great to hear that! We'll continue to deliver quality content for you.",
  ],
  negative: [
    "We're sorry to hear about your experience. We'll work on addressing your concerns in future sessions.",
    "Thank you for the honest feedback. We take all concerns seriously and will make improvements.",
    "We appreciate you sharing this. Your feedback helps us identify areas for improvement.",
  ],
  neutral: [
    "Thank you for your feedback! We'll take it into consideration for future lectures.",
    "We appreciate you taking the time to share your thoughts. Every feedback helps us improve!",
    "Thanks for the feedback! We're always working to enhance the learning experience.",
  ],
};

/**
 * Generate a smart reply based on feedback text and sentiment
 * @param {string} comment - The student's feedback comment
 * @param {string} sentimentLabel - 'positive' | 'negative' | 'neutral'
 * @returns {string} - Generated reply
 */
const generateSmartReply = (comment, sentimentLabel = 'neutral') => {
  if (!comment || typeof comment !== 'string') {
    return sentimentFallbacks.neutral[0];
  }

  const lowerComment = comment.toLowerCase();

  // Try pattern matching first (most specific wins)
  for (const pattern of replyPatterns) {
    for (const keyword of pattern.keywords) {
      if (lowerComment.includes(keyword)) {
        return pattern.reply;
      }
    }
  }

  // Fall back to sentiment-based reply
  const fallbacks = sentimentFallbacks[sentimentLabel] || sentimentFallbacks.neutral;
  const randomIndex = Math.floor(Math.random() * fallbacks.length);
  return fallbacks[randomIndex];
};

module.exports = { generateSmartReply };
