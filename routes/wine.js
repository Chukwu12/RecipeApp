const express = require('express');
const router = express.Router();
const { getRandomWineData } = require('../controllers/wine');
const { readLimiter } = require('../middleware/rateLimit');

router.get('/random-wine-pairing', readLimiter, getRandomWineData);

module.exports = router;
