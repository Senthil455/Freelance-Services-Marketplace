import { Router } from 'express';
import { createOrder, getOrder, myOrders, updateStatus, leaveReview } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', myOrders);
router.post('/:id/review', leaveReview);
router.put('/:id/status', upload.array('files', 5), updateStatus);
router.get('/:id', getOrder);

export default router;