const express = require('express');
const QRCode = require('qrcode');
const QRCodeModel = require('../models/QRCode');
const authMiddleware = require('../middleware/authMiddleware');
const { getAsync, setAsync } = require('../config/redisClient');
const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { content } = req.body;
        const qrCodeDataURL = await QRCode.toDataURL(content);

        const newQRCode = new QRCodeModel({
            content,
            imagePath: qrCodeDataURL
        });

        await newQRCode.save();
        res.status(201).json(newQRCode);
    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).json({ message: "Error generating QR code", error: error.toString() });
    }
});

router.get('/', async (req, res) => {
    try {
        const cacheKey = `qrcodes:${req.user.id}`;
        const cachedQRs = await getAsync(cacheKey);

        if (cachedQRs) {
            return res.json(JSON.parse(cachedQRs));
        }

        const qrCodes = await QRCodeModel.find({ createdBy: req.user.id });
        await setAsync(cacheKey, JSON.stringify(qrCodes), 'EX', 3600);

        res.json(qrCodes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching QR codes", error: error.message });
    }
});

router.patch('/:id', async (req, res) => {
    const { content } = req.body;
    const qrCodeId = req.params.id;
    try {
        const qrCode = await QRCodeModel.findById(qrCodeId);
        if (!qrCode) {
            return res.status(404).json({ message: "QR Code not found" });
        }
        if (qrCode.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "User not authorized to update this QR code" });
        }
        const qrCodeDataURL = await QRCode.toDataURL(content);
        const updatedQRCode = await QRCodeModel.findByIdAndUpdate(qrCodeId, { content, imagePath: qrCodeDataURL }, { new: true });

        await setAsync(`qrcodes:${req.user.id}`, "", "EX", 1);

        res.json(updatedQRCode);
    } catch (error) {
        res.status(500).json({ message: "Error updating QR code", error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const qrCodeId = req.params.id;
    try {
        const qrCode = await QRCodeModel.findById(qrCodeId);
        if (!qrCode) {
            return res.status(404).json({ message: "QR Code not found" });
        }
        if (qrCode.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "User not authorized to delete this QR code" });
        }
        await QRCodeModel.findByIdAndDelete(qrCodeId);

        await setAsync(`qrcodes:${req.user.id}`, "", "EX", 1);

        res.json({ message: "QR Code deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting QR code", error: error.message });
    }
});

module.exports = router;
