const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');
const CaptionService = require('../services/captionService');

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private (Teacher only)
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a video file' });
    }

    const { title, description, subtitles, signLanguageUrl, signLanguageInterpreter, tags } = req.body;

    const video = await Video.create({
      title,
      description: description || '',
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      subtitles: subtitles || '',
      signLanguageUrl: signLanguageUrl || '',
      signLanguageInterpreter: signLanguageInterpreter || '',
      teacher: req.user._id,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    // Auto-generate captions by default (disable with autoCaptions=false)
    const autoCaptions = String(req.body.autoCaptions ?? 'true').toLowerCase() !== 'false';
    if (autoCaptions) {
      try {
        const provider = req.body.captionProvider || process.env.CAPTION_PROVIDER || 'auto';
        const result = await CaptionService.generateCaptions(video.filePath, provider, subtitles || '');
        video.captions = result.captions;
        video.captionsGenerated = true;
        video.captionProvider = result.provider;
        await video.save();
      } catch (err) {
        console.warn('Auto caption generation failed, continuing upload:', err.message || err);
      }
    }

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

    // Delete interpreter file if it was stored as a local path
    if (video.signLanguageInterpreter && !/^https?:\/\//i.test(video.signLanguageInterpreter)) {
      if (fs.existsSync(video.signLanguageInterpreter)) {
        try {
          fs.unlinkSync(video.signLanguageInterpreter);
        } catch {
          // ignore cleanup errors
        }
      }
    }

    await video.deleteOne();

    res.status(200).json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate captions for video
// @route   POST /api/videos/:id/generate-captions
// @access  Private (Teacher only, own video)
const generateCaptions = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Ensure teacher owns the video
    if (video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to generate captions for this video' });
    }

    if (!fs.existsSync(video.filePath)) {
      return res.status(400).json({ success: false, message: 'Video file not found on disk' });
    }

    // Generate captions
    const provider = req.body.provider || 'auto';
    const result = await CaptionService.generateCaptions(video.filePath, provider, video.subtitles || '');

    // Update video with captions
    video.captions = result.captions;
    video.captionsGenerated = true;
    video.captionProvider = result.provider;
    await video.save();

    res.status(200).json({
      success: true,
      data: {
        videoId: video._id,
        captionsGenerated: true,
        captionCount: result.captions.length,
        captions: result.captions,
        provider: result.provider,
      },
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get captions for video
// @route   GET /api/videos/:id/captions
// @access  Private
const getVideoCaptions = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('captions captionsGenerated captionProvider');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        videoId: video._id,
        captions: video.captions || [],
        captionsGenerated: video.captionsGenerated || false,
        captionProvider: video.captionProvider || 'none',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get captions in WebVTT format
// @route   GET /api/videos/:id/captions/vtt
// @access  Private
const getVideoCaptionsVTT = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('captions title');

    if (!video || !video.captions || video.captions.length === 0) {
      return res.status(404).json({ success: false, message: 'No captions found for this video' });
    }

    const vtt = CaptionService.formatAsVTT(video.captions);

    res.set('Content-Type', 'text/vtt; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="captions-${video._id}.vtt"`);
    res.send(vtt);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update captions for video
// @route   PUT /api/videos/:id/captions
// @access  Private (Teacher only, own video)
const updateVideoCaptions = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Ensure teacher owns the video
    if (video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update captions for this video' });
    }

    const { captions } = req.body;

    if (!Array.isArray(captions)) {
      return res.status(400).json({ success: false, message: 'Captions must be an array' });
    }

    // Validate captions format
    const validCaptions = captions.every(
      c => typeof c.startTime === 'number' && 
           typeof c.endTime === 'number' && 
           typeof c.text === 'string'
    );

    if (!validCaptions) {
      return res.status(400).json({
        success: false,
        message: 'Each caption must have startTime, endTime, and text',
      });
    }

    video.captions = captions;
    video.captionsGenerated = true;
    video.captionProvider = 'manual';
    await video.save();

    res.status(200).json({
      success: true,
      data: {
        videoId: video._id,
        captionCount: captions.length,
        captions: video.captions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update sign language interpreter URL
// @route   PUT /api/videos/:id/sign-interpreter
// @access  Private (Teacher only, own video)
const updateSignInterpreter = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Ensure teacher owns the video
    if (video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this video' });
    }

    const { signLanguageInterpreter, signLanguageUrl } = req.body;

    if (signLanguageInterpreter) {
      video.signLanguageInterpreter = signLanguageInterpreter;
    }
    if (signLanguageUrl) {
      video.signLanguageUrl = signLanguageUrl;
    }

    await video.save();

    res.status(200).json({
      success: true,
      data: {
        videoId: video._id,
        signLanguageInterpreter: video.signLanguageInterpreter,
        signLanguageUrl: video.signLanguageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload sign language interpreter video for a lesson video
// @route   PUT /api/videos/:id/sign-interpreter/upload
// @access  Private (Teacher only, own video)
const uploadSignInterpreter = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (video.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this video' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an interpreter video file' });
    }

    // Best-effort cleanup of existing interpreter file if it was stored as a local path
    if (video.signLanguageInterpreter && !/^https?:\/\//i.test(video.signLanguageInterpreter)) {
      if (fs.existsSync(video.signLanguageInterpreter)) {
        try {
          fs.unlinkSync(video.signLanguageInterpreter);
        } catch {
          // ignore cleanup errors
        }
      }
    }

    video.signLanguageInterpreter = req.file.path;
    await video.save();

    res.status(200).json({
      success: true,
      data: {
        videoId: video._id,
        signLanguageInterpreter: video.signLanguageInterpreter,
        signLanguageUrl: video.signLanguageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stream sign language interpreter video (range-supported)
// @route   GET /api/videos/:id/sign-interpreter/stream
// @access  Private
const streamSignInterpreter = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('signLanguageInterpreter');
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const interpreterPath = video.signLanguageInterpreter;
    if (!interpreterPath) {
      return res.status(404).json({ success: false, message: 'No sign language interpreter video set' });
    }

    // If it's a URL, redirect to it (client can also use it directly)
    if (/^https?:\/\//i.test(interpreterPath)) {
      return res.redirect(interpreterPath);
    }

    if (!fs.existsSync(interpreterPath)) {
      return res.status(404).json({ success: false, message: 'Interpreter video file not found on disk' });
    }

    const stat = fs.statSync(interpreterPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(interpreterPath).toLowerCase();
    const contentType =
      ext === '.webm' ? 'video/webm' :
      ext === '.ogv' || ext === '.ogg' ? 'video/ogg' :
      ext === '.mov' ? 'video/quicktime' :
      ext === '.mkv' ? 'video/x-matroska' :
      'video/mp4';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(interpreterPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      };
      res.writeHead(200, head);
      fs.createReadStream(interpreterPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideo,
  streamVideo,
  getMyVideos,
  deleteVideo,
  generateCaptions,
  getVideoCaptions,
  getVideoCaptionsVTT,
  updateVideoCaptions,
  updateSignInterpreter,
  uploadSignInterpreter,
  streamSignInterpreter,
};
