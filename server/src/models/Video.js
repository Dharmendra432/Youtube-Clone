import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnailUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    category: { type: String, required: true, trim: true, index: true },
    views: { type: Number, default: 0 },
    duration: { type: String, default: '0:00' },
    isLive: { type: Boolean, default: false },
    liveWatchers: { type: Number, default: 0 },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Video = mongoose.model('Video', videoSchema);
