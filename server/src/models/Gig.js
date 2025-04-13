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
    tags: { type: [String], default: [], validate: { validator: (v) => v.length <= 5, message: 'Max 5 tags' } },
    images: { type: [String], default: [] },
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
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

gigSchema.methods.staringPrice = function () {
  return this.packages.basic.price;
};

export default mongoose.model('Gig', gigSchema);
