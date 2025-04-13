import mongoose from 'mongoose';

export const PACKAGE_NAMES = ['basic', 'standard', 'premium'];

export const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, enum: PACKAGE_NAMES },
    title: { type: String, required: true, maxlength: 60 },
    description: { type: String, required: true, maxlength: 300 },
    price: { type: Number, required: true, min: [5, 'Minimum price is $5'], max: [100000, 'Price too high'] },
    deliveryDays: { type: Number, required: true, min: 1, max: 90 },
    revisions: { type: Number, default: 0, min: 0, max: 20 },
    features: { type: [String], default: [] },
  },
  { _id: false }
);

const gigSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title too long'],
      minlength: [10, 'Title must be at least 10 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [8000, 'Description too long'],
      minlength: [30, 'Description must be at least 30 characters'],
    },
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    tags: { type: [String], default: [], validate: { validator: (v) => v.length <= 5, message: 'Max 5 tags' } },
    images: { type: [String], default: [] },
    videoThumbnail: String,
    seoTitle: String,
    packages: {
      type: { basic: packageSchema, standard: packageSchema, premium: packageSchema },
      required: true,
      validate: {
        validator(v) {
          return v && v.basic && v.standard && v.premium;
        },
        message: 'All three packages (basic, standard, premium) are required',
      },
    },
    requirements: { type: [String], default: [] },
    faqs: [{ question: { type: String, maxlength: 300 }, answer: { type: String, maxlength: 1000 } }],
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sales: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    responses: { type: Number, default: 0 },
    lastOrderAt: Date,
  },
  { timestamps: true }
);

gigSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text', subCategory: 'text' });
gigSchema.index({ category: 1, active: 1, sales: -1 });

gigSchema.methods.staringPrice = function () {
  return this.packages.basic.price;
};

const Gig = mongoose.model('Gig', gigSchema);

export const searchGigs = async (query, options = {}) => {
  const { page = 1, limit = 20, sort = 'relevance' } = options;
  const sortMap = {
    relevance: { score: { $meta: 'textScore' } },
    newest: { createdAt: -1 },
    priceLow: { 'packages.basic.price': 1 },
    priceHigh: { 'packages.basic.price': -1 },
    bestSellers: { sales: -1 },
    topRated: { rating: -1 },
    favorite: { ratingCount: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.relevance;

  const count = await Gig.countDocuments(query);
  const gigs = await Gig.find(query, sort === 'relevance' && query.$text ? { score: { $meta: 'textScore' } } : {})
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('seller', 'name avatar tagline verifiedSeller location');

  return { gigs, count, totalPages: Math.ceil(count / limit) || 1 };
};

export default Gig;