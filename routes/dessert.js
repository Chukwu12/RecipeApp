// routes/recipe.js
const express = require('express');
const router = express.Router();
const dessertController = require('../controllers/dessert');
const { readLimiter } = require('../middleware/rateLimit');

// Route to fetch dessert recipe details by ID
router.get('/recipeInfo/:id', readLimiter, dessertController.getRecipeDetails);

module.exports = router;
