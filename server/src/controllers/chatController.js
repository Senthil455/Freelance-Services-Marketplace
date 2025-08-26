import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';
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
    await notify(sellerId, 'New message', req.user.name + ' started a conversation with you', '/dashboard/messages', 'message');
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

  res.json({ success: true, conversations });
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

  res.json({ success: true, messages });
});
