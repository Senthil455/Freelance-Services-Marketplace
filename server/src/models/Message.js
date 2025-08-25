import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, maxlength: 4000, default: '' },
    attachment: String,
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    system: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);