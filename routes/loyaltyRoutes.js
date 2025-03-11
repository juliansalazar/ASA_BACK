const express = require('express');
const router = express.Router();
const { calculatePoints } = require('../controllers/loyaltyController');
const { protect } = require('../middlewares/authMiddleware')

router.post('/calculate-points', protect, calculatePoints);

module.exports = router;