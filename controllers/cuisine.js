// controllers/cuisine.js
const axios = require('axios');
const Recipe = require('../models/Recipe');
const { fetchRecipeInformation } = require('../utils/spoonacular');
const RECIPES_API_KEY = process.env.RECIPES_API_KEY;

const toViewRecipe = (recipe) => ({
    title: recipe.title || 'Recipe',
    image: recipe.image || '/image/placeholder.png',
    servings: Number(recipe.servings) || 0,
    readyInMinutes: Number(recipe.readyInMinutes) || 0,
    instructions: recipe.instructions || recipe.directions || 'Instructions are not available yet.',
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
});

const cuisineKeywordMap = {
    african: ['jollof', 'tagine', 'stew', 'plantain', 'suya', 'injera'],
    american: ['burger', 'bbq', 'mac', 'sandwich', 'pancake', 'casserole'],
    asian: ['noodle', 'rice', 'curry', 'ramen', 'stir fry', 'dumpling', 'teriyaki'],
    mexican: ['taco', 'enchilada', 'quesadilla', 'burrito', 'salsa', 'guacamole'],
};

const mapDbRecipe = (recipe) => ({
    id: (recipe.spoonacularId || recipe._id).toString(),
    title: recipe.title,
    image: recipe.image,
});

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCuisineFallbackRecipes = async (type, count = 6) => {
    const normalizedType = String(type || '').toLowerCase();
    const keywords = cuisineKeywordMap[normalizedType] || ['recipe'];
    const keywordRegex = new RegExp(keywords.map(escapeRegExp).join('|'), 'i');

    let recipes = await Recipe.aggregate([
        {
            $match: {
                image: { $exists: true, $ne: null },
                title: { $regex: keywordRegex },
            },
        },
        { $sample: { size: count } },
    ]);

    if (recipes.length < count) {
        const remaining = count - recipes.length;
        const extra = await Recipe.aggregate([
            { $match: { image: { $exists: true, $ne: null } } },
            { $sample: { size: remaining } },
        ]);
        recipes = recipes.concat(extra);
    }

    return recipes.map(mapDbRecipe);
};

const getCuisineRecipes = async (req, res) => {
    const type = req.params.type;
    const apiKey =  RECIPES_API_KEY;

    if (!apiKey) {
        return res.status(500).send('API Key is not defined');
    }

    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
            params: {
                cuisine: type,
                number: 6,
                instructionsRequired: true,
                sort: 'random',
                apiKey: apiKey
            }
        });
        const recipes = response.data.results;
        res.render('cuisine', { recipes, type });
    } catch (error) {
        console.error('Error fetching cuisine recipes:', {
            cuisineType: type,
            status: error.response?.status,
            message: error.message,
        });
        try {
            const recipes = await getCuisineFallbackRecipes(type, 6);
            res.render('cuisine', { recipes, type });
        } catch (fallbackError) {
            console.error('Cuisine fallback failed:', fallbackError.message);
            res.status(500).send('Error fetching recipes');
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
                console.warn('Spoonacular cuisine details failed, trying DB fallback:', apiError.response?.status || apiError.message);
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
    getCuisineRecipes,
    getRecipeDetails,
};
