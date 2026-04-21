import { FiStar, FiUser, FiClock, FiCpu } from 'react-icons/fi';

const sentimentConfig = {
  positive: { class: 'badge-positive', label: 'Positive' },
  negative: { class: 'badge-negative', label: 'Negative' },
  neutral: { class: 'badge-neutral', label: 'Neutral' },
};

const FeedbackList = ({ feedbacks, showAIReplies = true }) => {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-surface-400">No feedback yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => {
        const sentiment = feedback.aiResponse?.sentiment;
        const sConfig = sentimentConfig[sentiment] || sentimentConfig.neutral;

        return (
          <div
            key={feedback._id}
            className="glass-card p-5 animate-fade-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {feedback.student?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-surface-500 flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {formatDate(feedback.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Emoji */}
                {feedback.emoji && (
                  <span className="text-xl">{feedback.emoji}</span>
                )}
                {/* Rating */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= feedback.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-surface-600'
                      }`}
                    />
                  ))}
                </div>
                {/* Sentiment badge */}
                {sentiment && (
                  <span className={sConfig.class}>{sConfig.label}</span>
                )}
              </div>
            </div>

            {/* Comment */}
            <p className="text-sm text-surface-300 leading-relaxed mb-3">
              {feedback.comment}
            </p>

            {/* AI Reply */}
            {showAIReplies && feedback.aiResponse?.reply && (
              <div className="mt-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/15">
                <div className="flex items-center gap-2 mb-1.5">
                  <FiCpu className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-xs font-semibold text-primary-400">AI Response</span>
                </div>
                <p className="text-sm text-surface-300 leading-relaxed">
                  {feedback.aiResponse.reply}
                </p>
                {/* Keywords */}
                {feedback.aiResponse.keywords && feedback.aiResponse.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {feedback.aiResponse.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-surface-700/50 text-surface-400 border border-surface-600/30"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackList;
