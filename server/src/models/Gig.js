import mongoose from 'mongoose';

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
    price: { type: Number, required: true, min: [5, 'Minimum price is $5'], max: [100000, 'Price too high'] },
    deliveryDays: { type: Number, required: true, min: 1, max: 90 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Gig', gigSchema);
