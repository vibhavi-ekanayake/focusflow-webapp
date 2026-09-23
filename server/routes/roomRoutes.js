import express from 'express';
import {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomByCode,
  updateRoomTimer,
  updateMemberStatus,
  postRoomMessage,
  leaveRoom,
  regenerateRoomCode,
  deleteRoom
} from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All room endpoints require authenticated JWT

router.post('/', createRoom);
router.post('/join', joinRoom);
router.get('/my-rooms', getMyRooms);
router.get('/:code', getRoomByCode);
router.post('/:code/timer', updateRoomTimer);
router.put('/:code/status', updateMemberStatus);
router.post('/:code/messages', postRoomMessage);
router.post('/:code/leave', leaveRoom);
router.post('/:code/regenerate-code', regenerateRoomCode);
router.delete('/:code', deleteRoom);

export default router;
