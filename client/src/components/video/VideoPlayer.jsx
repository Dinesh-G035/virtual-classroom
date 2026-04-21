import { useRef, useState, useEffect } from 'react';
import { FiMaximize, FiMinimize, FiVolume2, FiVolumeX, FiAirplay } from 'react-icons/fi';

const VideoPlayer = ({ videoUrl, subtitles, title }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showSignLanguage, setShowSignLanguage] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-black group shadow-2xl">
      {/* Video element */}
      {videoUrl ? (
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-surface-700/50 flex items-center justify-center mb-4 border border-white/5">
              <FiAirplay className="w-10 h-10 text-surface-400" />
            </div>
            <p className="text-surface-400 text-sm font-medium">{title || "No Video Loaded"}</p>
            <p className="text-surface-500 text-xs mt-1">Video stream will appear here</p>
          </div>
        </div>
      )}

      {/* Subtitles overlay */}
      {showSubtitles && subtitles && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-[85%] z-10 transition-all pointer-events-none">
          <p className="px-4 py-2 bg-black/80 backdrop-blur-md rounded-xl text-white text-sm md:text-base text-center border border-white/10 shadow-lg">
            {subtitles}
          </p>
        </div>
      )}

      {/* Sign Language Interpreter Overlay */}
      {showSignLanguage && (
        <div className="absolute top-4 right-4 w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl animate-scale-in z-20 glass-card">
          <div className="w-full h-full bg-surface-900 flex items-center justify-center">
             <img 
              src="/sign_language_interpreter.png" 
              alt="Sign Language Interpreter" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=SL&background=6366f1&color=fff"; }}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-primary-500/80 backdrop-blur-sm py-1 px-2">
            <p className="text-[10px] text-white font-bold text-center uppercase tracking-wider">Interpreter</p>
          </div>
        </div>
      )}

      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-4 px-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-5 group/progress relative"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary-500 rounded-full relative transition-all shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity scale-125" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-all transform active:scale-90">
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Mute */}
            <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
              {isMuted ? <FiVolumeX className="w-6 h-6" /> : <FiVolume2 className="w-6 h-6" />}
            </button>

            {/* Time */}
            <span className="text-xs text-white/80 font-mono tracking-tight bg-white/5 px-2 py-1 rounded-md">
              {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sign Language toggle */}
            <button
              onClick={() => setShowSignLanguage(!showSignLanguage)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border-2 transition-all duration-300 ${
                showSignLanguage
                  ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                  : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
              }`}
            >
              SIGN LANG
            </button>

            {/* Subtitles toggle */}
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border-2 transition-all duration-300 ${
                showSubtitles
                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
              }`}
            >
              CC
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-all">
              {isFullscreen ? <FiMinimize className="w-6 h-6" /> : <FiMaximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
