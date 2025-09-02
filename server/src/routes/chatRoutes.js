import { Router } from 'express';
import {
  getOrCreateConversation,
  listConversations,
  getMessages,
  sendMessage,
  markRead,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(protect);

router.post('/conversations', getOrCreateConversation);
router.get('/conversations', listConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', upload.single('attachment'), sendMessage);
router.put('/conversations/:id/read', markRead);

export default router;
