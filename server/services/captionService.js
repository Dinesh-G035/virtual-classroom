const fs = require('fs');
const path = require('path');

/**
 * Caption Service - Handles auto-captions
 * Sources: provided subtitle text (preferred), optional Whisper transcription, or mock/demo captions.
 */

class CaptionService {
  static resolveProvider(provider) {
    if (!provider || provider === 'auto') {
      return process.env.OPENAI_API_KEY ? 'openai' : 'mock';
    }
    return provider;
  }

  static captionsFromPlainText(text) {
    const cleaned = String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    if (!cleaned) return [];

    // If it looks like SRT, prefer that.
    if (cleaned.includes('-->')) {
      try {
        return this.parseSRT(cleaned);
      } catch {
        // fall back to plain-text parsing
      }
    }

    const sentences = cleaned
      .split(/\n+/)
      .flatMap((line) => line.split(/(?<=[.!?])\s+/))
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks = [];
    for (const sentence of sentences) {
      const words = sentence.split(/\s+/).filter(Boolean);
      let current = [];
      let currentLen = 0;

      for (const word of words) {
        const nextLen = currentLen + (current.length ? 1 : 0) + word.length;
        // target ~42–56 chars per line-ish, but keep words together
        if (current.length >= 6 && nextLen >= 56) {
          chunks.push(current.join(' '));
          current = [word];
          currentLen = word.length;
        } else {
          current.push(word);
          currentLen = nextLen;
        }
      }

      if (current.length) chunks.push(current.join(' '));
    }

    // Time captions sequentially using a simple reading-speed heuristic.
    const captions = [];
    let t = 0;
    for (const chunk of chunks) {
      const wordCount = chunk.split(/\s+/).filter(Boolean).length;
      const seconds = Math.min(6, Math.max(1.5, wordCount / 2.6)); // ~156 wpm
      const startTime = Number(t.toFixed(3));
      const endTime = Number((t + seconds).toFixed(3));
      captions.push({ startTime, endTime, text: chunk, speaker: 'Speaker' });
      t = endTime;
    }

    return captions;
  }

