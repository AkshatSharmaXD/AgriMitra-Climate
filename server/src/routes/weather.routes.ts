import express from 'express';
import { getWeatherData } from '../services/weather.service';

const router = express.Router();

router.get('/', async (req, res): Promise<any> => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "Missing or invalid lat/lng parameters" });
    }

    const data = await getWeatherData(lat, lng);
    res.json(data);
});

export default router;
