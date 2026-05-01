const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('teacher'), upload.single('video'), uploadVideo);
router.get('/', protect, getVideos);
router.get('/teacher/my-videos', protect, authorize('teacher'), getMyVideos);
router.get('/stream/:id', protect, streamVideo);
router.get('/:id', protect, getVideo);
router.delete('/:id', protect, authorize('teacher'), deleteVideo);

// Caption routes
router.post('/:id/generate-captions', protect, authorize('teacher'), generateCaptions);
router.get('/:id/captions', protect, getVideoCaptions);
router.get('/:id/captions/vtt', protect, getVideoCaptionsVTT);
router.put('/:id/captions', protect, authorize('teacher'), updateVideoCaptions);

// Sign interpreter routes
router.put('/:id/sign-interpreter', protect, authorize('teacher'), updateSignInterpreter);
router.put('/:id/sign-interpreter/upload', protect, authorize('teacher'), upload.single('interpreter'), uploadSignInterpreter);
router.get('/:id/sign-interpreter/stream', protect, streamSignInterpreter);

module.exports = router;
