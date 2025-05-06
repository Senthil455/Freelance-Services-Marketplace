import { Router } from 'express';
import {
  browseGigs,
  createGig,
  getGig,
  myGigs,
} from '../controllers/gigController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/mine', protect, myGigs);
router.post('/', protect, upload.array('images', 5), createGig);
router.get('/:id', getGig);
router.get('/', browseGigs);

export default router;
