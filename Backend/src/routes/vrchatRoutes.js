import express from 'express';
import { searchWorlds, getWorldById, verify2FA } from '../controllers/vrchatProxyController.js';

const router = express.Router();

// Route to verify 2FA code for the bot
router.post('/verify-2fa', verify2FA);

// Proxy: Buscar mundos (no requiere login del usuario, usa el Bot)
router.get('/worlds', searchWorlds);

// Proxy: Obtener detalles de un mundo por ID
router.get('/worlds/:worldId', getWorldById);

export default router;
