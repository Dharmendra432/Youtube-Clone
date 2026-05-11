import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Channel } from '../models/Channel.js';
import { Video } from '../models/Video.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  authRequired,
  [
    body('channelName').trim().notEmpty().isLength({ max: 100 }),
    body('description').optional().isString(),
    body('channelBanner').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const existing = await Channel.findOne({
      owner: req.userId,
      channelName: new RegExp(`^${req.body.channelName.trim()}$`, 'i'),
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have a channel with this name' });
    }
    const channel = await Channel.create({
      channelName: req.body.channelName.trim(),
      owner: req.userId,
      description: req.body.description ?? '',
      channelBanner:
        req.body.channelBanner ||
        'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=200&fit=crop',
    });
    res.status(201).json(formatChannel(channel));
  }
);

router.get('/mine', authRequired, async (req, res) => {
  const channels = await Channel.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json(channels.map(formatChannel));
});

router.get('/:id', async (req, res) => {
  const channel = await Channel.findById(req.params.id).populate('owner', 'username avatar');
  if (!channel) return res.status(404).json({ message: 'Channel not found' });
  const videos = await Video.find({ channel: channel._id })
    .sort({ createdAt: -1 })
    .populate('uploader', 'username avatar');
  res.json({
    ...formatChannel(channel, true),
    ownerUser: channel.owner
      ? { id: channel.owner._id, username: channel.owner.username, avatar: channel.owner.avatar }
      : null,
    videos: videos.map((v) => ({
      id: v._id,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      videoUrl: v.videoUrl,
      category: v.category,
      views: v.views,
      duration: v.duration,
      uploadDate: v.createdAt,
      uploader: v.uploader,
    })),
  });
});

router.put(
  '/:id',
  authRequired,
  [
    body('channelName').optional().trim().notEmpty(),
    body('description').optional().isString(),
    body('channelBanner').optional().isString(),
  ],
  async (req, res) => {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    if (channel.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    if (req.body.channelName) channel.channelName = req.body.channelName.trim();
    if (req.body.description !== undefined) channel.description = req.body.description;
    if (req.body.channelBanner !== undefined) channel.channelBanner = req.body.channelBanner;
    await channel.save();
    res.json(formatChannel(channel));
  }
);

function formatChannel(c, withOwner = false) {
  const base = {
    id: c._id,
    channelName: c.channelName,
    description: c.description,
    channelBanner: c.channelBanner,
    subscribers: c.subscribers,
    owner: c.owner?._id ?? c.owner,
  };
  if (withOwner && c.owner && typeof c.owner === 'object' && c.owner.username) {
    base.ownerUsername = c.owner.username;
  }
  return base;
}

export default router;
