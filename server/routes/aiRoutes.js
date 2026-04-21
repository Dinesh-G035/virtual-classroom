const express = require('express');
const router = express.Router();
const { getVideoInsights, getTeacherSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/insights/:videoId', protect, authorize('teacher'), getVideoInsights);
router.get('/teacher-summary', protect, authorize('teacher'), getTeacherSummary);

module.exports = router;
