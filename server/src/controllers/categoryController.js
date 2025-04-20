import Category from '../models/Category.js';
import { AppError, asyncHandler } from '../utils/errors.js';

const reorderIcon = {};

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ popular: -1, name: 1 }).lean();
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, icon, description, popular, subCategories } = req.body;
  if (!name || !slug) throw new AppError('Name and slug are required', 400);

  const exists = await Category.findOne({ $or: [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }, { slug }] });
  if (exists) throw new AppError('Category already exists', 409);

  const category = await Category.create({
    name,
    slug,
    icon: icon || 'grid',
    description: description || '',
    popular: !!popular,
    subCategories: Array.isArray(subCategories) ? subCategories : [],
  });
  res.status(201).json({ success: true, category });
});
