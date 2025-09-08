import { Router } from 'express';
import {
  adminOverview,
  adminUsers,
  adminUpdateUser,
  adminGigs,
  adminToggleGig,
  adminOrders,
  adminResolveDispute,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/overview', adminOverview);
router.get('/users', adminUsers);
router.put('/users/:id', adminUpdateUser);
router.get('/gigs', adminGigs);
router.patch('/gigs/:id/toggle', adminToggleGig);
router.get('/orders', adminOrders);
router.put('/orders/:id/dispute', adminResolveDispute);

export default router;