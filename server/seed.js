const User = require('./models/User');
const Video = require('./models/Video');
const Feedback = require('./models/Feedback');
const AIResponse = require('./models/AIResponse');
const { analyzeSentiment } = require('./services/sentimentService');
const { generateSmartReply } = require('./services/smartReplyService');

const seedData = async (shouldExit = true) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    await Feedback.deleteMany({});
    await AIResponse.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const teacher1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@teacher.com',
      password: 'password123',
      role: 'teacher',
    });

    const teacher2 = await User.create({
      name: 'Prof. Rajesh Kumar',
      email: 'rajesh@teacher.com',
      password: 'password123',
      role: 'teacher',
    });

    const student1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@student.com',
      password: 'password123',
      role: 'student',
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@student.com',
      password: 'password123',
      role: 'student',
    });

    const student3 = await User.create({
      name: 'Dinesh Verma',
      email: 'dinesh@student.com',
      password: 'password123',
      role: 'student',
    });

    const student4 = await User.create({
      name: 'Ananya Gupta',
      email: 'ananya@student.com',
      password: 'password123',
      role: 'student',
    });

    console.log('👥 Created users');

    // Create videos (no actual video files — just metadata for demo)
    const video1 = await Video.create({
      title: 'Introduction to Machine Learning',
      description: 'A comprehensive introduction to ML concepts, algorithms, and real-world applications. Covers supervised, unsupervised, and reinforcement learning.',
      filePath: 'uploads/videos/sample1.mp4',
      fileName: 'sample1.mp4',
      fileSize: 52428800,
      mimeType: 'video/mp4',
      subtitles: 'This lecture covers the fundamentals of machine learning...',
      teacher: teacher1._id,
      duration: 2400,
      views: 156,
      tags: ['machine learning', 'AI', 'beginner', 'algorithms'],
    });

    const video2 = await Video.create({
      title: 'Data Structures: Trees and Graphs',
      description: 'Deep dive into tree and graph data structures with implementation examples in Python and Java.',
      filePath: 'uploads/videos/sample2.mp4',
      fileName: 'sample2.mp4',
      fileSize: 41943040,
      mimeType: 'video/mp4',
      subtitles: 'Today we will explore tree and graph data structures...',
      teacher: teacher1._id,
      duration: 1800,
      views: 89,
      tags: ['data structures', 'trees', 'graphs', 'algorithms'],
    });

    const video3 = await Video.create({
      title: 'Web Development with React.js',
      description: 'Learn modern web development using React.js, hooks, state management, and component architecture.',
      filePath: 'uploads/videos/sample3.mp4',
      fileName: 'sample3.mp4',
      fileSize: 62914560,
      mimeType: 'video/mp4',
      subtitles: 'Welcome to the React.js web development course...',
      teacher: teacher2._id,
      duration: 3000,
      views: 234,
      tags: ['react', 'web development', 'javascript', 'frontend'],
    });

    const video4 = await Video.create({
      title: 'Database Design Principles',
      description: 'Learn normalization, ER diagrams, indexing strategies, and query optimization techniques.',
      filePath: 'uploads/videos/sample4.mp4',
      fileName: 'sample4.mp4',
      fileSize: 36700160,
      mimeType: 'video/mp4',
      subtitles: 'In this lecture, we will cover database design principles...',
      teacher: teacher2._id,
      duration: 2100,
      views: 67,
      tags: ['database', 'SQL', 'MongoDB', 'design'],
    });

    console.log('🎥 Created videos');

    // Create feedback entries
    const feedbackData = [
      { student: student1._id, video: video1._id, comment: 'The video was too fast, I could not keep up with the explanation of gradient descent.', rating: 2, emoji: '😞' },
      { student: student2._id, video: video1._id, comment: 'Excellent explanation! Very clear and easy to understand. Loved the examples.', rating: 5, emoji: '😊' },
      { student: student3._id, video: video1._id, comment: 'Good content but the audio quality was poor. Could not hear properly in some parts.', rating: 3, emoji: '😐' },
      { student: student4._id, video: video1._id, comment: 'Amazing lecture! The practical demonstrations were very helpful.', rating: 5, emoji: '🎉' },

      { student: student1._id, video: video2._id, comment: 'Great lecture on trees! Could use more examples on graph traversal though.', rating: 4, emoji: '👍' },
      { student: student2._id, video: video2._id, comment: 'The topic was very confusing and hard to follow. Need simpler explanations.', rating: 2, emoji: '😞' },
      { student: student3._id, video: video2._id, comment: 'Perfect pacing and clear subtitles. Thank you for the accessibility features!', rating: 5, emoji: '❤️' },

      { student: student1._id, video: video3._id, comment: 'Loved the React hooks explanation! Very engaging and interactive session.', rating: 5, emoji: '🎉' },
      { student: student2._id, video: video3._id, comment: 'The lecture was too long and boring towards the end. Please make it shorter.', rating: 2, emoji: '😞' },
      { student: student3._id, video: video3._id, comment: 'Good overall but the video quality was blurry in some sections.', rating: 3, emoji: '😐' },
      { student: student4._id, video: video3._id, comment: 'Need more practical demo and hands-on coding examples please.', rating: 3, emoji: '👍' },

      { student: student1._id, video: video4._id, comment: 'Informative but the speed was too slow. Can you please pick up the pace?', rating: 3, emoji: '😐' },
      { student: student2._id, video: video4._id, comment: 'Excellent database design content. The ER diagram explanation was perfect!', rating: 5, emoji: '😊' },
    ];

    for (const fd of feedbackData) {
      const feedback = await Feedback.create(fd);
      const sentimentResult = analyzeSentiment(fd.comment);
      const smartReply = generateSmartReply(fd.comment, sentimentResult.sentiment);

      await AIResponse.create({
        feedback: feedback._id,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.comparative,
        reply: smartReply,
        keywords: sentimentResult.keywords,
      });
    }

    console.log('💬 Created feedback with AI responses');
    console.log('');
    console.log('✅ Seed complete!');
    
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    if (shouldExit) process.exit(1);
  }
};

// If run directly
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('./config/db');
  connectDB().then(() => seedData(true));
}

module.exports = seedData;
