const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

let mongod = null;

const connectDB = async () => {
  try {
    let dbUrl = process.env.MONGODB_URI;

    // Fallback to memory server if no URI provided (good for demo/testing without local MongoDB)
    if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
      try {
        // Try local first if URI is provided
        if (dbUrl) {
          const conn = await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 2000 });
          console.log(`✅ MongoDB Connected (Local): ${conn.connection.host}`);
          return;
        }
      } catch (err) {
        console.log('⚠️ Local MongoDB not found, starting In-Memory MongoDB...');
      }

      // Start memory server
      const downloadDir =
        process.env.MONGOMS_DOWNLOAD_DIR || path.join(__dirname, '..', '.cache', 'mongodb-binaries');

      // Ensure cache dir is writable (some environments block user-home cache dirs)
      fs.mkdirSync(downloadDir, { recursive: true });

      mongod = await MongoMemoryServer.create({
        binary: { downloadDir },
      });
      dbUrl = mongod.getUri();
      console.log('🚀 In-Memory MongoDB Started');
    }

    const conn = await mongoose.connect(dbUrl);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    if (mongod) {
      console.log(`ℹ️  Note: Data will be lost when the server stops (In-Memory mode)`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
