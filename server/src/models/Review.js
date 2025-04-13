import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', unique: true, sparse: true },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true, index: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    onTime: { type: Number, min: 1, max: 5 },
    text: { type: String, maxlength: 2000, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
