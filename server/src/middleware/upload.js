import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';

const baseDir = path.resolve(config.uploadDir || 'uploads');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = file.fieldname === 'avatar' ? 'avatars' : 'gigs';
    const dir = path.join(baseDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new AppError('Only JPG, PNG, WEBP or GIF images are allowed', 400));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});

export const toPublicUrl = (filePath) => {
  if (!filePath) return null;
  const normalized = filePath.split(path.sep).join('/');
  return `/uploads/${normalized.replace(/^uploads\//, '')}`;
};