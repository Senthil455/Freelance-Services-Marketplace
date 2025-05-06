import { Router } from 'express';
import { createOrder, getOrder, myOrders, updateStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', myOrders);
router.put('/:id/status', updateStatus);
router.get('/:id', getOrder);

export default router;
