// src/routes/vrchatRoutes.js
import express from 'express';
import { loginVRChat, verifyEmailOtp, getWorlds, getFriends } from '../services/vrchatService.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, otp } = req.body;
  console.log('username :', username);
  console.log('password :', password);
  console.log('otp :', otp);
  
  const result = await loginVRChat(username, password, otp);
  console.log('result :', result);

  res.json(result);
  
  //res.json(result.data);
  
});

router.post('/verify-email-otp', async (req, res) => {
  const { code } = req.body;
  const result = await verifyEmailOtp(code);
  res.json(result);
});

// Obtener mundos populares
router.get('/worlds', async (req, res) => {
  try {
    const { n, offset, sort, search, tag, notag, releaseStatus, featured } = req.query;
    
    // Construir parámetros para la API de VRChat
    const params = {
        n:      n  ? parseInt(n, 10)   : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
        sort:   sort || undefined,
        search: search || undefined,
        tag:    tag || undefined,
        notag:  notag || undefined,
        releaseStatus: releaseStatus || undefined,
        featured: featured === 'true' ? true
                 : featured === 'false' ? false
                 : undefined
      };

    
    
    const worlds = await getWorlds(params);
    console.log('worlds :', worlds);
    res.json(worlds);
    
  } catch (error) {
    console.error('Error al obtener mundos:', error);
    res.status(500).json({ error: 'Error al obtener mundos' });
  }
});

// Obtener detalles de un mundo específico
router.get('/worlds/:worldId', async (req, res) => {
  try {
    const { worldId } = req.params;
    
    // Llamar a la función del servicio
    const world = await getWorldById(worldId);
    
    res.json(world);
  } catch (error) {
    console.error('Error al obtener detalles del mundo:', error);
    res.status(500).json({ error: 'Error al obtener detalles del mundo' });
  }
});

router.get('/friends', async (req, res) => {
  const result = await getFriends();
  res.json(result);
});

export default router;
