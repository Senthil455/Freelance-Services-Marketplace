import Order from '../models/Order.js';
import Gig from '../models/Gig.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import crypto from 'crypto';

const SERVICE_FEE_RATE = 0.08; // 8% platform fee
const generateOrderId = () => `FS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

export const createOrder = asyncHandler(async (req, res) => {
  const { gigId, packageName, requirements } = req.body;
  if (!['basic', 'standard', 'premium'].includes(packageName)) throw new AppError('Invalid package', 400);

  const gig = await Gig.findById(gigId);
  if (!gig) throw new AppError('Gig not found', 404);
  if (!gig.active) throw new AppError('This gig is no longer active', 400);
  if (gig.seller.toString() === req.user._id.toString()) throw new AppError('You cannot order your own gig', 400);

  const pkg = gig.packages[packageName];
  const serviceFee = Math.round(pkg.price * SERVICE_FEE_RATE * 100) / 100;

  const order = await Order.create({
    orderId: generateOrderId(),
    buyer: req.user._id,
    seller: gig.seller,
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
  const { to } = req.body;

  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found', 404);

  const isParty = order.buyer.toString() === req.user._id.toString() || order.seller.toString() === req.user._id.toString();
  if (!isParty) throw new AppError('Not authorized', 403);

  if (!Order.canTransition(order.status, to)) {
    throw new AppError(`Cannot change order from "${order.status}" to "${to}"`, 400);
  }

  order.status = to;

  if (to === 'in_progress') {
    order.deadline = new Date(Date.now() + order.deliveryDays * 24 * 60 * 60 * 1000);
  }
  if (to === 'completed') {
    order.completedAt = new Date();
  }
  if (to === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancellationReason = 'Cancelled by ' + (isParty ? 'the other party' : 'admin');
    order.cancelledBy = order.buyer.toString() === req.user._id.toString() ? 'buyer' : 'seller';
  }

  await order.save();
  res.json({ success: true, order });
});