  /**
   * Generate captions from video file
   * @param {string} videoPath - Path to video file
   * @param {string} provider - Caption provider ('openai', 'google', 'mock')
   * @returns {Promise<{captions: Array, provider: string}>} Caption payload
   */
  static async generateCaptions(videoPath, provider = 'auto', subtitlesText = '') {
    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      const resolvedProvider = this.resolveProvider(provider);

      // If subtitles were provided on upload, prefer them as the source of captions.
      const fromText = this.captionsFromPlainText(subtitlesText);
      if (fromText.length > 0) {
        return { captions: fromText, provider: 'manual' };
      }

      switch (resolvedProvider) {
        case 'openai':
          return { captions: await this.generateWithOpenAI(videoPath), provider: 'openai' };
        case 'google':
          return { captions: await this.generateWithGoogle(videoPath), provider: 'google' };
        case 'mock':
          return { captions: await this.generateMockCaptions(videoPath), provider: 'mock' };
        default:
          return { captions: await this.generateMockCaptions(videoPath), provider: 'mock' };
      }
    } catch (error) {
      console.error('Caption generation error:', error);
      throw error;
    }
  }

  /**
   * Generate captions using OpenAI Whisper API
   * Requires OPENAI_API_KEY in environment
   */
  static async generateWithOpenAI(videoPath) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('OPENAI_API_KEY not found, falling back to mock captions');
        return this.generateMockCaptions(videoPath);
      }

      const fileBlob = await fs.openAsBlob(videoPath);
      const form = new FormData();
      form.append('file', fileBlob, path.basename(videoPath));
      form.append('model', 'whisper-1');
      form.append('response_format', 'verbose_json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          payload?.error?.message ||
          (typeof payload === 'string' ? payload : null) ||
          `OpenAI Whisper request failed (${response.status})`;
        throw new Error(message);
      }

      const segments = Array.isArray(payload?.segments) ? payload.segments : [];
      if (segments.length > 0) {
        const captions = segments
          .map((s) => ({
            startTime: typeof s.start === 'number' ? s.start : Number(s.start || 0),
            endTime: typeof s.end === 'number' ? s.end : Number(s.end || 0),
            text: String(s.text || '').trim(),
            speaker: 'Speaker',
          }))
          .filter((c) => Number.isFinite(c.startTime) && Number.isFinite(c.endTime) && c.endTime > c.startTime && c.text);

        if (captions.length > 0) return captions;
      }

      // Fallback: if segments are missing, build approximate timing from the transcript text.
      if (payload?.text) {
        return this.captionsFromPlainText(payload.text);
      }

      console.warn('OpenAI Whisper returned no transcript segments, falling back to mock captions');
      return this.generateMockCaptions(videoPath);
    } catch (error) {
      console.error('OpenAI Whisper error:', error?.message || error);
      return this.generateMockCaptions(videoPath);
    }
  }

  /**
   * Generate captions using Google Speech-to-Text API
   * Requires Google Cloud credentials
   */
  static async generateWithGoogle(videoPath) {
    try {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!credentialsPath || !fs.existsSync(credentialsPath)) {
        console.warn('Google credentials not found, falling back to mock captions');
        return this.generateMockCaptions(videoPath);
      }

      // Google Speech-to-Text implementation would go here
      // const speech = require('@google-cloud/speech');
      // const client = new speech.SpeechClient();

      console.log('Google Speech-to-Text integration requires npm install @google-cloud/speech');
      return this.generateMockCaptions(videoPath);
    } catch (error) {
      console.error('Google API error:', error);
      return this.generateMockCaptions(videoPath);
    }
  }

  /**
   * Generate mock captions for testing/demo purposes
   * Creates realistic caption data with proper timing
   */
  static async generateMockCaptions(videoPath) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockCaptions = [
      {
        startTime: 0,
        endTime: 3,
        text: 'Welcome to this educational video presentation.',
        speaker: 'Instructor'
      },
      {
        startTime: 3,
        endTime: 7,
        text: 'Today we will explore the fundamental concepts and key principles.',
        speaker: 'Instructor'
      },
      {
        startTime: 7,
        endTime: 12,
        text: 'Let\'s start with the first important concept that forms the foundation.',
        speaker: 'Instructor'
      },
      {
        startTime: 12,
        endTime: 16,
        text: 'This concept is crucial for understanding the broader picture.',
        speaker: 'Instructor'
      },
      {
        startTime: 16,
        endTime: 20,
        text: 'As we move forward, keep this concept in mind.',
        speaker: 'Instructor'
      },
      {
        startTime: 20,
        endTime: 25,
        text: 'Now let\'s examine some practical examples and real-world applications.',
        speaker: 'Instructor'
      },
      {
        startTime: 25,
        endTime: 30,
        text: 'Here is an example demonstrating how this works in practice.',
        speaker: 'Instructor'
      },
      {
        startTime: 30,
        endTime: 35,
        text: 'As you can see, the results are quite significant.',
        speaker: 'Instructor'
      },
      {
        startTime: 35,
        endTime: 40,
        text: 'Let\'s discuss the implications and potential challenges.',
        speaker: 'Instructor'
      },
      {
        startTime: 40,
        endTime: 45,
        text: 'It\'s important to be aware of these considerations.',
        speaker: 'Instructor'
      },
    ];

    return mockCaptions;
  }

  /**
   * Format captions for VTT (WebVTT) format
   * @param {Array} captions - Array of caption objects
   * @returns {string} VTT formatted string
   */
  static formatAsVTT(captions) {
    let vtt = 'WEBVTT\n\n';

    captions.forEach(caption => {
      const startTime = this.secondsToTimeFormat(caption.startTime);
      const endTime = this.secondsToTimeFormat(caption.endTime);
      vtt += `${startTime} --> ${endTime}\n`;
      vtt += `${caption.text}\n\n`;
    });

    return vtt;
  }

  /**
   * Convert seconds to HH:MM:SS.mmm format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  static secondsToTimeFormat(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  /**
   * Parse captions from SRT format
   * @param {string} srtContent - SRT format content
   * @returns {Array} Array of caption objects
   */
  static parseSRT(srtContent) {
    const captions = [];
    const blocks = srtContent.split('\n\n').filter(block => block.trim());

    blocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const timeRange = lines[1];
        const [startStr, endStr] = timeRange.split(' --> ');

        captions.push({
          startTime: this.timeFormatToSeconds(startStr.trim()),
          endTime: this.timeFormatToSeconds(endStr.trim()),
          text: lines.slice(2).join('\n'),
          speaker: 'Speaker'
        });
      }
    });

    return captions;
  }

  /**
   * Convert time format (HH:MM:SS,mmm or HH:MM:SS.mmm) to seconds
   * @param {string} timeStr - Time string
   * @returns {number} Time in seconds
   */
  static timeFormatToSeconds(timeStr) {
    const parts = timeStr.replace(',', '.').split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const secondsAndMs = parseFloat(parts[2]) || 0;

    return hours * 3600 + minutes * 60 + secondsAndMs;
  }

  /**
   * Find caption at specific time
   * @param {Array} captions - Array of caption objects
   * @param {number} currentTime - Current time in seconds
   * @returns {string|null} Caption text or null if not found
   */
  static getCaptionAtTime(captions, currentTime) {
    if (!Array.isArray(captions)) return null;

    const caption = captions.find(
      c => currentTime >= c.startTime && currentTime < c.endTime
    );

    return caption ? caption.text : null;
  }

  /**
   * Get all captions for a time range
   * @param {Array} captions - Array of caption objects
   * @param {number} startTime - Start time in seconds
   * @param {number} endTime - End time in seconds
   * @returns {Array} Captions within the range
   */
  static getCaptionsInRange(captions, startTime, endTime) {
    if (!Array.isArray(captions)) return [];

    return captions.filter(
      c => (c.startTime >= startTime && c.startTime < endTime) ||
           (c.endTime > startTime && c.endTime <= endTime) ||
           (c.startTime <= startTime && c.endTime >= endTime)
    );
  }
}

module.exports = CaptionService;
