import express from 'express';
import { Type } from '@google/genai';
import { generateJSON } from '../services/gemini.service';

const router = express.Router();

const advisorySchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        actions: { type: Type.ARRAY, items: { type: Type.STRING } },
        irrigationAdvice: { type: Type.STRING },
        weatherAdvice: { type: Type.STRING },
        monitoringAdvice: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["summary", "risks", "actions", "irrigationAdvice", "weatherAdvice", "monitoringAdvice"]
};

router.post('/', async (req, res): Promise<any> => {
    try {
        const farmContext = req.body;
        const language = farmContext.language || 'en';

        const prompt = `
Farm Context:
- Location: ${farmContext.location}
- Crop: ${farmContext.crop}
- Soil: ${farmContext.soil}
- Water Availability: ${farmContext.waterAvailability}
- Temperature: ${farmContext.temperature}°C
- Humidity: ${farmContext.humidity}%
- Rainfall Forecast: ${farmContext.rainfallForecast}mm
- Vegetation Health (NDVI): ${farmContext.vegetationHealth}
- Farm Risk Level: ${farmContext.farmRisk}

Generate localized advice based on the provided data.
`;

        try {
            const aiResponse = await generateJSON<any>(prompt, advisorySchema, language);
            res.json({ ...aiResponse, source: "gemini-2.5-flash" });
        } catch (error: any) {
            if (error.message === "GEMINI_API_KEY_NOT_SET" || error.message.includes("API_KEY") || !process.env.GEMINI_API_KEY) {
                // Fallback template
                const fallbackResponse = {
                    summary: `Farm risk is currently ${farmContext.farmRisk}. Ensure adequate care for ${farmContext.crop} in ${farmContext.soil} soil.`,
                    risks: [
                        `Current temperature is ${farmContext.temperature}°C`,
                        `Rainfall forecast is ${farmContext.rainfallForecast}mm`
                    ],
                    actions: [
                        "Monitor crop health regularly",
                        "Adjust irrigation based on rainfall"
                    ],
                    irrigationAdvice: `Water availability is ${farmContext.waterAvailability}. Manage water carefully.`,
                    weatherAdvice: `Prepare for ${farmContext.temperature}°C and ${farmContext.rainfallForecast}mm rain.`,
                    monitoringAdvice: [
                        "Check for pests",
                        "Observe vegetation health"
                    ],
                    source: "fallback-template"
                };
                return res.json(fallbackResponse);
            }
            throw error;
        }

    } catch (err: any) {
        console.error("Advisory Error:", err);
        res.status(500).json({ error: "Failed to generate advisory" });
    }
});

export default router;
