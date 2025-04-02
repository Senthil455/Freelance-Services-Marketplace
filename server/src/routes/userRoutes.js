import { Router } from 'express';
import { register, login, logout, me, updateProfile, becomeSeller } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/become-seller', protect, becomeSeller);

export default router;
