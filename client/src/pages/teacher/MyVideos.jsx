import { useState, useEffect, useRef } from 'react';
import { videoAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';
import { FiVideo, FiTrash2, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../components/common/Toast';
import { Link } from 'react-router-dom';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const previousStatusesRef = useRef({});

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (!videos.length) return;

    const interval = setInterval(() => {
      fetchVideos();
    }, 5000);

    return () => clearInterval(interval);
  }, [videos.length]);

  const fetchVideos = async () => {
    try {
      const res = await videoAPI.getMyVideos();
      const nextVideos = res.data.data || [];
      const completedVideos = nextVideos.filter((video) => {
        const previousStatus = previousStatusesRef.current[video._id];
        return previousStatus !== 'completed' && video.processingStatus === 'completed';
      });
      const failedVideos = nextVideos.filter((video) => {
        const previousStatus = previousStatusesRef.current[video._id];
        return previousStatus !== 'failed' && video.processingStatus === 'failed';
      });

      if (completedVideos.length > 0) {
        const title = completedVideos[0].title || 'Your video';
        toast.success(`${title} is ready. Captions have finished processing.`);
      }
      if (failedVideos.length > 0) {
        const title = failedVideos[0].title || 'Your video';
        toast.error(`${title} could not be processed. Please try again.`);
      }

      previousStatusesRef.current = Object.fromEntries(nextVideos.map((video) => [video._id, video.processingStatus]));
      setVideos(nextVideos);
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
              <div className="mb-2 flex items-center gap-2 text-xs">
                {video.processingStatus === 'completed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Captions ready
                  </span>
                )}
                {video.processingStatus === 'processing' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-300">
                    <FiLoader className="w-3.5 h-3.5 animate-spin" /> Generating captions...
                  </span>
                )}
                {video.processingStatus === 'failed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-red-400">
                    <FiAlertCircle className="w-3.5 h-3.5" /> Processing failed
                  </span>
                )}
                {video.processingStatus === 'queued' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-1 text-sky-300">
                    <FiLoader className="w-3.5 h-3.5 animate-spin" /> Queued
                  </span>
                )}
              </div>
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
