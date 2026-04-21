import { useState, useEffect } from 'react';
import { videoAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';
import { FiVideo, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../components/common/Toast';
import { Link } from 'react-router-dom';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await videoAPI.getMyVideos();
      setVideos(res.data.data);
    } catch (err) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await videoAPI.delete(id);
      setVideos(videos.filter((v) => v._id !== id));
      toast.success('Video deleted successfully');
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title mb-0">My Videos ({videos.length})</h1>
        <Link to="/teacher/upload" className="btn-primary text-sm">
          Upload New
        </Link>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video._id} className="relative group">
              <VideoCard video={video} />
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(video._id); }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition-all z-10"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <FiVideo className="w-12 h-12 text-surface-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Videos Yet</h3>
          <p className="text-surface-400 mb-4">Upload your first lecture to get started.</p>
          <Link to="/teacher/upload" className="btn-primary inline-flex">
            Upload Video
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyVideos;
