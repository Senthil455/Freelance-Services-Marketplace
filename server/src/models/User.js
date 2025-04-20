import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, default: '' },
    startYear: { type: Number, required: true },
    endYear: { type: Number, default: null },
  },
  { _id: true }
);

const employmentSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: String, required: true },
    endDate: { type: String, default: '' },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: [50, 'Name too long'] },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    tagline: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: [3000, 'Bio is too long'] },
    location: { type: String, default: '' },
    languages: [{ name: String, level: String }],
    skills: { type: [String], default: [] },
    education: [educationSchema],
    employment: [employmentSchema],
    verifiedSeller: { type: Boolean, default: false },
    isSeller: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ['active', 'suspended'], default: 'active' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gig' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    stats: {
      ordersCompleted: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      onTimeDelivery: { type: Number, default: 0 },
      responseTime: { type: Number, default: 12 }, // hours
      averageResponseTime: { type: Number, default: 12 },
    },
    stripeAccountId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const publicProfileProjection = {
  password: 0,
  favorites: 0,
  resetPasswordToken: 0,
  resetPasswordExpire: 0,
};

export const PUBLIC_PROFILE_PROJECTION = publicProfileProjection;

export default mongoose.model('User', userSchema);