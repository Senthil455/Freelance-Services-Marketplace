import { Router } from 'express';
import {
  myNotifications,
  markAllRead,
  markOneRead,
} from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', myNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markOneRead);

export default router;
