const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getVideoFeedback,
  getMyFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('student'), submitFeedback);
router.get('/video/:videoId', protect, getVideoFeedback);
router.get('/my-feedback', protect, authorize('student'), getMyFeedback);

module.exports = router;
