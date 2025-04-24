import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { generateToken, sendTokenCookie } from '../utils/token.js';
import { toPublicUrl } from '../middleware/upload.js';

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  tagline: user.tagline,
  bio: user.bio,
  location: user.location,
  languages: user.languages,
  skills: user.skills,
  isSeller: user.isSeller,
  verifiedSeller: user.verifiedSeller,
  accountStatus: user.accountStatus,
  twoFactorEnabled: user.twoFactorEnabled,
  education: user.education,
  employment: user.employment,
  stats: user.stats,
  createdAt: user.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email and password are required', 400);

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) throw new AppError('An account with this email already exists', 409);

  const user = await User.create({ name, email, password, role: role === 'seller' ? 'seller' : 'buyer' });
  const token = generateToken(user._id);
  sendTokenCookie(res, token);
  res.status(201).json({ success: true, user: sanitize(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (user.accountStatus === 'suspended') {
    throw new AppError('This account has been suspended. Contact support.', 403);
  }

  const token = generateToken(user._id);
  sendTokenCookie(res, token);
  res.json({ success: true, user: sanitize(user) });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
});

export const notify = async (userId, title, body = '', link = '', type = 'system') => {
  try {
    await Notification.create({ user: userId, title, body, link, type });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, tagline, bio, location, languages, skills, education, employment } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name.trim();
  if (tagline !== undefined) user.tagline = tagline;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (languages !== undefined) user.languages = Array.isArray(languages) ? languages : [];
  if (skills !== undefined) user.skills = Array.isArray(skills) ? skills.slice(0, 20) : [];
  if (education !== undefined) user.education = Array.isArray(education) ? education : user.education;
  if (employment !== undefined) user.employment = Array.isArray(employment) ? employment : user.employment;

  if (req.file) user.avatar = toPublicUrl(req.file.path);
  if (req.body.coverImageUrl) user.coverImage = req.body.coverImageUrl;

  await user.save();
  res.json({ success: true, user: sanitize(user) });
});

export const becomeSeller = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role === 'admin') throw new AppError('Admin accounts cannot become sellers', 400);
  user.isSeller = true;
  user.role = 'seller';
  await user.save();
  res.json({ success: true, user: sanitize(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError('Current and new password are required', 400);
  if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw new AppError('Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  req.user.avatar = toPublicUrl(req.file.path);
  await req.user.save();
  res.json({ success: true, avatar: req.user.avatar });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name avatar tagline bio location languages skills education employment verifiedSeller isSeller stats createdAt memberSince')
    .lean();
  if (!user) throw new AppError('User not found', 404);

  res.json({ success: true, profile: user });
});
