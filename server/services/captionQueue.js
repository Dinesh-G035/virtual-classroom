const Video = require('../models/Video');
const CaptionService = require('./captionService');

const queue = [];
let activeJobs = 0;
let processingLoop = null;
const maxConcurrency = Number(process.env.CAPTION_QUEUE_CONCURRENCY || 3);

const enqueueCaptionProcessing = async (videoId) => {
  if (!videoId) return;

  const video = await Video.findById(videoId);
  if (!video) return;

  if (['queued', 'processing'].includes(video.processingStatus)) {
    return;
  }

  if (video.processingStatus === 'completed' && video.captionsGenerated) {
    return;
  }

  video.processingStatus = 'queued';
  video.processingError = '';
  await video.save();

  queue.push(videoId);
  void processQueue();
};

const processQueue = async () => {
  if (processingLoop) {
    return processingLoop;
  }

  processingLoop = (async () => {
    while (queue.length > 0 && activeJobs < maxConcurrency) {
      const videoId = queue.shift();
      if (!videoId) continue;

      activeJobs += 1;
      void processVideoCaptionJob(videoId).finally(() => {
        activeJobs -= 1;
        if (queue.length > 0) {
          void processQueue();
        }
      });
    }
  })();

  try {
    await processingLoop;
  } finally {
    processingLoop = null;
  }
};

const processVideoCaptionJob = async (videoId) => {
  const video = await Video.findById(videoId);
  if (!video) return;

  video.processingStatus = 'processing';
  video.processingStartedAt = new Date();
  video.processingCompletedAt = null;
  video.processingError = '';
  await video.save();

  try {
    const result = await CaptionService.generateCaptions(
      video.filePath,
      video.captionProvider || 'auto',
      video.subtitles || ''
    );

    video.captions = result.captions;
    video.captionsGenerated = true;
    video.captionProvider = result.provider;
    video.processingStatus = 'completed';
    video.processingCompletedAt = new Date();
    video.processingError = '';
    await video.save();
  } catch (error) {
    console.error('Background caption generation failed:', error.message || error);
    video.processingStatus = 'failed';
    video.processingCompletedAt = new Date();
    video.processingError = error.message || 'Caption generation failed';
    await video.save();
  }
};

module.exports = {
  enqueueCaptionProcessing,
  processQueue,
  processVideoCaptionJob,
};
