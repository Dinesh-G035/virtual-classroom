import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import { FiBarChart2 } from 'react-icons/fi';

const TeacherAnalyticsIndex = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await aiAPI.getTeacherSummary();
        setSummary(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl mb-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title">
        <span className="gradient-text">Analytics</span> Overview
      </h1>

      {/* Overall stats */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Overall Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{summary?.totalVideos || 0}</p>
            <p className="text-xs text-surface-400">Videos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{summary?.totalFeedback || 0}</p>
            <p className="text-xs text-surface-400">Feedbacks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{summary?.overallRating || 0}/5</p>
            <p className="text-xs text-surface-400">Avg Rating</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${
              (summary?.overallSatisfaction || 0) >= 70 ? 'text-accent-green' : 'text-amber-400'
            }`}>{summary?.overallSatisfaction || 0}%</p>
            <p className="text-xs text-surface-400">Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Per-video analytics links */}
      <h2 className="text-lg font-semibold text-white mb-4">Video Analytics</h2>
      {summary?.videoBreakdown && summary.videoBreakdown.length > 0 ? (
        <div className="space-y-3">
          {summary.videoBreakdown.map((video) => (
            <Link
              key={video.videoId}
              to={`/teacher/video/${video.videoId}`}
              className="glass-card-hover p-4 flex items-center justify-between group block"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <FiBarChart2 className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-surface-400">
                    {video.feedbackCount} feedback • {video.views} views • ⭐ {video.averageRating}
                  </p>
                </div>
              </div>
              <span className="text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View Details →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-surface-400">No analytics data available yet. Upload videos and collect feedback to see insights.</p>
        </div>
      )}

      {/* Top Issues */}
      {summary?.topIssues && summary.topIssues.length > 0 && (
        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">⚠️ Top Issues Across All Videos</h2>
          <div className="flex flex-wrap gap-2">
            {summary.topIssues.map((issue, i) => (
              <span key={i} className="badge-negative px-3 py-1.5 text-sm capitalize">
                {issue.issue} ({issue.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAnalyticsIndex;
