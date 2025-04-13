import mongoose from 'mongoose';

export const ORDER_STATUS = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'revision', 'disputed'];
const STATUS_FLOW = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['delivered', 'cancelled'],
  delivered: ['completed', 'revision', 'disputed'],
  revision: ['delivered', 'cancelled'],
  disputed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

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
    cancelledAt: Date,
    cancellationReason: String,
    cancelledBy: { type: String, enum: ['buyer', 'seller', 'admin'] },
    reviewed: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ['card', 'sandbox'], default: 'sandbox' },
    stripePaymentIntent: String,
    payoutStatus: { type: String, enum: ['pending', 'released'], default: 'pending' },
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });

orderSchema.statics.canTransition = (from, to) => STATUS_FLOW[from]?.includes(to) ?? false;

orderSchema.methods.canTransition = function (to) {
  return orderSchema.statics.canTransition(this.status, to);
};

export default mongoose.model('Order', orderSchema);