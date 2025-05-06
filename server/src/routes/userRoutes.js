import { Router } from 'express';
import { register, login, logout, me, updateProfile, becomeSeller, changePassword, getPublicProfile, toggleFavorite, getFavorites, uploadAvatar, deleteAccount } from '../controllers/authController.js';
import { dashboardStats } from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/become-seller', protect, becomeSeller);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/favorites/toggle', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);
router.get('/dashboard', protect, dashboardStats);
router.get('/:id', getPublicProfile);
router.delete('/account', protect, deleteAccount);

export default router;