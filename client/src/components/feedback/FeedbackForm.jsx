import { useState } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';

const emojis = ['😊', '😐', '😞', '👍', '👎', '🎉', '❤️'];

const FeedbackForm = ({ onSubmit, loading, disabled }) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim() || rating === 0) return;
    onSubmit({ comment, rating, emoji: selectedEmoji });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 animate-fade-in">
      <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
        💬 Share Your Feedback
      </h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="input-label">Rating</label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-125 active:scale-95"
            >
              <FiStar
                className={`w-7 h-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-surface-600 hover:text-surface-400'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-surface-400">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Emoji Reactions */}
      <div className="mb-4">
        <label className="input-label">Reaction (Optional)</label>
        <div className="flex items-center gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(selectedEmoji === emoji ? '' : emoji)}
              className={`text-2xl p-1.5 rounded-xl transition-all duration-200 ${
                selectedEmoji === emoji
                  ? 'bg-primary-500/20 border-2 border-primary-500/50 scale-110 shadow-neon/20'
                  : 'hover:bg-surface-700/50 hover:scale-110 border-2 border-transparent'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="input-label" htmlFor="feedback-comment">Your Feedback</label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-field resize-none h-28"
          placeholder="Share your thoughts about this lecture... (e.g., pace, clarity, content quality)"
          maxLength={1000}
        />
        <p className="text-xs text-surface-500 mt-1 text-right">
          {comment.length}/1000
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || disabled || !comment.trim() || rating === 0}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <FiSend className="w-4 h-4" />
            Submit Feedback
          </>
        )}
      </button>

      {disabled && (
        <p className="text-xs text-amber-400 text-center mt-2">
          You have already submitted feedback for this video.
        </p>
      )}
    </form>
  );
};

export default FeedbackForm;
