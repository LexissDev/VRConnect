import express from 'express';
import { searchWorlds, getWorldById, verify2FA } from '../controllers/vrchatProxyController.js';
import { loginVRChat } from '../services/vrchatService.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password, otp } = req.body;
    console.log('Login request - username:', username);
    
    const result = await loginVRChat(username, password, otp);
    console.log('Login result:', result);

    } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al iniciar sesión' 
    });
  }
});
// Route to verify 2FA code for the bot
router.post('/verify-2fa', verify2FA);

// Proxy: Buscar mundos (no requiere login del usuario, usa el Bot)
router.get('/worlds', searchWorlds);

// Proxy: Obtener detalles de un mundo por ID
router.get('/worlds/:worldId', getWorldById);

export default router;
