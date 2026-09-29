import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ML Service URL (Python backend)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.post('/', upload.single('image'), async (req: express.Request, res: express.Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' });
        return;
    }

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json(mlResponse.data);
    } catch (error: any) {
        console.error("Diagnosis Error:", error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(503).json({
            error: "ML Service unavailable",
            source: "ml-service-unavailable",
            details: error.message || String(error)
        });
    }
});

export default router;
