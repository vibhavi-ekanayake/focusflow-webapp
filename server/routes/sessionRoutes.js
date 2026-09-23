import express from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  deleteSession
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All session routes are protected

router.route('/')
  .post(createSession)
  .get(getSessions);

router.route('/:id')
  .get(getSessionById)
  .delete(deleteSession);

export default router;
