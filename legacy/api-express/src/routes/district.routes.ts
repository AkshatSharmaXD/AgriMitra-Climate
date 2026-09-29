import express from 'express';
import { Type } from '@google/genai';
import { getDistrictSummaries } from '../services/district.service';
import { generateJSON } from '../services/gemini.service';

const router = express.Router();

router.get('/summary', async (req, res): Promise<any> => {
    try {
        const summaries = await getDistrictSummaries();
        res.json(summaries);
    } catch (err: any) {
        console.error("District Summary Error:", err);
        res.status(500).json({ error: "Failed to generate district summary" });
    }
});

const interventionSchema = {
    type: Type.OBJECT,
    properties: {
        interventions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    priority: { type: Type.STRING },
                    action: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                },
                required: ["priority", "action", "reasoning"]
            }
        }
    },
    required: ["interventions"]
};

router.post('/interventions', async (req, res): Promise<any> => {
    try {
        const { district, data } = req.body;
        if (!district || !data) {
            return res.status(400).json({ error: "District and data are required" });
        }

        const prompt = `
District: ${district}
Farm Count: ${data.farmCount}
Risk Band Counts: ${JSON.stringify(data.riskBandCounts)}
Dominant Crop: ${data.dominantCrop}
Water Stress Level: ${data.waterStressLevel}
Disease Occurrences: ${JSON.stringify(data.diseaseOccurrences)}

Provide 3-5 prioritized agricultural interventions for the district based on the given computed signals.
Do not restate the counts. Just provide actions and reasoning.
`;

        try {
            const aiResponse = await generateJSON<any>(prompt, interventionSchema);
            res.json({
                ...aiResponse,
                disclaimer: "AI output is decision support, not automatic government decision."
            });
        } catch (error: any) {
            if (error.message === "GEMINI_API_KEY_NOT_SET" || error.message.includes("API_KEY") || !process.env.GEMINI_API_KEY) {
                return res.json({
                    interventions: [
                        { priority: "High", action: "Review irrigation policies", reasoning: "Based on general district metrics." },
                        { priority: "Medium", action: "Deploy extension workers", reasoning: "Assist with dominant crop issues." }
                    ],
                    disclaimer: "AI output is decision support, not automatic government decision."
                });
            }
            throw error;
        }
    } catch (err: any) {
        console.error("District Intervention Error:", err);
        res.status(500).json({ error: "Failed to generate interventions" });
    }
});

export default router;
