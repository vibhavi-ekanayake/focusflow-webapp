import express from 'express';
import { getGoals, updateGoals } from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All goal routes are protected

router.route('/')
  .get(getGoals)
  .put(updateGoals);

export default router;
