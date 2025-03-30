import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: `${config.jwtCookieExpiresDays}d` });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

export const sendTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: config.jwtCookieExpiresDays * 24 * 60 * 60 * 1000,
  });
};