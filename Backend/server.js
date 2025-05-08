import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';

// Importar rutas
import userRoutes from './src/routes/userRoutes.js';
import worldRoutes from './src/routes/worldRoutes.js';
import confessionRoutes from './src/routes/confessionRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import vrchatRoutes from './src/routes/vrchatRoutes.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/worlds', worldRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/vrchat', vrchatRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de VRConnect' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

