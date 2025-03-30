import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    icon: { type: String, default: 'code' },
    description: { type: String, default: '' },
    popular: { type: Boolean, default: false },
    subCategories: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);