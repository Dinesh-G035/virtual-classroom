import { FiPlay, FiClock, FiEye, FiMessageSquare, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const { isTeacher } = useAuth();

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views || 0;
  };

  const handleClick = () => {
    if (isTeacher) {
      navigate(`/teacher/video/${video._id}`);
    } else {
      navigate(`/student/watch/${video._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="glass-card-hover cursor-pointer overflow-hidden group"
    >
      {/* Thumbnail placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-900/50 to-surface-800 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
            <FiPlay className="w-6 h-6 text-white ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-xs text-white font-medium flex items-center gap-1">
          <FiClock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-primary-300 transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
            <FiUser className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-surface-400">
            {video.teacher?.name || 'Unknown Teacher'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-surface-500">
          <span className="flex items-center gap-1">
            <FiEye className="w-3.5 h-3.5" />
            {formatViews(video.views)} views
          </span>
          <span className="flex items-center gap-1">
            <FiMessageSquare className="w-3.5 h-3.5" />
            {video.feedbackCount || 0} feedback
          </span>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {video.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-primary-500/10 text-primary-400 border border-primary-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
