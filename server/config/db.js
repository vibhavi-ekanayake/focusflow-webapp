import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusflow';

  try {
    // Attempt standard connection with 3-second server selection timeout
    console.log(`[DB] Attempting connection to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[DB] Successfully connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB (${err.message}).`);
    console.log('[DB] Launching embedded MongoDB instance via mongodb-memory-server for seamless local execution...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`[DB] Connected to embedded in-memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      console.error('[DB] Failed to initialize embedded MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[DB] Runtime MongoDB connection error: ${err}`);
  });
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
