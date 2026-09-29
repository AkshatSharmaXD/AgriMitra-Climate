import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    res.json({ message: "Voice endpoint coming soon" });
});

export default router;
