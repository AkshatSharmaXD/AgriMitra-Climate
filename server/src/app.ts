import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import diagnoseRoutes from './routes/diagnose.routes';
import marketRoutes from './routes/market.routes';
import schemesRoutes from './routes/schemes.routes';
import weatherRoutes from './routes/weather.routes';
import voiceRoutes from './routes/voice.routes';
import { connectDB } from './config/db';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

import forumRoutes from './routes/forum.routes';
import farmRoutes from './routes/farm.routes';
import recommendationsRoutes from './routes/recommendations.routes';
import advisoryRoutes from './routes/advisory.routes';
import satelliteRoutes from './routes/satellite.routes';
import districtRoutes from './routes/district.routes';

import { initSatelliteService } from './services/satellite.service';




// Routes
app.use('/api/diagnose', diagnoseRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/satellite', satelliteRoutes);
app.use('/api/district', districtRoutes);


// Initialize Services
initSatelliteService();




app.get('/', (req, res) => {
    res.send('Agri Mitra API is running');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
