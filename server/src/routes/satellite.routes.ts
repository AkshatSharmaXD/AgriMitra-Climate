import express from 'express';
import { getSatelliteData } from '../services/satellite.service';

const router = express.Router();

router.get('/', async (req, res): Promise<any> => {
    try {
        const lat = parseFloat(req.query.lat as string);
        const lng = parseFloat(req.query.lng as string);
        const district = req.query.district as string;

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: "Missing or invalid lat/lng parameters" });
        }

        const data = await getSatelliteData(lat, lng, district);
        res.json(data);
    } catch (error: any) {
        console.error("Satellite Service Error:", error);
        res.status(500).json({ error: "Failed to fetch satellite data" });
    }
});

export default router;
