import { Router } from 'express';
import {
  browseGigs,
  createGig,
  updateGig,
  deleteGig,
  getGig,
  myGigs,
  relatedGigs,
  toggleFeatured,
} from '../controllers/gigController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/search', browseGigs);
router.get('/mine', protect, myGigs);
router.get('/related/:id', relatedGigs);
router.post('/', protect, upload.array('images', 5), createGig);
router.put('/:id', protect, upload.array('images', 5), updateGig);
router.delete('/:id', protect, deleteGig);
router.patch('/:id/feature', protect, toggleFeatured);
router.get('/:id', getGig);

export default router;