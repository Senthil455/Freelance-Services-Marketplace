import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { notify } from './authController.js';
import { toPublicUrl } from '../middleware/upload.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

const SERVICE_FEE_RATE = 0.08; // 8% platform fee
const generateOrderId = () => `FS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export const createOrder = asyncHandler(async (req, res) => {
  const { gigId, packageName, requirements } = req.body;
  if (!['basic', 'standard', 'premium'].includes(packageName)) throw new AppError('Invalid package', 400);

  const gig = await Gig.findById(gigId).populate('seller', 'name avatar isSeller accountStatus');
  if (!gig) throw new AppError('Gig not found', 404);
  if (!gig.active) throw new AppError('This gig is no longer active', 400);
  if (gig.seller._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot order your own gig', 400);
  }
  if (gig.seller.accountStatus === 'suspended') throw new AppError('Seller account is suspended', 400);

  const pkg = gig.packages[packageName];
  const serviceFee = Math.round(pkg.price * SERVICE_FEE_RATE * 100) / 100;

  const order = await Order.create({
    orderId: generateOrderId(),
    buyer: req.user._id,
    seller: gig.seller._id,
    gig: gig._id,
    gigTitle: gig.title,
    gigImage: gig.images?.[0] || '',
    packageName,
    packageTitle: pkg.title,
    price: pkg.price,
    deliveryDays: pkg.deliveryDays,
    revisions: pkg.revisions,
    serviceFee,
    total: Math.round((pkg.price + serviceFee) * 100) / 100,
    requirements: requirements || '',
    deadline: new Date(Date.now() + pkg.deliveryDays * 24 * 60 * 60 * 1000),
  });

  gig.sales += 1;
  gig.lastOrderAt = new Date();
  await gig.save();

  await notify(
    gig.seller._id,
    'New order received',
    `${req.user.name} ordered "${gig.title}" (${pkg.title} package) for $${order.total}`,
    '/dashboard/orders?s=incoming',
    'order'
  );

  res.status(201).json({ success: true, order });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name avatar')
    .populate('seller', 'name avatar')
    .populate('gig', 'title images category');
  if (!order) throw new AppError('Order not found', 404);
  const isParty = order.buyer._id.toString() === req.user._id.toString() || order.seller._id.toString() === req.user._id.toString();
  if (!isParty && req.user.role !== 'admin') throw new AppError('Not authorized to view this order', 403);
  res.json({ success: true, order });
});

export const myOrders = asyncHandler(async (req, res) => {
  const { role = 'buyer', status, page = 1, limit = 10 } = req.query;
  const field = role === 'seller' ? 'seller' : 'buyer';

  const conditions = { [field]: req.user._id };
  if (status && status !== 'all') conditions.status = status;

  const orders = await Order.find(conditions)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('buyer', 'name avatar')
    .populate('seller', 'name avatar')
    .populate('gig', 'title images category');

  const total = await Order.countDocuments(conditions);
  res.json({ success: true, orders, total, totalPages: Math.ceil(total / limit) || 1, page: Number(page) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { to, reason } = req.body;

  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found', 404);

  const isSeller = order.seller.toString() === req.user._id.toString();
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  if (!isSeller && !isBuyer && req.user.role !== 'admin') throw new AppError('Not authorized', 403);

  const allowedFrom = Order.canTransition(order.status, to) || req.user.role === 'admin';

  if (!allowedFrom) {
    throw new AppError(`Cannot change order from "${order.status}" to "${to}"`, 400);
  }

  const validForRole =
    (isSeller && ['in_progress', 'delivered', 'disputed', 'completed'].includes(to)) ||
    (isBuyer && ['completed', 'cancelled', 'revision', 'disputed'].includes(to)) ||
    (req.user.role === 'admin' && ['cancelled', 'completed', 'revision', 'disputed', 'in_progress', 'delivered'].includes(to));

  if (!validForRole) throw new AppError(`As a ${isSeller ? 'seller' : 'buyer'} you cannot set status to "${to}"`, 403);

  order.status = to;

  if (to === 'in_progress') {
    order.deadline = new Date(Date.now() + order.deliveryDays * 24 * 60 * 60 * 1000);
  }
  if (to === 'delivered') {
    order.deliveredWork = {
      message: req.body.message || order.deliveredWork?.message || 'Work has been delivered',
      files: req.files?.length ? [...(order.deliveredWork?.files || []), ...req.files.map((f) => toPublicUrl(f.path))] : order.deliveredWork?.files || [],
      deliveredAt: new Date(),
    };
  }
  if (to === 'completed') {
    order.completedAt = new Date();
    order.payoutStatus = 'released';
    await Gig.findByIdAndUpdate(order.gig, { $inc: { sales: 0 } });
    await User.updateOne({ _id: order.seller }, {
      $inc: { 'stats.ordersCompleted': 1, 'stats.totalEarnings': order.price, 'stats.onTimeDelivery': 1 },
    });
    await User.updateOne({ _id: order.buyer }, { $inc: { 'stats.ordersCompleted': 1 } });
  }
  if (to === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by ' + (isBuyer ? 'buyer' : isSeller ? 'seller' : 'admin');
    order.cancelledBy = isBuyer ? 'buyer' : isSeller ? 'seller' : 'admin';
  }

  await order.save();

  const otherParty = isSeller ? order.buyer : order.seller;
  const labels = { in_progress: 'Order started', delivered: 'Work delivered', completed: 'Order completed', cancelled: 'Order cancelled', revision: 'Revision requested', disputed: 'Order disputed' };
  await notify(
    otherParty,
    labels[to] || 'Order updated',
    `Order ${order.orderId} (${order.gigTitle}) status changed to "${to.replace('_', ' ')}"`,
    `/dashboard/orders/${order._id}`,
    'order'
  );

  res.json({ success: true, order });
});

export const leaveReview = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'completed') throw new AppError('You can only review completed orders', 400);
  if (order.buyer.toString() !== req.user._id.toString()) throw new AppError('Only the buyer can leave a review', 403);
  if (order.reviewed) throw new AppError('This order has already been reviewed', 400);

  const { rating, text, communication, quality, onTime } = req.body;
  const r = Number(rating);
  if (!r || r < 1 || r > 5) throw new AppError('Rating must be between 1 and 5', 400);

  const review = await Review.create({
    order: order._id,
    gig: order.gig,
    reviewer: req.user._id,
    seller: order.seller,
    rating: r,
    communication: Number(communication) || 0,
    quality: Number(quality) || 0,
    onTime: Number(onTime) || 0,
    text: text || '',
  });

  order.reviewed = true;
  await order.save();

  const agg = await Review.aggregate([
    { $match: { gig: new mongoose.Types.ObjectId(order.gig) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Gig.findByIdAndUpdate(order.gig, {
    rating: Math.round((agg[0]?.avg || r) * 10) / 10,
    ratingCount: agg[0]?.count || 1,
  });

  const sellerAgg = await Review.aggregate([
    { $match: { seller: new mongoose.Types.ObjectId(order.seller) } },
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]);
  await User.updateOne({ _id: order.seller }, { rating: sellerAgg[0]?.avg ? Math.round(sellerAgg[0].avg * 10) / 10 : r });

  await notify(order.seller, 'New review received', `You received a ${r}-star review on "${order.gigTitle}"`, `/gig/${order.gig}`, 'review');

  res.status(201).json({ success: true, review, rating: agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : r, ratingCount: agg[0]?.count || 1 });
});

export const sellerExists = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await User.exists({ _id: id });
  res.json({ success: true, exists: !!exists });
});