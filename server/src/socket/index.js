import { Server } from 'socket.io';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

export const onlineUsers = new Map();

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];
      if (!token) return next(new Error('Authentication required'));
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    onlineUsers.set(userId, socket.id);

    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send-message', async (payload, ack) => {
      try {
        const { conversationId, text } = payload;
        if (!text?.trim()) return ack?.({ error: 'Message text is required' });

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return ack?.({ error: 'Conversation not found' });
        if (!conversation.participants.some((p) => p.toString() === userId)) {
          return ack?.({ error: 'Not authorized' });
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: userId,
          text: text.trim(),
        });

        conversation.lastMessageAt = new Date();
        conversation.lastMessagePreview = message.text.slice(0, 80);
        await conversation.save();

        const populated = await message.populate('sender', 'name avatar');

        io.to(`conversation:${conversationId}`).emit('new-message', populated);
        io.to(`user:${conversation.participants.find((p) => p.toString() !== userId)}`).emit('conversation-updated', {
          conversationId: conversation._id,
          lastMessagePreview: conversation.lastMessagePreview,
          lastMessageAt: conversation.lastMessageAt,
          message: populated,
        });

        ack?.({ success: true, message: populated });
      } catch (err) {
        ack?.({ error: err.message });
      }
    });

    socket.on('typing', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing', { conversationId, user: { id: userId, name: socket.user.name } });
    });

    socket.on('read-messages', async (conversationId) => {
      await Message.updateMany(
        { conversation: conversationId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
      io.to(`conversation:${conversationId}`).emit('messages-read', { conversationId, user: userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
    });
  });

  return io;
}