import express from 'express';
import { recommendCrops } from '../services/suitability.service';

const router = express.Router();

router.post('/crops', (req, res) => {
    try {
        const farmContext = req.body;
        if (!farmContext.season || !farmContext.soilType) {
            return res.status(400).json({ error: "Missing required farm context fields (season, soilType)" });
        }

        const recommendations = recommendCrops(farmContext);

        res.json({
            recommendations,
            disclaimer: "These recommendations are based on prototype assumptions and are not scientifically validated agricultural advice."
        });
    } catch (error: any) {
        console.error("Suitability error:", error);
        res.status(500).json({ error: "Failed to generate crop recommendations" });
    }
});

export default router;
