import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
  {
    channelName: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    channelBanner: { type: String, default: '' },
    subscribers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Channel = mongoose.model('Channel', channelSchema);
