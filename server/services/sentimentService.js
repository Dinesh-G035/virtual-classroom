const Sentiment = require('sentiment');
const sentiment = new Sentiment();

/**
 * Analyze the sentiment of a given text
 * Uses AFINN-165 wordlist and Emoji Sentiment Ranking
 * @param {string} text - The feedback text to analyze
 * @returns {object} - { sentiment, score, comparative, keywords }
 */
const analyzeSentiment = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      sentiment: 'neutral',
      score: 0,
      comparative: 0,
      keywords: [],
    };
  }

  const result = sentiment.analyze(text);

  // Determine sentiment label
  let sentimentLabel = 'neutral';
  if (result.comparative > 0.1) {
    sentimentLabel = 'positive';
  } else if (result.comparative < -0.1) {
    sentimentLabel = 'negative';
  }

  // Extract meaningful keywords (words that contributed to sentiment)
  const positiveWords = result.positive || [];
  const negativeWords = result.negative || [];
  const allSentimentWords = [...positiveWords, ...negativeWords];

  // Also extract domain-specific keywords
  const domainKeywords = extractDomainKeywords(text);
  const allKeywords = [...new Set([...allSentimentWords, ...domainKeywords])];

  return {
    sentiment: sentimentLabel,
    score: result.score,
    comparative: result.comparative,
    keywords: allKeywords.slice(0, 10), // top 10 keywords
    positiveWords,
    negativeWords,
  };
};

/**
 * Extract domain-specific keywords related to education/lectures
 * @param {string} text
 * @returns {string[]}
 */
const extractDomainKeywords = (text) => {
  const lowerText = text.toLowerCase();
  const keywords = [];

  const domainTerms = {
    speed: ['fast', 'slow', 'pace', 'speed', 'quick', 'rush', 'hurry', 'rapid'],
    audio: ['audio', 'sound', 'volume', 'hear', 'loud', 'quiet', 'mute', 'mic', 'microphone'],
    video: ['video', 'visual', 'blur', 'blurry', 'resolution', 'quality', 'screen', 'display'],
    clarity: ['clear', 'unclear', 'confusing', 'confused', 'understand', 'difficult', 'complex', 'simple', 'easy'],
    content: ['content', 'topic', 'subject', 'material', 'example', 'examples', 'explain', 'explanation', 'detail'],
    engagement: ['boring', 'interesting', 'engaging', 'interactive', 'fun', 'dull', 'monotone'],
    duration: ['long', 'short', 'duration', 'length', 'time', 'brief'],
    subtitles: ['subtitle', 'subtitles', 'caption', 'captions', 'text'],
    accessibility: ['accessible', 'accessibility', 'sign language', 'deaf', 'visible'],
  };

  for (const [category, terms] of Object.entries(domainTerms)) {
    for (const term of terms) {
      if (lowerText.includes(term)) {
        keywords.push(category);
        break;
      }
    }
  }

  return keywords;
};

/**
 * Batch analyze multiple feedback texts
 * @param {string[]} texts - Array of feedback comment strings
 * @returns {object} - Aggregated sentiment stats
 */
const batchAnalyze = (texts) => {
  const results = texts.map((text) => analyzeSentiment(text));

  const positive = results.filter((r) => r.sentiment === 'positive').length;
  const negative = results.filter((r) => r.sentiment === 'negative').length;
  const neutral = results.filter((r) => r.sentiment === 'neutral').length;
  const total = results.length;

  const allKeywords = results.flatMap((r) => r.keywords);
  const keywordFrequency = {};
  allKeywords.forEach((kw) => {
    keywordFrequency[kw] = (keywordFrequency[kw] || 0) + 1;
  });

  // Sort keywords by frequency
  const topKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, count]) => ({ keyword, count }));

  return {
    total,
    positive,
    negative,
    neutral,
    positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
    negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
    neutralPercent: total > 0 ? Math.round((neutral / total) * 100) : 0,
    avgScore: total > 0 ? results.reduce((sum, r) => sum + r.comparative, 0) / total : 0,
    topKeywords,
    results,
  };
};

module.exports = { analyzeSentiment, extractDomainKeywords, batchAnalyze };
