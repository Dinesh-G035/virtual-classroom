import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { aiAPI, feedbackAPI } from '../../services/api';
import { FiArrowLeft, FiStar, FiTrendingUp, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FeedbackList from '../../components/feedback/FeedbackList';

const SENTIMENT_COLORS = { positive: '#10b981', neutral: '#f59e0b', negative: '#ef4444' };
const RATING_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];

const VideoAnalytics = () => {
  const { videoId } = useParams();
  const [insights, setInsights] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, feedbackRes] = await Promise.all([
          aiAPI.getInsights(videoId),
          feedbackAPI.getForVideo(videoId),
        ]);
        setInsights(insightsRes.data.data);
        setFeedbacks(feedbackRes.data.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [videoId]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="page-container text-center">
        <p className="text-surface-400">Unable to load analytics.</p>
      </div>
    );
  }

  // Prepare chart data
  const sentimentData = [
    { name: 'Positive', value: insights.sentimentDistribution.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: insights.sentimentDistribution.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: insights.sentimentDistribution.negative, color: SENTIMENT_COLORS.negative },
  ].filter((d) => d.value > 0);

  const ratingData = Object.entries(insights.ratingDistribution).map(([star, count]) => ({
    star: `${star} ⭐`,
    count,
  }));

  const keywordData = (insights.topKeywords || []).slice(0, 8).map((kw) => ({
    keyword: kw.keyword,
    count: kw.count,
  }));

  // Satisfaction gauge color
  const satisfactionColor =
    insights.satisfactionScore >= 70 ? 'text-accent-green' :
    insights.satisfactionScore >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="page-container">
      {/* Back button */}
      <Link
        to="/teacher/my-videos"
        className="inline-flex items-center gap-2 text-surface-400 hover:text-white text-sm font-medium mb-6 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Videos
      </Link>

      <h1 className="section-title">
        <span className="gradient-text">AI Analytics</span> Dashboard
      </h1>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card animate-slide-up">
          <div className="flex items-center gap-2">
            <FiMessageSquare className="w-5 h-5 text-primary-400" />
            <span className="text-xs text-surface-400">Total Feedback</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{insights.totalFeedback}</p>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2">
            <FiStar className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-surface-400">Avg Rating</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{insights.averageRating}<span className="text-lg text-surface-500">/5</span></p>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2">
            <FiTrendingUp className={`w-5 h-5 ${satisfactionColor}`} />
            <span className="text-xs text-surface-400">Satisfaction Score</span>
          </div>
          <p className={`text-3xl font-bold mt-2 ${satisfactionColor}`}>{insights.satisfactionScore}%</p>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">😊</span>
            <span className="text-xs text-surface-400">Top Emoji</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {Object.entries(insights.emojiDistribution || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([emoji, count], i) => (
                <span key={i} className="text-2xl" title={`${count} votes`}>
                  {emoji}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-display font-semibold text-white mb-4">Sentiment Distribution</h3>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-500 text-sm text-center py-12">No data</p>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {sentimentData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-surface-400">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-display font-semibold text-white mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="star" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {ratingData.map((_, index) => (
                  <Cell key={index} fill={RATING_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keywords & Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top Keywords */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-display font-semibold text-white mb-4">🔑 Top Keywords</h3>
          {keywordData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={keywordData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="keyword" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-surface-500 text-sm text-center py-8">No keywords extracted yet.</p>
          )}
        </div>

        {/* Common Issues & Suggestions */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-display font-semibold text-white mb-4">
            <FiAlertCircle className="inline w-4 h-4 mr-1" />
            Issues & Improvement Suggestions
          </h3>
          {insights.improvements && insights.improvements.length > 0 ? (
            <div className="space-y-3">
              {insights.improvements.map((imp, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${
                    imp.priority === 'high'
                      ? 'bg-red-500/5 border-red-500/15'
                      : imp.priority === 'medium'
                      ? 'bg-amber-500/5 border-amber-500/15'
                      : 'bg-surface-800/50 border-surface-600/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      imp.priority === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : imp.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-surface-600/30 text-surface-400'
                    }`}>
                      {imp.priority}
                    </span>
                    <span className="text-xs font-medium text-surface-300 capitalize">{imp.issue}</span>
                  </div>
                  <p className="text-xs text-surface-400">{imp.suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-accent-green text-sm">✅ No major issues found!</p>
              <p className="text-surface-500 text-xs mt-1">Students are happy with your content.</p>
            </div>
          )}
        </div>
      </div>

      {/* All feedback */}
      <div>
        <h2 className="section-title">All Feedback ({feedbacks.length})</h2>
        <FeedbackList feedbacks={feedbacks} showAIReplies={true} />
      </div>
    </div>
  );
};

export default VideoAnalytics;
