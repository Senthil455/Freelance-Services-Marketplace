import Notification from '../models/Notification.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/errors.js';

export const myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, notifications, unreadCount });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const markOneRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { $set: { read: true } });
  res.json({ success: true });
});

export const dashboardStats = asyncHandler(async (req, res) => {
  const user = req.user;
  const isSeller = user.role === 'seller' || user.isSeller;

  const buyerOrders = await Order.countDocuments({ buyer: user._id });
  const sellerOrders = isSeller ? await Order.countDocuments({ seller: user._id }) : 0;
  const activeOrders = await Order.countDocuments({
    $or: [{ buyer: user._id }, { seller: user._id }],
    status: { $in: ['pending', 'in_progress', 'delivered', 'revision', 'disputed'] },
  });
  const completed = await Order.countDocuments({
    $or: [{ buyer: user._id }, { seller: user._id }],
    status: 'completed',
  });
  const pendingReviews = await Order.countDocuments({ buyer: user._id, status: 'completed', reviewed: false });

  const earningsAgg = await Order.aggregate([
    { $match: { seller: user._id, status: 'completed', payoutStatus: 'released' } },
    { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
  ]);
  const pendingPayoutAgg = await Order.aggregate([
    { $match: { seller: user._id, status: { $in: ['delivered', 'in_progress', 'pending'] } } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);

  const sellerGigCount = isSeller ? await Gig.countDocuments({ seller: user._id }) : 0;
  const sellerRating = isSeller ? await Review.aggregate([
    { $match: { seller: user._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]) : [];

  const recentOrders = await Order.find({ $or: [{ buyer: user._id }, { seller: user._id }] })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('buyer', 'name avatar')
    .populate('seller', 'name avatar')
    .populate('gig', 'title images category');

  res.json({
    success: true,
    stats: {
      buyerOrders,
      sellerOrders,
      activeOrders,
      completed,
      pendingReviews,
      earnings: Math.round((earningsAgg[0] ? earningsAgg[0].total : 0) * 100) / 100,
      completedSales: earningsAgg[0] ? earningsAgg[0].count : 0,
      pendingPayout: Math.round((pendingPayoutAgg[0] ? pendingPayoutAgg[0].total : 0) * 100) / 100,
      gigCount: sellerGigCount,
      rating: sellerRating[0] && sellerRating[0].avg ? Math.round(sellerRating[0].avg * 10) / 10 : 0,
      reviewCount: sellerRating[0] ? sellerRating[0].count : 0,
    },
    recentOrders,
  });
});
