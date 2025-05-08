import express from 'express';
import { getAllConfessions, createConfession, getConfessionById } from '../controllers/confessionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllConfessions);
router.get('/:id', getConfessionById);
router.post('/', authMiddleware, createConfession);

export default router;