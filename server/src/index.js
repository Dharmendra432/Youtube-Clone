import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import { Video } from './models/Video.js';

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/videos', videoRoutes);

app.get('/api/meta/categories', async (_req, res) => {
  const cats = await Video.distinct('category');
  res.json(['All', ...cats.sort((a, b) => a.localeCompare(b))]);
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment');
  process.exit(1);
}

await connectDB(mongoUri);

try {
  const db = mongoose.connection.db;
  const cleanupTargets = [
    { collection: 'comments', index: 'commentId_1' },
    { collection: 'channels', index: 'channelId_1' },
  ];

  for (const { collection: collectionName, index } of cleanupTargets) {
    try {
      const collection = db.collection(collectionName);
      const hasIndex = await collection.indexExists(index);
      if (hasIndex) {
        await collection.dropIndex(index);
        console.log(`Dropped stale ${collectionName}.${index} index`);
      }
    } catch (innerError) {
      if (innerError.codeName && innerError.codeName !== 'NamespaceNotFound') {
        console.error(`Index cleanup error for ${collectionName}.${index}:`, innerError.message);
      }
    }
  }
} catch (error) {
  console.error('Index cleanup failed:', error.message);
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
