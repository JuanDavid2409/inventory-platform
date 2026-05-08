import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import sectionRoutes from './routes/sections.routes';
import inventoryRoutes from './routes/inventory.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware globales
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Manejo de rutas no encontradas
app.use((_req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }));

app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));