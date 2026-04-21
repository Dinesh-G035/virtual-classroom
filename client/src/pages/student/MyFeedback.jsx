import { useState, useEffect } from 'react';
import { feedbackAPI } from '../../services/api';
import { FiStar, FiClock, FiVideo, FiCpu } from 'react-icons/fi';

const sentimentConfig = {
  positive: { class: 'badge-positive', label: 'Positive' },
  negative: { class: 'badge-negative', label: 'Negative' },
  neutral: { class: 'badge-neutral', label: 'Neutral' },
};

const MyFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await feedbackAPI.getMyFeedback();
        setFeedbacks(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl mb-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title">My Feedback History ({feedbacks.length})</h1>

      {feedbacks.length > 0 ? (
        <div className="space-y-4">
          {feedbacks.map((fb) => {
            const sentiment = fb.aiResponse?.sentiment;
            const sConfig = sentimentConfig[sentiment] || sentimentConfig.neutral;

            return (
              <div key={fb._id} className="glass-card p-5 animate-fade-in">
                {/* Video reference */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-surface-700/30">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <FiVideo className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {fb.video?.title || 'Unknown Video'}
                    </p>
                    <p className="text-xs text-surface-500 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {formatDate(fb.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {fb.emoji && <span className="text-xl">{fb.emoji}</span>}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= fb.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-surface-600'
                          }`}
                        />
                      ))}
                    </div>
                    {sentiment && <span className={sConfig.class}>{sConfig.label}</span>}
                  </div>
                </div>

                {/* My comment */}
                <p className="text-sm text-surface-300 leading-relaxed mb-3">{fb.comment}</p>

                {/* AI Reply */}
                {fb.aiResponse?.reply && (
                  <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/15">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FiCpu className="w-3.5 h-3.5 text-primary-400" />
                      <span className="text-xs font-semibold text-primary-400">AI Response</span>
                    </div>
                    <p className="text-sm text-surface-300 leading-relaxed">
                      {fb.aiResponse.reply}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <FiVideo className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Feedback Yet</h3>
          <p className="text-surface-400">Watch some videos and share your feedback to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default MyFeedback;
