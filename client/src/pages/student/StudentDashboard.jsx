import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { videoAPI, feedbackAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';
import { FiVideo, FiMessageSquare, FiSearch, FiGrid } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosRes, feedbackRes] = await Promise.all([
          videoAPI.getAll({ limit: 12 }),
          feedbackAPI.getMyFeedback(),
        ]);
        setVideos(videosRes.data.data);
        setMyFeedback(feedbackRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase()) ||
    v.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-12 w-72 rounded-xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 🎓
        </h1>
        <p className="text-surface-400">Explore lectures and share your feedback to help improve the content.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="stat-card animate-slide-up">
          <div className="flex items-center gap-2">
            <FiVideo className="w-5 h-5 text-primary-400" />
            <span className="text-xs text-surface-400">Available Lectures</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{videos.length}</p>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2">
            <FiMessageSquare className="w-5 h-5 text-accent-cyan" />
            <span className="text-xs text-surface-400">My Feedback</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{myFeedback.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
            placeholder="Search videos by title, topic, or tag..."
          />
        </div>
      </div>

      {/* Videos grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <FiGrid className="inline w-5 h-5 mr-2" />
          Browse Lectures
        </h2>
      </div>

      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <FiVideo className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {search ? 'No videos found' : 'No Videos Available'}
          </h3>
          <p className="text-surface-400">
            {search ? 'Try different search terms.' : 'Check back later for new lectures.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
