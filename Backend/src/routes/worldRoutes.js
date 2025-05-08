import express from 'express';
import { getAllWorlds, getWorldById, createWorld, likeWorld, getWorldsByLikes } from '../controllers/worldController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllWorlds);
router.get('/ranking', getWorldsByLikes);
router.get('/:id', getWorldById);
router.post('/', authMiddleware, createWorld);
router.post('/:world_id/like', authMiddleware, likeWorld);

export default router;