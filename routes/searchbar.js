const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');
const { fetchRecipeInformation } = require('../utils/spoonacular');
const API_KEY = process.env.RECIPES_API_KEY;

// SECURE: Proxy endpoint for search suggestions (API key stays on server)
router.get('/search-suggestions', searchController.searchSuggestions);

router.get('/recipes/:id/information', async (req, res) => {
  const recipeId = req.params.id;

  try {
    const details = await fetchRecipeInformation(recipeId, API_KEY);
    if (!details) {
      return res.status(400).send('Invalid recipe ID');
    }

    const data = details;

    // Format the recipe object for the view
    const recipe = {
      title: data.title,
      image: data.image,
      servings: data.servings,
      readyInMinutes: data.readyInMinutes,
      instructions: data.instructions || '',
      ingredients: (data.extendedIngredients || []).map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      }))
    };

    res.render('recipeInfo', { recipe });
  } catch (error) {
    console.error('❌ Error loading recipe info:', error.message);
    res.status(500).send('Error loading recipe information');
  }
});

module.exports = router;
