import Gig from '../models/Gig.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { toPublicUrl } from '../middleware/upload.js';
import { notify } from './authController.js';
import mongoose from 'mongoose';

export const browseGigs = asyncHandler(async (req, res) => {
  const { q, category, subCategory, min, max, minRating, deliveryTime, sort = 'relevance', type = 'gigs', sellerId } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(48, parseInt(req.query.limit) || 24);

  const conditions = { active: true };
  if (sellerId && mongoose.isValidObjectId(sellerId)) conditions.seller = sellerId;

  if (type === 'services') {
    conditions.$or = [];

    const sellerIds = await User.find(
      { $or: [{ name: { $regex: q ? new RegExp(q, 'i') : /./ } }, { tagline: { $regex: q ? new RegExp(q, 'i') : /./ } }, { bio: { $regex: q ? new RegExp(q, 'i') : /./ } }] },
      '_id'
    ).select('_id').lean();

    if (sellerIds.length) conditions.$or.push({ seller: { $in: sellerIds.map((s) => s._id) } });

    if (q) {
      conditions.$or.push(
        { title: { $regex: new RegExp(q, 'i') } },
        { description: { $regex: new RegExp(q, 'i') } },
        { tags: { $regex: new RegExp(q, 'i') } },
        { category: { $regex: new RegExp(q, 'i') } },
        { subCategory: { $regex: new RegExp(q, 'i') } }
      );
    } else {
      conditions.$or.push({ sales: { $gt: 0 } });
    }
  } else if (q) {
    conditions.$text = { $search: q };
  }

  if (subCategory) conditions.subCategory = subCategory;
  else if (category && category !== 'All') conditions.category = category;

  if (min) conditions['packages.basic.price'] = { ...(conditions['packages.basic.price'] || {}), $gte: Number(min) };
  if (max) conditions['packages.basic.price'] = { ...(conditions['packages.basic.price'] || {}), $lte: Number(max) };
  if (minRating) conditions.rating = { $gte: Number(minRating) };

  const DELIVERY_VALUES = { 1: { $lte: 1 }, 3: { $lte: 3 }, 7: { $lte: 7 }, 14: { $lte: 14 } };
  if (deliveryTime && DELIVERY_VALUES[deliveryTime]) {
    conditions['packages.basic.deliveryDays'] = DELIVERY_VALUES[deliveryTime];
  }

  const sortMap = {
    relevance: q ? { score: { $meta: 'textScore' } } : { sales: -1 },
    newest: { createdAt: -1 },
    priceLow: { 'packages.basic.price': 1 },
    priceHigh: { 'packages.basic.price': -1 },
    bestSellers: { sales: -1 },
    topRated: { rating: -1 },
    favorite: { ratingCount: -1 },
  };

  const baseProjection =
    'title images category subCategory packages.basic.price packages.standard.price packages.premium.price rating ratingCount sales views responses featured active createdAt seller';
  const projection = q && conditions.$text && sort === 'relevance' ? { ...baseProjection.split(' ').reduce((acc, f) => ({ ...acc, [f]: 1 }), {}), score: { $meta: 'textScore' } } : {};

  const [gigs, count] = await Promise.all([
    Gig.find(conditions, projection && q && sort === 'relevance' ? projection : '-description -requirements -faqs -seoTitle')
      .sort(sortMap[sort] || { sales: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('seller', 'name avatar tagline verifiedSeller location')
      .lean(),
    Gig.countDocuments(conditions),
  ]);

  res.json({
    success: true,
    gigs,
    total: count,
    totalPages: Math.ceil(count / limit) || 1,
    page,
    limit,
  });
});

export const getGig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid gig id', 400);

  const gig = await Gig.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
    .populate(
      'seller',
      'name avatar tagline bio location languages skills verifiedSeller isSeller stats createdAt education employment'
    )
    .lean();
  if (!gig) throw new AppError('Gig not found', 404);

  const reviews = await Review.find({ gig: id })
    .populate('reviewer', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const ratingBreakdown = await Review.aggregate([
    { $match: { gig: new mongoose.Types.ObjectId(id) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);

  const related = await Gig.find({
    active: true,
    category: gig.category,
    _id: { $ne: id },
  })
    .select('title images packages.basic.price rating ratingCount sales seller slug createdAt')
    .sort({ sales: -1 })
    .limit(4)
    .populate('seller', 'name avatar tagline verifiedSeller')
    .lean();

  const msDelivered = await Order.find({
    seller: gig.seller._id,
    status: 'completed',
    completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  }).countDocuments();

  res.json({
    success: true,
    gig,
    reviews,
    ratingBreakdown,
    related,
    sellerMonthlyDeliveries: msDelivered,
  });
});

export const createGig = asyncHandler(async (req, res) => {
  if (req.user.role === 'buyer') throw new AppError('Become a seller to create gigs', 403);

  const {
    title,
    description,
    category,
    subCategory,
    tags,
    packages,
    requirements,
    faqs,
    seoTitle,
  } = req.body;

  const parsed = JSON.parse(packages);
  if (!parsed?.basic || !parsed?.standard || !parsed?.premium) {
    throw new AppError('All three packages are required', 400);
  }

  const gig = await Gig.create({
    seller: req.user._id,
    title,
    description,
    category,
    subCategory,
    tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
    packages: parsed,
    requirements: Array.isArray(requirements) ? requirements : [],
    faqs: JSON.parse(faqs || '[]'),
    seoTitle: seoTitle || '',
    images: (req.files || []).map((f) => toPublicUrl(f.path)),
  });

  res.status(201).json({ success: true, gig });
});

export const updateGig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gig = await Gig.findById(id);
  if (!gig) throw new AppError('Gig not found', 404);
  if (gig.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You can only edit your own gigs', 403);
  }

  const { title, description, category, subCategory, tags, packages, requirements, faqs, seoTitle, active } = req.body;

  if (title !== undefined) gig.title = title;
  if (description !== undefined) gig.description = description;
  if (category !== undefined) gig.category = category;
  if (subCategory !== undefined) gig.subCategory = subCategory;
  if (tags !== undefined) gig.tags = Array.isArray(tags) ? tags.slice(0, 5) : [];
  if (packages !== undefined) gig.packages = JSON.parse(packages);
  if (requirements !== undefined) gig.requirements = Array.isArray(requirements) ? requirements : [];
  if (faqs !== undefined) gig.faqs = JSON.parse(faqs || '[]');
  if (seoTitle !== undefined) gig.seoTitle = seoTitle;
  if (active !== undefined) gig.active = active;

  if (req.files?.length) {
    gig.images = [...gig.images, ...req.files.map((f) => toPublicUrl(f.path))];
  }
  if (req.body.removeImages) {
    const remove = JSON.parse(req.body.removeImages);
    gig.images = gig.images.filter((img) => !remove.includes(img));
  }

  await gig.save({ validateBeforeSave: true });
  res.json({ success: true, gig });
});

export const deleteGig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gig = await Gig.findById(id);
  if (!gig) throw new AppError('Gig not found', 404);
  if (gig.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own gigs', 403);
  }
  await gig.deleteOne();
  res.json({ success: true, message: 'Gig deleted' });
});

export const myGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .populate('seller', 'name avatar');
  res.json({ success: true, gigs });
});

export const relatedGigs = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id).select('category');
  if (!gig) throw new AppError('Gig not found', 404);
  const gigs = await Gig.find({
    category: gig.category,
    _id: { $ne: gig._id },
    active: true,
  })
    .select('title images category packages.basic.price rating ratingCount sales seller slug createdAt')
    .populate('seller', 'name avatar tagline verifiedSeller')
    .sort({ sales: -1 })
    .limit(4)
    .lean();
  res.json({ success: true, gigs });
});

export const toggleFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gig = await Gig.findById(id);
  if (!gig) throw new AppError('Gig not found', 404);
  gig.featured = !gig.featured;
  await gig.save();
  res.json({ success: true, featured: gig.featured });
});