const express = require('express');
const { calculatePoints } = require('../controllers/loyaltyController');
const router = express.Router();

router.post('/calculate-points', calculatePoints);

module.exports = router;