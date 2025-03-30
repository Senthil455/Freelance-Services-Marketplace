import { AppError, asyncHandler } from '../utils/errors.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies?.token) token = req.cookies.token;
  else if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];

  if (!token) throw new AppError('Not authorized, please sign in', 401);

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new AppError('Session expired, please sign in again', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = user;
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(`Role ${req.user.role} is not allowed to access this resource`, 403);
    }
    next();
  });
