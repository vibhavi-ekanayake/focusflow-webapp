import express from 'express';
import { getProfile, updateProfile, updateSettings } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/settings', updateSettings);

export default router;
