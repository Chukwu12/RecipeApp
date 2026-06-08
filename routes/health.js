// routes/health.js
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health');
const { readLimiter } = require('../middleware/rateLimit');

// Route to get random vegetarian recipes
router.get('/recipeInfo/:id', readLimiter, healthController.getHealthyDetails);

module.exports = router;
