import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { generateToken, sendTokenCookie } from '../utils/token.js';

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
