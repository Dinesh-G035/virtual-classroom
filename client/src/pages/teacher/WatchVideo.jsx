import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import VideoPlayer from '../../components/video/VideoPlayer';
import { FiArrowLeft, FiUser, FiEye, FiClock, FiTag, FiBarChart2 } from 'react-icons/fi';

const WatchVideoTeacher = () => {
  const { videoId } = useParams();
  const toast = useToast();
  const [video, setVideo] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoRes, captionsRes] = await Promise.all([
          videoAPI.getOne(videoId),
          videoAPI.getCaptions(videoId).catch(() => null),
        ]);

        setVideo(videoRes.data.data);
        const cap = captionsRes?.data?.data?.captions;
        if (Array.isArray(cap)) setCaptions(cap);
      } catch (err) {
        console.error('Teacher watch video error:', err);
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="page-container max-w-5xl">
        <div className="skeleton h-[400px] rounded-2xl mb-6" />
        <div className="skeleton h-8 w-64 rounded-lg mb-4" />
        <div className="skeleton h-4 w-96 rounded-lg" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="page-container text-center">
        <p className="text-surface-400">Video not found.</p>
        <Link to="/teacher/my-videos" className="btn-primary inline-flex mt-4">Go Back</Link>
      </div>
    );
  }

  const token = localStorage.getItem('authToken');
  const streamUrl = video.filePath ? `/api/videos/stream/${videoId}?token=${token}` : null;

  const signInterpreterUrl = (() => {
    if (!video.signLanguageInterpreter) return null;
    if (/^https?:\/\//i.test(video.signLanguageInterpreter)) return video.signLanguageInterpreter;
    return videoAPI.getSignInterpreterStreamUrl(videoId);
  })();

  return (
    <div className="page-container max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link
          to="/teacher/my-videos"
          className="inline-flex items-center gap-2 text-surface-400 hover:text-white text-sm font-medium transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to My Videos
        </Link>

        <Link
          to={`/teacher/video/${videoId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          <FiBarChart2 className="w-4 h-4" />
          Analytics
        </Link>
      </div>

      <VideoPlayer
        videoUrl={streamUrl}
        subtitles={video.subtitles}
        captions={captions}
        signInterpreterUrl={signInterpreterUrl}
        title={video.title}
      />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-3">{video.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center">
              <FiUser className="w-3.5 h-3.5 text-white" />
            </div>
            <span>{video.teacher?.name}</span>
          </div>
          <span className="flex items-center gap-1">
            <FiEye className="w-4 h-4" />
            {video.views} views
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            {formatDuration(video.duration)}
          </span>
        </div>

        {video.description && (
          <div className="glass-card p-4 mb-4">
            <p className="text-sm text-surface-300 leading-relaxed">{video.description}</p>
          </div>
        )}

        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {video.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 flex items-center gap-1"
              >
                <FiTag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchVideoTeacher;

