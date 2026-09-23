import express from 'express';
import {
  getOverview,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getSubjectAnalytics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All analytics routes are protected

router.get('/overview', getOverview);
router.get('/weekly', getWeeklyAnalytics);
router.get('/monthly', getMonthlyAnalytics);
router.get('/subjects', getSubjectAnalytics);

export default router;
