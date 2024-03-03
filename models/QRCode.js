const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    content: { type: String, required: true },
    imagePath: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const QRCode = mongoose.model('QRCode', qrCodeSchema);
module.exports = QRCode;
