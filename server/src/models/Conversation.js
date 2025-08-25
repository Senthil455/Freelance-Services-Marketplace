import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    lastMessageAt: Date,
    lastMessagePreview: String,
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
