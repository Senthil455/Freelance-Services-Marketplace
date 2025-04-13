import mongoose from 'mongoose';

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
    status: { type: String, default: 'pending' },
    requirements: { type: String, default: '' },
    deadline: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
