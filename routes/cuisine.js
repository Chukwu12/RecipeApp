const express = require('express');
const router = express.Router();
const { getCuisineRecipes } = require('../controllers/cuisine'); // Destructure both functions
const cuisineController = require('../controllers/cuisine');
const { readLimiter } = require('../middleware/rateLimit');


// Route to get recipes by cuisine type
router.get('/details/:id', readLimiter, cuisineController.getRecipeDetails);
router.get('/:type', readLimiter, getCuisineRecipes);

module.exports = router;
