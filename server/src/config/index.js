import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance_marketplace',
  jwtSecret: process.env.JWT_SECRET || 'change-me-to-a-long-random-secret',
  jwtCookieExpiresDays: Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 10,
};