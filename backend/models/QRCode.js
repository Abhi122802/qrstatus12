const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  id: { type: String, required: true }, // The UUID from the client
  url: { type: String, required: true }, // The base64 data URL
});

module.exports = mongoose.model('QRCode', qrCodeSchema);