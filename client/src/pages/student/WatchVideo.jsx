import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoAPI, feedbackAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';
import VideoPlayer from '../../components/video/VideoPlayer';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import FeedbackList from '../../components/feedback/FeedbackList';
import { FiArrowLeft, FiUser, FiEye, FiClock, FiTag } from 'react-icons/fi';

const WatchVideo = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [video, setVideo] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoRes, feedbackRes] = await Promise.all([
          videoAPI.getOne(videoId),
          feedbackAPI.getForVideo(videoId),
        ]);
        setVideo(videoRes.data.data);
        setFeedbacks(feedbackRes.data.data);

        // Check if current user already submitted feedback
        const existing = feedbackRes.data.data.find(
          (f) => f.student?._id === user?._id
        );
        if (existing) setHasSubmitted(true);
      } catch (err) {
        console.error('Watch video error:', err);
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [videoId]);

  const handleSubmitFeedback = async (feedbackData) => {
    setSubmitting(true);
    try {
      const res = await feedbackAPI.submit({
        videoId,
        ...feedbackData,
      });

      // Add new feedback to list
      const newFeedback = {
        ...res.data.data.feedback,
        aiResponse: res.data.data.aiResponse,
      };
      setFeedbacks([newFeedback, ...feedbacks]);
      setHasSubmitted(true);

      toast.success('Feedback submitted! AI has analyzed your response. 🤖');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

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
        <Link to="/student" className="btn-primary inline-flex mt-4">Go Back</Link>
      </div>
    );
  }

  // Build video stream URL with token as query param (video element can't send auth headers)
  const token = localStorage.getItem('authToken');
  const streamUrl = video.filePath ? `/api/videos/stream/${videoId}?token=${token}` : null;

  return (
    <div className="page-container max-w-5xl">
      {/* Back */}
      <Link
        to="/student"
        className="inline-flex items-center gap-2 text-surface-400 hover:text-white text-sm font-medium mb-4 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Videos
      </Link>

      {/* Video Player */}
      <VideoPlayer
        videoUrl={streamUrl}
        subtitles={video.subtitles}
        title={video.title}
      />

      {/* Video Info */}
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

        {/* Tags */}
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

      {/* Feedback section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <FeedbackForm
            onSubmit={handleSubmitFeedback}
            loading={submitting}
            disabled={hasSubmitted}
          />
        </div>

        {/* Feedback list */}
        <div className="lg:col-span-3">
          <h3 className="text-lg font-display font-semibold text-white mb-4">
            Student Feedback ({feedbacks.length})
          </h3>
          <FeedbackList feedbacks={feedbacks} showAIReplies={true} />
        </div>
      </div>
    </div>
  );
};

export default WatchVideo;
