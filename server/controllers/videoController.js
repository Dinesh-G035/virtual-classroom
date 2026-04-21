const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private (Teacher only)
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a video file' });
    }

    const { title, description, subtitles, signLanguageUrl, tags } = req.body;

    const video = await Video.create({
      title,
      description: description || '',
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      subtitles: subtitles || '',
      signLanguageUrl: signLanguageUrl || '',
      teacher: req.user._id,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    await video.populate('teacher', 'name email');

    res.status(201).json({ success: true, data: video });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .populate('teacher', 'name email avatar')
      .populate('feedbackCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('teacher', 'name email avatar');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stream video
// @route   GET /api/videos/stream/:id
// @access  Private
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const videoPath = video.filePath;

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ success: false, message: 'Video file not found on disk' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': video.mimeType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher's own videos
// @route   GET /api/videos/teacher/my-videos
// @access  Private (Teacher only)
const getMyVideos = async (req, res) => {
  try {
    const videos = await Video.find({ teacher: req.user._id })
      .populate('feedbackCount')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Teacher only, own video)
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Ensure teacher owns the video
    if (video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this video' });
    }

    // Delete file from disk
    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    await video.deleteOne();

    res.status(200).json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadVideo, getVideos, getVideo, streamVideo, getMyVideos, deleteVideo };
