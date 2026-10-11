const axios = require('axios');
const Recipe = require('../models/Recipe');
const formatRecipeData = require('../utils/formatRecipeData');
const { RECIPES_API_URL, DESSERT_API_URL, HEALTHY_API_URL } = require('../config/api');
const RECIPES_API_KEY = process.env.RECIPES_API_KEY;

// Fetch random recipes from MongoDB and Spoonacular
const getRandomRecipes = async () => {
  try {
    const requiredRecipes = 5;

    let recipes = await Recipe.aggregate([
      { $match: { image: { $exists: true, $ne: null } } },
      { $sample: { size: requiredRecipes } }
    ]);

    if (recipes.length < requiredRecipes) {
      const remaining = requiredRecipes - recipes.length;

      const response = await axios.get(RECIPES_API_URL, {
        params: {
          apiKey: RECIPES_API_KEY,
          number: remaining,
          includeNutrition: true,
          limitLicense: true,
        }
      });

      const apiRecipes = (response.data.recipes || []).filter(r => r.image);
      const formatted = apiRecipes.map(formatRecipeData);

      const savedRecipes = await Recipe.insertMany(formatted, { ordered: false });

      recipes = recipes.concat(savedRecipes);
    }

    return recipes.map(formatRecipeData);
  } catch (err) {
    console.error('Error fetching random recipes:', err.message);
    return [];
  }
};

// Fetch dessert recipes from Spoonacular
const getDessertRecipes = async () => {
  try {
    const response = await axios.get(DESSERT_API_URL, {
      params: {
        apiKey: RECIPES_API_KEY,
        number: 5,
        tags: 'dessert',
      }
    });

    const recipes = response.data.recipes || [];
    return recipes.map(formatRecipeData);
  } catch (err) {
    console.error('Error fetching dessert recipes:', err.message);
    return [];
  }
};

// Fetch healthy recipes from Spoonacular
const getHealthRecipes = async () => {
  try {
    const response = await axios.get(HEALTHY_API_URL, {
      params: {
        apiKey: RECIPES_API_KEY,
        number: 5,
        tags: 'vegetarian',
      }
    });

    const recipes = response.data.recipes || [];
    return recipes.map(formatRecipeData);
  } catch (err) {
    console.error('Error fetching health recipes:', err.message);
    return [];
  }
};

// Combine all 3 recipe types and send to main page
const combinedData = async (req, res) => {
  try {
    const [randomRecipes, dessertRecipes, healthRecipes] = await Promise.all([
      getRandomRecipes(),
      getDessertRecipes(),
      getHealthRecipes()
    ]);

    res.render('recipe.ejs', {
      randomRecipes,
      dessertRecipes,
      healthRecipes,
      user: req.user || null,
      likedRecipeIds: [],
    });
  } catch (err) {
    console.error('Error rendering recipe page:', err.message);
    res.status(500).send('Error loading recipes');
  }
};

module.exports = {
  getRandomRecipes,
  getDessertRecipes,
  getHealthRecipes,
  combinedData
};
