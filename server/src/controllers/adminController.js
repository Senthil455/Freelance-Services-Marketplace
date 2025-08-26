import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { notify } from './authController.js';

export const adminOverview = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalGigs, totalOrders, totalRevenueAgg, activeOrders, pendingOrders] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isSeller: true }),
    Gig.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: 'completed', payoutStatus: 'released' } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
    Order.countDocuments({ status: { $in: ['in_progress', 'delivered', 'pending', 'revision'] } }),
    Order.countDocuments({ status: 'pending' }),
  ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(8).select('name email role isSeller createdAt').lean();
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('buyer', 'name')
    .populate('seller', 'name')
    .lean();

  const ordersByDay = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$price' } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalSellers,
      totalGigs,
      totalOrders,
      totalRevenue: Math.round((totalRevenueAgg[0] ? totalRevenueAgg[0].total : 0) * 100) / 100,
      activeOrders,
      pendingOrders,
      ordersByDay,
    },
    recentUsers,
    recentOrders,
  });
});

export const adminUsers = asyncHandler(async (req, res) => {
  const { query, role, page = 1, limit = 15 } = req.query;
  const conditions = {};
  if (query) conditions.$or = [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }];
  if (role && role !== 'all') conditions.role = role;

  const users = await User.find(conditions)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();
  const total = await User.countDocuments(conditions);

  res.json({ success: true, users, total, totalPages: Math.ceil(total / limit) || 1, page: Number(page) });
});

export const adminUpdateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (req.user._id.toString() === user._id.toString()) throw new AppError('Admins cannot modify their own account here', 400);

  const { accountStatus, isSeller, verifiedSeller, role } = req.body;
  if (accountStatus !== undefined) user.accountStatus = accountStatus;
  if (isSeller !== undefined) user.isSeller = isSeller;
  if (verifiedSeller !== undefined) user.verifiedSeller = verifiedSeller;
  if (role !== undefined && ['buyer', 'seller', 'admin'].includes(role)) user.role = role;

  await user.save();
  await notify(user._id, 'Account updated', 'An administrator updated your account.', '/dashboard/settings', 'system');
  res.json({ success: true, user });
});

export const adminGigs = asyncHandler(async (req, res) => {
  const { query, active, page = 1, limit = 15 } = req.query;
  const conditions = {};
  if (query) {
    conditions.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ];
  }
  if (active !== undefined && active !== '') conditions.active = active === 'true';

  const gigs = await Gig.find(conditions)
    .populate('seller', 'name avatar email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Gig.countDocuments(conditions);

  res.json({ success: true, gigs, total, totalPages: Math.ceil(total / limit) || 1, page: Number(page) });
});

export const adminToggleGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) throw new AppError('Gig not found', 404);
  gig.active = !gig.active;
  await gig.save();
  await notify(gig.seller, gig.active ? 'Gig re-activated' : 'Gig deactivated', '"' + gig.title + '" was ' + (gig.active ? 're-enabled' : 'deactivated') + ' by an administrator', '/dashboard/gigs', 'gig');
  res.json({ success: true, gig });
});

export const adminOrders = asyncHandler(async (req, res) => {
  const { status, query, page = 1, limit = 15 } = req.query;
  const conditions = {};
  if (status) conditions.status = status;
  if (query) {
    conditions.$or = [{ orderId: { $regex: query, $options: 'i' } }, { gigTitle: { $regex: query, $options: 'i' } }];
  }

  const orders = await Order.find(conditions)
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('gig', 'title')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Order.countDocuments(conditions);

  res.json({ success: true, orders, total, totalPages: Math.ceil(total / limit) || 1, page: Number(page) });
});

export const adminResolveDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, reason } = req.body;
  if (!['complete', 'cancel'].includes(decision)) throw new AppError('Decision must be complete or cancel', 400);

  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found', 404);

  if (decision === 'complete') {
    order.status = 'completed';
    order.completedAt = new Date();
    order.payoutStatus = 'released';
  } else {
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Resolved by administrator';
    order.cancelledBy = 'admin';
  }
  await order.save();

  await notify(order.buyer, 'Dispute resolved', 'Order ' + order.orderId + ' was ' + decision + 'ed by an administrator.', '/dashboard/orders/' + order._id, 'order');
  await notify(order.seller, 'Dispute resolved', 'Order ' + order.orderId + ' was ' + decision + 'ed by an administrator.', '/dashboard/orders/' + order._id, 'order');

  res.json({ success: true, order });
});
