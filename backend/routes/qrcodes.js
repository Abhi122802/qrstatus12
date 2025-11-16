const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');

// @route   GET /api/qrcodes
// @desc    Get all QR codes
router.get('/', async (req, res) => {
  try {
    const qrcodes = await QRCode.find({});
    res.json(qrcodes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR codes' });
  }
});

// @route   POST /api/qrcodes
// @desc    Save new QR codes
router.post('/', async (req, res) => {
  try {
    const newQRs = req.body; // Expecting an array of QR code objects
    if (!Array.isArray(newQRs) || newQRs.length === 0) {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    const savedQRs = await QRCode.insertMany(newQRs);
    res.status(201).json(savedQRs);
  } catch (error) {
    res.status(500).json({ message: 'Error saving QR codes' });
  }
});

// @route   DELETE /api/qrcodes
// @desc    Delete all QR codes
router.delete('/', async (req, res) => {
  try {
    await QRCode.deleteMany({});
    res.json({ message: 'All QR codes have been deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting QR codes' });
  }
});

module.exports = router;