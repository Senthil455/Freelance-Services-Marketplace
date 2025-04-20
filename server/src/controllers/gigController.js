import Gig from '../models/Gig.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { toPublicUrl } from '../middleware/upload.js';
import mongoose from 'mongoose';

export const browseGigs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(48, parseInt(req.query.limit) || 24);

  const conditions = { active: true };
  if (req.query.category && req.query.category !== 'All') conditions.category = req.query.category;

  const gigs = await Gig.find(conditions)
    .sort({ sales: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('seller', 'name avatar tagline verifiedSeller location')
    .lean();

  const total = await Gig.countDocuments(conditions);
  res.json({
    success: true,
    gigs,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    page,
    limit,
  });
});

export const getGig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid gig id', 400);

  const gig = await Gig.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
    .populate('seller', 'name avatar tagline bio location languages skills verifiedSeller isSeller stats createdAt education employment')
    .lean();
  if (!gig) throw new AppError('Gig not found', 404);

  res.json({ success: true, gig });
});

export const createGig = asyncHandler(async (req, res) => {
  if (req.user.role === 'buyer') throw new AppError('Become a seller to create gigs', 403);

  const { title, description, category, subCategory, tags, packages, requirements, faqs, seoTitle } = req.body;

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

export const myGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .populate('seller', 'name avatar');
  res.json({ success: true, gigs });
});
