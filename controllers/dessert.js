// controllers/dessertController.js
const axios = require('axios');
const { RANDOM_API_URL } = require('../config/api');
const RECIPES_API_KEY = process.env.RECIPES_API_KEY;
const formatRecipeData = require('../utils/formatRecipeData.js');
const Recipe = require('../models/Recipe');
const RECIPE_DETAILS_API_URL = 'https://api.spoonacular.com/recipes/{id}/information';

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

const getDessertFallbackRecipes = async (count = 5) => {
  const dessertKeywords = [
    'dessert',
    'cake',
    'pie',
    'cookie',
    'chocolate',
    'pudding',
    'brownie',
    'ice cream',
    'tart',
  ];

  const keywordRegex = new RegExp(dessertKeywords.join('|'), 'i');

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

// require('dotenv').config({ path: './config/.env' });

const getDessertRecipes = async () => {
    try {
        if (!RECIPES_API_KEY) {
            throw new Error('API key is missing');
        }

        const response = await axios.get(RANDOM_API_URL, {
            params: {
                apiKey: RECIPES_API_KEY,
                number: 5,
                tags: 'dessert', // Filter to only include desserts       
            }
        });

        const recipes = response.data.recipes || [];

        return recipes.map(formatRecipeData);
      } catch (error) {
        console.error('Error fetching dessert recipes:', error.message);
        try {
            const fallbackRecipes = await getDessertFallbackRecipes(5);
            console.warn(`Using ${fallbackRecipes.length} local fallback dessert recipes.`);
            return fallbackRecipes;
        } catch (fallbackError) {
            console.error('Dessert fallback failed:', fallbackError.message);
            return [];
        }
      }
    };
    


   
   

// Fetch detailed recipe information
const getRecipeDetails = async (req, res) => {
    try {
        const recipeId = req.params.id;
  
        if (!recipeId) {
          return res.status(400).send('Recipe ID is required');
        }

        let recipeForView = null;

        // Try Spoonacular first when API key exists.
        if (RECIPES_API_KEY) {
          try {
            const response = await axios.get(RECIPE_DETAILS_API_URL.replace('{id}', recipeId), {
              params: {
                apiKey: RECIPES_API_KEY,
              }
            });

            const recipe = response.data || {};
            recipeForView = {
              title: recipe.title,
              image: recipe.image,
              servings: recipe.servings,
              readyInMinutes: recipe.readyInMinutes,
              instructions: recipe.instructions,
              ingredients: Array.isArray(recipe.extendedIngredients) ? recipe.extendedIngredients : [],
            };
          } catch (apiError) {
            console.warn('Spoonacular dessert details failed, trying DB fallback:', apiError.response?.status || apiError.message);
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
    getDessertRecipes,
    getRecipeDetails,
};
