import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Video } from '../models/Video.js';
import { Channel } from '../models/Channel.js';
import { Comment } from '../models/Comment.js';
import { authRequired, attachUser } from '../middleware/auth.js';

const router = Router();

const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const populateVideo = [
  { path: 'channel', select: 'channelName owner description channelBanner subscribers' },
  { path: 'uploader', select: 'username avatar' },
];

router.get(
  '/',
  attachUser,
  asyncHandler(async (req, res) => {
  const { search = '', category = '' } = req.query;
  const filter = {};
  if (search && String(search).trim()) {
    filter.title = { $regex: String(search).trim(), $options: 'i' };
  }
  if (category && String(category).trim() && String(category).toLowerCase() !== 'all') {
    filter.category = { $regex: `^${String(category).trim()}$`, $options: 'i' };
  }
  const videos = await Video.find(filter).sort({ createdAt: -1 }).populate(populateVideo);
  const userId = req.userId;
  const list = videos.map((v) => formatVideo(v, userId));
  res.json(list);
  })
);

router.post(
  '/',
  authRequired,
  [
    body('channelId').notEmpty(),
    body('title').trim().notEmpty(),
    body('videoUrl').trim().notEmpty(),
    body('thumbnailUrl').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('description').optional().isString(),
    body('duration').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const channel = await Channel.findById(req.body.channelId);
    if (!channel || channel.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only upload to your own channel' });
    }
    const video = await Video.create({
      title: req.body.title,
      description: req.body.description ?? '',
      videoUrl: req.body.videoUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      category: req.body.category,
      duration: req.body.duration ?? '0:00',
      channel: channel._id,
      uploader: req.userId,
    });
    await video.populate(populateVideo);
    res.status(201).json(formatVideo(video, req.userId, true));
  })
);

router.get(
  '/:videoId/comments',
  asyncHandler(async (req, res) => {
  const comments = await Comment.find({ video: req.params.videoId })
    .sort({ createdAt: -1 })
    .populate('user', 'username avatar');
  res.json(
    comments.map((c) => ({
      id: c._id,
      userId: c.user._id,
      username: c.user.username,
      avatar: c.user.avatar,
      text: c.text,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
  );
  })
);

router.post(
  '/:videoId/comments',
  authRequired,
  [body('text').trim().notEmpty().isLength({ max: 2000 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const comment = await Comment.create({
      video: video._id,
      user: req.userId,
      text: req.body.text,
    });
    await comment.populate('user', 'username avatar');
    res.status(201).json({
      id: comment._id,
      userId: comment.user._id,
      username: comment.user.username,
      avatar: comment.user.avatar,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  })
);

router.put(
  '/:videoId/comments/:commentId',
  authRequired,
  [body('text').trim().notEmpty().isLength({ max: 2000 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      video: req.params.videoId,
    });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    comment.text = req.body.text;
    await comment.save();
    await comment.populate('user', 'username avatar');
    res.json({
      id: comment._id,
      userId: comment.user._id,
      username: comment.user.username,
      avatar: comment.user.avatar,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  })
);

router.delete(
  '/:videoId/comments/:commentId',
  authRequired,
  asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({
    _id: req.params.commentId,
    video: req.params.videoId,
  });
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.user.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  await comment.deleteOne();
  res.json({ message: 'Deleted' });
  })
);

router.post(
  '/:id/reaction',
  authRequired,
  asyncHandler(async (req, res) => {
  const { type } = req.body;
  if (!['like', 'dislike', 'none'].includes(type)) {
    return res.status(400).json({ message: 'type must be like, dislike, or none' });
  }
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  const uid = req.userId;
  video.likedBy = video.likedBy.filter((id) => id.toString() !== uid);
  video.dislikedBy = video.dislikedBy.filter((id) => id.toString() !== uid);
  if (type === 'like') video.likedBy.push(uid);
  if (type === 'dislike') video.dislikedBy.push(uid);
  await video.save({ validateBeforeSave: false });
  await video.populate(populateVideo);
  res.json(formatVideo(video, uid, true));
  })
);

router.get(
  '/:id',
  attachUser,
  asyncHandler(async (req, res) => {
  // Increment views without triggering schema validation.
  await Video.updateOne({ _id: req.params.id }, { $inc: { views: 1 } }).catch(() => {});

  const video = await Video.findById(req.params.id).populate(populateVideo);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  res.json(formatVideo(video, req.userId, true));
  })
);

router.put(
  '/:id',
  authRequired,
  asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id).populate('channel');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.uploader.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { title, description, videoUrl, thumbnailUrl, category, duration } = req.body;
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
    if (category !== undefined) video.category = category;
    if (duration !== undefined) video.duration = duration;
    await video.save({ validateBeforeSave: false });
    await video.populate(populateVideo);
    res.json(formatVideo(video, req.userId, true));
  })
);

router.delete(
  '/:id',
  authRequired,
  asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  if (video.uploader.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  await Comment.deleteMany({ video: video._id });
  await video.deleteOne();
  res.json({ message: 'Deleted' });
  })
);

function formatVideo(v, userId, detail = false) {
  const liked = userId && v.likedBy?.some((id) => id.toString() === userId);
  const disliked = userId && v.dislikedBy?.some((id) => id.toString() === userId);
  const base = {
    id: v._id,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    videoUrl: v.videoUrl,
    description: v.description,
    category: v.category,
    views: v.views,
    duration: v.duration,
    isLive: v.isLive,
    liveWatchers: v.liveWatchers,
    likes: v.likedBy?.length ?? 0,
    dislikes: v.dislikedBy?.length ?? 0,
    userLiked: !!liked,
    userDisliked: !!disliked,
    uploadDate: v.createdAt,
    channel: v.channel
      ? {
          id: v.channel._id,
          channelName: v.channel.channelName,
          description: v.channel.description,
          channelBanner: v.channel.channelBanner,
          subscribers: v.channel.subscribers,
        }
      : null,
    channelName: v.channel?.channelName,
    uploader: v.uploader
      ? { id: v.uploader._id, username: v.uploader.username, avatar: v.uploader.avatar }
      : null,
  };
  if (detail) return base;
  return base;
}

export default router;
