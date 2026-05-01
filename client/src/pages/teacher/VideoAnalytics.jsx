import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { aiAPI, feedbackAPI, videoAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { FiArrowLeft, FiStar, FiTrendingUp, FiMessageSquare, FiAlertCircle, FiPlay, FiUploadCloud, FiLink, FiRefreshCw } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FeedbackList from '../../components/feedback/FeedbackList';

const SENTIMENT_COLORS = { positive: '#10b981', neutral: '#f59e0b', negative: '#ef4444' };
const RATING_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];

const VideoAnalytics = () => {
  const { videoId } = useParams();
  const toast = useToast();
  const [insights, setInsights] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [savingAccessibility, setSavingAccessibility] = useState(false);
  const [uploadingInterpreter, setUploadingInterpreter] = useState(false);
  const [signInterpreterInput, setSignInterpreterInput] = useState('');
  const [signLanguageUrlInput, setSignLanguageUrlInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, feedbackRes, videoRes] = await Promise.all([
          aiAPI.getInsights(videoId),
          feedbackAPI.getForVideo(videoId),
          videoAPI.getOne(videoId).catch(() => null),
        ]);
        setInsights(insightsRes.data.data);
        setFeedbacks(feedbackRes.data.data);

        const v = videoRes?.data?.data;
        if (v) {
          setVideo(v);
          setSignLanguageUrlInput(v.signLanguageUrl || '');
          setSignInterpreterInput(/^https?:\/\//i.test(v.signLanguageInterpreter || '') ? v.signLanguageInterpreter : '');
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [videoId]);

  const handleGenerateCaptions = async () => {
    setGeneratingCaptions(true);
    try {
      const res = await videoAPI.generateCaptions(videoId, 'auto');
      const provider = res.data?.data?.provider;
      const cap = res.data?.data?.captions;
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              captionsGenerated: true,
              captionProvider: provider || prev.captionProvider,
              captions: Array.isArray(cap) ? cap : prev.captions,
            }
          : prev
      );
      toast.success('Captions generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate captions');
    } finally {
      setGeneratingCaptions(false);
    }
  };

  const handleSaveAccessibility = async () => {
    setSavingAccessibility(true);
    try {
      const payload = {
        signLanguageUrl: signLanguageUrlInput,
        ...(signInterpreterInput ? { signLanguageInterpreter: signInterpreterInput } : {}),
      };
      const res = await videoAPI.updateSignInterpreter(videoId, payload);
      const updated = res.data?.data;
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              signLanguageInterpreter: updated?.signLanguageInterpreter ?? prev.signLanguageInterpreter,
              signLanguageUrl: updated?.signLanguageUrl ?? prev.signLanguageUrl,
            }
          : prev
      );
      toast.success('Accessibility settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save accessibility settings');
    } finally {
      setSavingAccessibility(false);
    }
  };

  const handleUploadInterpreter = async (file) => {
    if (!file) return;
    setUploadingInterpreter(true);
    try {
      const res = await videoAPI.uploadSignInterpreter(videoId, file);
      const updated = res.data?.data;
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              signLanguageInterpreter: updated?.signLanguageInterpreter ?? prev.signLanguageInterpreter,
              signLanguageUrl: updated?.signLanguageUrl ?? prev.signLanguageUrl,
            }
          : prev
      );
      setSignInterpreterInput('');
      toast.success('Interpreter video uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Interpreter upload failed');
    } finally {
      setUploadingInterpreter(false);
    }
  };

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

      {/* Accessibility */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-display font-semibold text-white">Accessibility</h2>
            <p className="text-xs text-surface-400 mt-1">Auto captions + sign language interpreter overlay</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/teacher/watch/${videoId}`}
              className="btn-primary text-xs px-3 py-2 inline-flex items-center gap-2"
            >
              <FiPlay className="w-4 h-4" />
              Preview
            </Link>
            <button
              onClick={handleGenerateCaptions}
              disabled={generatingCaptions}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-primary-500/30 bg-primary-500/10 text-primary-300 hover:bg-primary-500/15 transition-colors inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`w-4 h-4 ${generatingCaptions ? 'animate-spin' : ''}`} />
              Generate Captions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-800/40 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3">Captions</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
              <span className={`px-2 py-1 rounded-lg border ${video?.captionsGenerated ? 'border-accent-green/30 bg-accent-green/10 text-accent-green' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                {video?.captionsGenerated ? 'Generated' : 'Not generated'}
              </span>
              <span>Provider: <span className="text-white/80">{video?.captionProvider || 'none'}</span></span>
              <span>Count: <span className="text-white/80">{Array.isArray(video?.captions) ? video.captions.length : 0}</span></span>
            </div>
            <p className="text-xs text-surface-500 mt-3">
              Tip: captions are generated automatically on upload; use this button to re-generate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-800/40 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3">Sign Interpreter</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-surface-400 font-semibold uppercase tracking-wider">
                  <FiLink className="inline w-3.5 h-3.5 mr-1" />
                  Interpreter Video URL (optional)
                </label>
                <input
                  value={signInterpreterInput}
                  onChange={(e) => setSignInterpreterInput(e.target.value)}
                  className="input-field mt-1"
                  placeholder="https://... (leave empty if you upload a file)"
                />
              </div>

              <div>
                <label className="text-[11px] text-surface-400 font-semibold uppercase tracking-wider">
                  Reference Link (optional)
                </label>
                <input
                  value={signLanguageUrlInput}
                  onChange={(e) => setSignLanguageUrlInput(e.target.value)}
                  className="input-field mt-1"
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="px-3 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-colors inline-flex items-center gap-2 cursor-pointer">
                  <FiUploadCloud className="w-4 h-4" />
                  {uploadingInterpreter ? 'Uploading...' : 'Upload Interpreter Video'}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleUploadInterpreter(e.target.files?.[0])}
                    disabled={uploadingInterpreter}
                  />
                </label>

                <button
                  onClick={handleSaveAccessibility}
                  disabled={savingAccessibility}
                  className="btn-primary text-xs px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>

              <p className="text-xs text-surface-500">
                Current: <span className="text-white/70">{video?.signLanguageInterpreter ? 'Set' : 'Not set'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

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
