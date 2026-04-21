const express = require('express');
const router = express.Router();
const {
  uploadVideo,
  getVideos,
  getVideo,
  streamVideo,
  getMyVideos,
  deleteVideo,
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

module.exports = router;
