import mongoose from 'mongoose';

export const ORDER_STATUS = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'revision', 'disputed'];

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    gigTitle: { type: String, required: true },
    gigImage: String,
    packageName: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
    packageTitle: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    deliveryDays: { type: Number, required: true, min: 1 },
    revisions: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUS, default: 'pending' },
    requirements: { type: String, default: '' },
    requirementsAttachments: [String],
    deliveredWork: {
      message: String,
      files: [String],
      deliveredAt: Date,
    },
    deadline: Date,
    buyerNote: String,
    sellerNote: String,
    completedAt: Date,
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
