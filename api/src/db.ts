import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/snippets';

async function connectWithRetry(retries = 5, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1}...`);
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed. Retrying in ${delayMs}ms...`, err);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error('Failed to connect to MongoDB after several attempts.');
}

export async function setUpDB() {
  await connectWithRetry();
}
