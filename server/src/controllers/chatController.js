import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { toPublicUrl } from '../middleware/upload.js';
import { notify } from './authController.js';

export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { sellerId, gigId } = req.body;
  if (!sellerId) throw new AppError('Seller id is required', 400);
  if (sellerId === req.user._id.toString()) throw new AppError('You cannot message yourself', 400);

  const seller = await User.exists({ _id: sellerId });
  if (!seller) throw new AppError('Seller not found', 404);

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, sellerId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, sellerId],
      gig: gigId || null,
    });
    await notify(sellerId, 'New message', `${req.user.name} started a conversation with you`, '/dashboard/messages', 'message');
  }

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .limit(100)
    .populate('sender', 'name avatar');

  res.json({ success: true, conversation, messages });
});

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name avatar tagline isSeller')
    .populate('gig', 'title images category');

  const unreadCounts = await Message.aggregate([
    { $match: { conversation: { $in: conversations.map((c) => c._id) }, readBy: { $ne: req.user._id } } },
    { $group: { _id: '$conversation', count: { $sum: 1 } } },
  ]);
  const unreadMap = Object.fromEntries(unreadCounts.map((u) => [u._id.toString(), u.count]));

  res.json({
    success: true,
    conversations: conversations.map((c) => ({
      ...c.toObject(),
      unreadCount: unreadMap[c._id.toString()] || 0,
    })),
  });
});

export const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new AppError('Conversation not found', 404);
  const isParticipant = conversation.participants.some((p) => p.toString() === req.user._id.toString());
  if (!isParticipant && req.user.role !== 'admin') throw new AppError('Not authorized', 403);

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate('sender', 'name avatar');

  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  res.json({ success: true, messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new AppError('Conversation not found', 404);
  const isParticipant = conversation.participants.some((p) => p.toString() === req.user._id.toString());
  if (!isParticipant) throw new AppError('Not authorized', 403);

  const { text } = req.body;
  if (!text?.trim() && !req.file) throw new AppError('Message text or attachment is required', 400);

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: text?.trim() || (req.file ? 'Sent an attachment' : ''),
    attachment: req.file ? toPublicUrl(req.file.path) : undefined,
  });

  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = message.text.slice(0, 80) || '📎 Attachment';
  await conversation.save();

  const populated = await message.populate('sender', 'name avatar');

  const otherParty = conversation.participants.find((p) => p.toString() !== req.user._id.toString());
  await notify(otherParty, 'New message', message.text.slice(0, 120) || 'Sent an attachment', '/dashboard/messages', 'message');

  res.status(201).json({ success: true, message: populated, conversation });
});

export const markRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { conversation: req.params.id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );
  res.json({ success: true });
});