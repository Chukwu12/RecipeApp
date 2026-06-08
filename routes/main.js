const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe');
const dessertController = require('../controllers/dessert');
const healthController = require('../controllers/health');
const { getRandomWineData } = require('../controllers/wine');
const User = require('../models/User');
const Like = require('../models/Like');
const { readLimiter } = require('../middleware/rateLimit');
const { ensureAuth } = require('../middleware/auth');

router.get('/recipe', readLimiter, ensureAuth, async (req, res) => {
  try {
    // Fetch data from each controller
    const recipes = await recipeController.getRandomRecipes();
    const desserts = await dessertController.getDessertRecipes();
    const healthyRecipes = await healthController.getHealthRecipes();
    const wineData = await getRandomWineData();
    const likedRecipes = await Like.find({ user: req.user._id }).select('recipe');
    const likedRecipeIds = likedRecipes
    .map(like => like.recipe ? like.recipe.toString() : null)
    .filter(id => id !== null);
  

    // Combine the data
    const combinedData = {
      recipes: recipes || [],  // Ensure default if no recipes found
      desserts: desserts || [],
      healthyRecipes: healthyRecipes || [],
      wine: wineData,
      user: req.user || null,
      likedRecipeIds,  // Pass user data if needed
    };

    // Log fetched data for debugging
    // console.log('Fetched recipes:', recipes);
    // console.log('Fetched desserts:', desserts);
    // console.log('Fetched health tips:', healthTips);

    // Render the EJS template with the combined data
    res.render('recipe', combinedData);
  } catch (error) {
    console.error('Error rendering page:', error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
