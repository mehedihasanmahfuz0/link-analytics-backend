import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Get analytics for a specific link (using shortCode)
router.get('/:shortCode', authenticate, analyticsController.getLinkAnalytics);

export default router;
