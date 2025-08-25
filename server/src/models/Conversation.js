import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: (v) => v.length === 2,
        message: 'Conversations must have exactly 2 participants',
      },
    },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    lastMessageAt: Date,
    lastMessagePreview: String,
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);