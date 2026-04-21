import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { videoAPI, aiAPI } from '../../services/api';
import { FiVideo, FiMessageSquare, FiStar, FiTrendingUp, FiUpload, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import VideoCard from '../../components/video/VideoCard';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosRes, summaryRes] = await Promise.all([
          videoAPI.getMyVideos(),
          aiAPI.getTeacherSummary(),
        ]);
        setVideos(videosRes.data.data);
        setSummary(summaryRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Videos',
      value: summary?.totalVideos || 0,
      icon: FiVideo,
      color: 'from-primary-500 to-accent-violet',
      bg: 'bg-primary-500/10',
    },
    {
      label: 'Total Feedback',
      value: summary?.totalFeedback || 0,
      icon: FiMessageSquare,
      color: 'from-accent-cyan to-accent-green',
      bg: 'bg-accent-cyan/10',
    },
    {
      label: 'Avg Rating',
      value: summary?.overallRating || 0,
      icon: FiStar,
      color: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-500/10',
      suffix: '/5',
    },
    {
      label: 'Satisfaction',
      value: summary?.overallSatisfaction || 0,
      icon: FiTrendingUp,
      color: 'from-accent-green to-emerald-500',
      bg: 'bg-accent-green/10',
      suffix: '%',
    },
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-surface-400">Here's what's happening with your lectures.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: 'inherit' }} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold text-white">
                  {stat.value}{stat.suffix || ''}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sentiment Overview */}
      {summary && summary.sentimentOverview && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-display font-semibold text-white mb-4">Sentiment Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <p className="text-2xl font-bold text-green-400">{summary.sentimentOverview.positive || 0}</p>
              <p className="text-xs text-surface-400 mt-1">😊 Positive</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-2xl font-bold text-amber-400">{summary.sentimentOverview.neutral || 0}</p>
              <p className="text-xs text-surface-400 mt-1">😐 Neutral</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <p className="text-2xl font-bold text-red-400">{summary.sentimentOverview.negative || 0}</p>
              <p className="text-xs text-surface-400 mt-1">😞 Negative</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/teacher/upload"
          className="glass-card-hover p-6 flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center group-hover:shadow-neon transition-shadow">
            <FiUpload className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">Upload New Video</h3>
            <p className="text-xs text-surface-400 mt-0.5">Share a new lecture with students</p>
          </div>
          <FiArrowRight className="w-5 h-5 text-surface-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/teacher/analytics"
          className="glass-card-hover p-6 flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 flex items-center justify-center group-hover:shadow-neon transition-shadow">
            <FiBarChart2 className="w-6 h-6 text-accent-cyan" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">View Analytics</h3>
            <p className="text-xs text-surface-400 mt-0.5">AI-powered insights from feedback</p>
          </div>
          <FiArrowRight className="w-5 h-5 text-surface-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Videos</h2>
          <Link to="/teacher/my-videos" className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.slice(0, 6).map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <FiVideo className="w-12 h-12 text-surface-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Videos Yet</h3>
            <p className="text-surface-400 mb-4">Start by uploading your first lecture video.</p>
            <Link to="/teacher/upload" className="btn-primary inline-flex items-center gap-2">
              <FiUpload className="w-4 h-4" />
              Upload Video
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
