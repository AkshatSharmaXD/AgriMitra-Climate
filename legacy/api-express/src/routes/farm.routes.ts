import express from 'express';
import mongoose from 'mongoose';
import Farm from '../models/farm.model';
import SatelliteSnapshot from '../models/satelliteSnapshot.model';
import DiseaseAnalysis from '../models/diseaseAnalysis.model';
import { getWeatherData } from '../services/weather.service';
import { computeAndSaveFarmRisk } from '../services/risk.service';

const router = express.Router();

function validateFarmBody(body: any, isUpdate = false) {
    const errors: Record<string, string> = {};
    if (!isUpdate || body.farmerId !== undefined) {
        if (!body.farmerId) errors.farmerId = 'Farmer ID is required';
        else if (!mongoose.Types.ObjectId.isValid(body.farmerId)) errors.farmerId = 'Invalid Farmer ID format';
    }
    if (!isUpdate || body.location !== undefined) {
        if (!body.location || typeof body.location.lat !== 'number' || typeof body.location.lng !== 'number') {
            errors.location = 'Location with valid lat and lng is required';
        }
    }
    if (!isUpdate || body.state !== undefined) {
        if (!body.state || typeof body.state !== 'string') errors.state = 'State is required';
    }
    if (!isUpdate || body.district !== undefined) {
        if (!body.district || typeof body.district !== 'string') errors.district = 'District is required';
    }
    if (!isUpdate || body.area !== undefined) {
        if (typeof body.area !== 'number' || body.area <= 0) errors.area = 'Area must be a positive number';
    }
    if (!isUpdate || body.crop !== undefined) {
        if (!body.crop || typeof body.crop !== 'string') errors.crop = 'Crop is required';
    }
    if (!isUpdate || body.season !== undefined) {
        if (!['Kharif', 'Rabi', 'Zaid'].includes(body.season)) errors.season = 'Season must be Kharif, Rabi, or Zaid';
    }
    if (!isUpdate || body.soil !== undefined) {
        if (!body.soil || typeof body.soil.type !== 'string') errors.soil = 'Soil with a valid type is required';
    }
    if (!isUpdate || body.irrigation !== undefined) {
        if (!body.irrigation || typeof body.irrigation !== 'string') errors.irrigation = 'Irrigation is required';
    }
    return Object.keys(errors).length > 0 ? errors : null;
}

router.post('/', async (req, res): Promise<any> => {
    try {
        const errors = validateFarmBody(req.body);
        if (errors) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        const farm = new Farm(req.body);
        await farm.save();
        res.status(201).json(farm);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', async (req, res): Promise<any> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Farm ID format' });
        }
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }
        res.json(farm);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id/risk', async (req, res): Promise<any> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Farm ID format' });
        }
        
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        const weatherData = await getWeatherData(farm.location.lat, farm.location.lng);
        const satelliteData = await SatelliteSnapshot.findOne({ farmId: id }).sort({ date: -1 });
        const diseaseData = await DiseaseAnalysis.findOne({ farmId: id }).sort({ timestamp: -1 });

        const riskResult = await computeAndSaveFarmRisk(
            id,
            farm,
            weatherData,
            satelliteData,
            diseaseData
        );

        res.json(riskResult);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res): Promise<any> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Farm ID format' });
        }
        const errors = validateFarmBody(req.body, true);
        if (errors) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        const farm = await Farm.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }
        res.json(farm);
    } catch (err: any) {
        console.error(err);
        if (err.name === 'ValidationError') {
             return res.status(400).json({ error: 'Validation failed', details: err.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/farmer/:farmerId', async (req, res): Promise<any> => {
    try {
        const { farmerId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(farmerId)) {
            return res.status(400).json({ error: 'Invalid Farmer ID format' });
        }
        const farms = await Farm.find({ farmerId });
        res.json(farms);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
