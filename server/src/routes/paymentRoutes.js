import { Router } from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/create-payment-intent', protect, createPaymentIntent);

export default router;
