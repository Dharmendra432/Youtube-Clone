import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Channel } from './models/Channel.js';
import { Video } from './models/Video.js';
import { Comment } from './models/Comment.js';

const SAMPLE_VIDEO =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const categories = ['Music', 'Gaming', 'News', 'Sports', 'Tech', 'Education'];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected, clearing collections...');
  await Promise.all([Comment.deleteMany({}), Video.deleteMany({}), Channel.deleteMany({}), User.deleteMany({})]);

  const hash = await bcrypt.hash('password123', 10);
  const john = await User.create({
    username: 'JohnDoe',
    email: 'john@example.com',
    password: hash,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
  });
  const jane = await User.create({
    username: 'JaneSmith',
    email: 'jane@example.com',
    password: hash,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JaneSmith',
  });

  const ch1 = await Channel.create({
    channelName: 'Code with John',
    owner: john._id,
    description: 'Coding tutorials and tech reviews by John Doe.',
    channelBanner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=200&fit=crop',
    subscribers: 5200,
  });

  const ch2 = await Channel.create({
    channelName: 'Music Lounge',
    owner: jane._id,
    description: 'Relaxing music and mixes.',
    channelBanner: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=200&fit=crop',
    subscribers: 12000,
  });

  const videosData = [
    {
      title: 'Learn React in 30 Minutes',
      description: 'A quick tutorial to get started with React.',
      category: 'Tech',
      duration: '24:27',
      thumb: 'https://i.ytimg.com/vi/Rh3tobg7hEo/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=6pIzkHNZ_B8',
    },
    {
      title: 'Epic Gaming Highlights',
      description: 'Best moments from this week.',
      category: 'Gaming',
      duration: '12:05',
      thumb: 'https://miro.medium.com/v2/resize:fit:1400/0*udpY1YEJrReRYguJ.jpg',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      title: 'Morning News Roundup',
      description: 'Top stories in five minutes.',
      category: 'News',
      duration: '5:30',
      thumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4TJv9WjFpk6yOX3phuXuatjNbrzW6kBfcXA&s',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      title: 'Championship Finals Recap',
      description: 'Sports highlights and analysis.',
      category: 'Sports',
      duration: '18:44',
      thumb: 'https://m.media-amazon.com/images/I/61ACfB25HVL._UF1000,1000_QL80_.jpg',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      title: 'Lo-Fi Study Beats',
      description: 'Focus music for coding.',
      category: 'Music',
      duration: '1:02:00',
      thumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxbYAsFJ4HyVMOHD8Vp06iEfcHbfI7FUeiDA&s',
      url :'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      title: 'MongoDB Crash Course',
      description: 'Databases explained simply.',
      category: 'Education',
      duration: '35:12',
      thumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdPlMePxtqpJg9-hCOkNUhZCKmCF2JtAQYVw&s',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      title: 'Live Coding Session',
      description: 'Building an API from scratch.',
      category: 'Tech',
      duration: '45:00',
      isLive: true,
      liveWatchers: 2,
      thumb: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdPlMePxtqpJg9-hCOkNUhZCKmCF2JtAQYVw&s',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
  ];

  const channelFor = (i) => (i % 2 === 0 ? ch1 : ch2);
  const uploaderFor = (i) => (i % 2 === 0 ? john._id : jane._id);

  const createdVideos = [];
  for (let i = 0; i < videosData.length; i++) {
    const d = videosData[i];
    const v = await Video.create({
      title: d.title,
      description: d.description,
      thumbnailUrl: d.thumb,
      videoUrl: d.url,
      category: d.category,
      views: 1000 * (i + 1) * 15,
      duration: d.duration,
      isLive: !!d.isLive,
      liveWatchers: d.liveWatchers ?? 0,
      channel: channelFor(i)._id,
      uploader: uploaderFor(i),
    });
    createdVideos.push(v);
  }

  const v0 = createdVideos[0];
  await Comment.create({
    video: v0._id,
    user: jane._id,
    text: 'Great video! Very helpful.',
  });

  console.log('Seed complete.');
  console.log('Login: john@example.com / password123');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
