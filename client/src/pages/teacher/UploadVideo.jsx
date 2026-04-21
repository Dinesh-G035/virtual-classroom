import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { FiUploadCloud, FiX, FiFile, FiTag, FiAlignLeft, FiType } from 'react-icons/fi';

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subtitles: '',
    tags: '',
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a valid video file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a video file');
      return;
    }
    if (!formData.title.trim()) {
      toast.warning('Please enter a title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const data = new FormData();
      data.append('video', file);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subtitles', formData.subtitles);
      data.append('tags', formData.tags);

      // Simulate progress since axios onUploadProgress needs special config
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      await videoAPI.upload(data);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Video uploaded successfully! 🎉');
      setTimeout(() => navigate('/teacher/my-videos'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <h1 className="section-title">
        <span className="gradient-text">Upload</span> New Video
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-primary-500 bg-primary-500/5 shadow-neon'
              : file
              ? 'border-accent-green/50 bg-accent-green/5'
              : 'border-surface-600/50 hover:border-primary-500/30 hover:bg-surface-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file ? (
            <div className="animate-scale-in">
              <FiFile className="w-12 h-12 text-accent-green mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-surface-400 mt-1">{formatFileSize(file.size)}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-3 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <FiX className="w-3 h-3 inline mr-1" />
                Remove
              </button>
            </div>
          ) : (
            <>
              <FiUploadCloud className={`w-14 h-14 mx-auto mb-4 ${dragOver ? 'text-primary-400 animate-bounce-subtle' : 'text-surface-500'}`} />
              <p className="text-sm font-medium text-white">
                {dragOver ? 'Drop your video here!' : 'Drag & drop your video here'}
              </p>
              <p className="text-xs text-surface-400 mt-2">or click to browse • MP4, WebM, OGG • Max 500MB</p>
            </>
          )}
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="glass-card p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white">Uploading...</p>
              <p className="text-sm text-primary-400 font-mono">{Math.round(uploadProgress)}%</p>
            </div>
            <div className="w-full h-2 bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-violet rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="input-label" htmlFor="upload-title">
            <FiType className="inline w-4 h-4 mr-1" />
            Video Title *
          </label>
          <input
            id="upload-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Introduction to Machine Learning"
          />
        </div>

        {/* Description */}
        <div>
          <label className="input-label" htmlFor="upload-desc">
            <FiAlignLeft className="inline w-4 h-4 mr-1" />
            Description
          </label>
          <textarea
            id="upload-desc"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field resize-none h-28"
            placeholder="Brief description of the lecture content..."
          />
        </div>

        {/* Subtitles */}
        <div>
          <label className="input-label" htmlFor="upload-subs">
            📄 Subtitles / Captions
          </label>
          <textarea
            id="upload-subs"
            name="subtitles"
            value={formData.subtitles}
            onChange={handleChange}
            className="input-field resize-none h-20"
            placeholder="Add subtitle text for accessibility..."
          />
          <p className="text-xs text-surface-500 mt-1">Adding subtitles makes your content accessible to all students</p>
        </div>

        {/* Tags */}
        <div>
          <label className="input-label" htmlFor="upload-tags">
            <FiTag className="inline w-4 h-4 mr-1" />
            Tags (comma separated)
          </label>
          <input
            id="upload-tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., machine learning, AI, beginner"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
        >
          <FiUploadCloud className="w-5 h-5" />
          Upload Video
        </button>
      </form>
    </div>
  );
};

export default UploadVideo;
