const express = require('express');
const router = express.Router();
const axios = require('axios');
const searchController = require('../controllers/search');
const API_KEY = process.env.RECIPES_API_KEY;
const RECIPE_DETAILS_API_URL = 'https://api.spoonacular.com/recipes/{id}/information';

// SECURE: Proxy endpoint for search suggestions (API key stays on server)
router.get('/search-suggestions', searchController.searchSuggestions);

router.get('/recipes/:id/information', async (req, res) => {
  const recipeId = req.params.id;

  try {
    const response = await axios.get(RECIPE_DETAILS_API_URL.replace('{id}', recipeId), {
      params: { apiKey: API_KEY }
    });

    const data = response.data;

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

module.exports = router;
