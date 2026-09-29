import express from 'express';
import axios from 'axios';

const router = express.Router();
router.get('/', async (req, res): Promise<any> => {
    const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
    if (!DATA_GOV_API_KEY) {
        return res.status(503).json({ error: "Market data service is not configured (API key missing)." });
    }

    const state = req.query.state as string || 'Rajasthan';
    const commodity = req.query.commodity as string || 'Wheat';

    const apiUrl = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

    try {
        const response = await axios.get(apiUrl, {
            params: {
                'api-key': DATA_GOV_API_KEY,
                'format': 'json',
                'offset': 0,
                'limit': 500,
                'filters[state]': state,
                'filters[commodity]': commodity
            }
        });

        const data = response.data;
        const records = data.records || [];

        if (records.length === 0) {
            return res.status(404).json({
                error: `No live prices found for ${commodity} in ${state}.`
            });
        }

        // Process and Sort
        const processedPrices = records
            .map((record: any) => ({
                district: record.district || "N/A",
                market_name: record.market || "N/A",
                modal_price: parseFloat(record.modal_price) || 0,
                arrival_date: record.arrival_date || "N/A"
            }))
            .filter((p: any) => p.modal_price > 0)
            .sort((a: any, b: any) => b.modal_price - a.modal_price);

        if (processedPrices.length === 0) {
            return res.status(404).json({
                error: `Price data available but all zero for ${commodity} in ${state}.`
            });
        }

        const bestMandi = processedPrices[0];
        const summary = `📈 Best rate for ${commodity} in ${state} today is ₹${bestMandi.modal_price}/quintal at ${bestMandi.market_name}.`;

        res.json({
            query: { state, commodity, source: "data.gov.in (Agmarknet)" },
            summary,
            prices: processedPrices
        });

    } catch (error: any) {
        console.error("Market Data Error:", error.message);
        res.status(500).json({ error: "Failed to fetch market data", details: error.message });
    }
});

export default router;
