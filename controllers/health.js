// controllers/healthController.js
const axios = require('axios');
const RECIPES_API_KEY = process.env.RECIPES_API_KEY;
const { RANDOM_API_URL } = require('../config/api');
const formatRecipeData = require('../utils/formatRecipeData.js');
const Recipe = require('../models/Recipe');
const { fetchRecipeInformation } = require('../utils/spoonacular');

const toViewRecipe = (recipe) => ({
  title: recipe.title || 'Recipe',
  image: recipe.image || '/image/placeholder.png',
  servings: Number(recipe.servings) || 0,
  readyInMinutes: Number(recipe.readyInMinutes) || 0,
  instructions: recipe.instructions || recipe.directions || 'Instructions are not available yet.',
  ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
});

const mapDbRecipe = (recipe) => ({
  id: (recipe.spoonacularId || recipe._id).toString(),
  spoonacularId: (recipe.spoonacularId || recipe._id).toString(),
  title: recipe.title,
  image: recipe.image,
  instructions: recipe.instructions || recipe.directions || '',
  servings: recipe.servings || 0,
  readyInMinutes: recipe.readyInMinutes || 0,
  ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
  numberOfIngredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0,
});

const getHealthFallbackRecipes = async (count = 5) => {
  const healthyKeywords = [
    'salad',
    'vegetarian',
    'vegan',
    'grilled',
    'roasted',
    'soup',
    'stir fry',
    'bowl',
    'quinoa',
  ];

  const keywordRegex = new RegExp(healthyKeywords.join('|'), 'i');

  let fallback = await Recipe.aggregate([
    {
      $match: {
        image: { $exists: true, $ne: null },
        title: { $regex: keywordRegex },
      },
    },
    { $sample: { size: count } },
  ]);

  if (fallback.length < count) {
    const extra = await Recipe.aggregate([
      { $match: { image: { $exists: true, $ne: null } } },
      { $sample: { size: count - fallback.length } },
    ]);
    fallback = fallback.concat(extra);
  }

  return fallback.map(mapDbRecipe);
};


const getHealthRecipes = async () => {
    try {
        if (!RECIPES_API_KEY) {
            throw new Error('API key is missing');
        }

        // Fetch healthy recipes from the API
        const response = await axios.get(RANDOM_API_URL, {
            params: {
                apiKey: RECIPES_API_KEY,
                number: 5,
                tags: 'vegetarian', // Filter to only include healthy options
               
            }
        });

        const healthRecipes = response.data.recipes || [];

        return healthRecipes.map(formatRecipeData);
      } catch (error) {
        console.error('Error fetching health recipes:', error.message);
        try {
            const fallbackRecipes = await getHealthFallbackRecipes(5);
            console.warn(`Using ${fallbackRecipes.length} local fallback healthy recipes.`);
            return fallbackRecipes;
        } catch (fallbackError) {
            console.error('Health fallback failed:', fallbackError.message);
            return [];
        }
      }
    };




const getHealthyDetails = async (req, res) => {
    try {
        const recipeId = req.params.id;
  
        if (!recipeId) {
          return res.status(400).send('Recipe ID is required');
        }

        let recipeForView = null;

        // Try Spoonacular first when API key exists.
        if (RECIPES_API_KEY) {
          try {
            const details = await fetchRecipeInformation(recipeId, RECIPES_API_KEY);
            if (details) {
              recipeForView = {
                title: details.title,
                image: details.image,
                servings: details.servings,
                readyInMinutes: details.readyInMinutes,
                instructions: details.instructions,
                ingredients: Array.isArray(details.extendedIngredients) ? details.extendedIngredients : [],
              };
            }
          } catch (apiError) {
            console.warn('Spoonacular health details failed, trying DB fallback:', apiError.response?.status || apiError.message);
          }
        }

        // Fallback to MongoDB recipe data.
        if (!recipeForView) {
          const recipeIdText = String(recipeId);
          const bySpoonacularId = await Recipe.aggregate([
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$spoonacularId' }, recipeIdText],
                },
              },
            },
            { $limit: 1 },
          ]);

          let dbRecipe = bySpoonacularId[0] || null;

          if (!dbRecipe && /^[a-fA-F0-9]{24}$/.test(recipeIdText)) {
            dbRecipe = await Recipe.findById(recipeId).lean();
          }

          if (dbRecipe) {
            recipeForView = toViewRecipe(dbRecipe);
          }
        }

        if (!recipeForView) {
          return res.status(404).send('Recipe not found');
        }

        res.render('recipeInfo', { recipe: recipeForView });
    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
        res.status(500).send('Error fetching recipe details');
    }
  };


module.exports = {
    getHealthRecipes,
    getHealthyDetails,
};
