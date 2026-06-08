const { fetchRecipeInformation } = require('../utils/spoonacular');
const RECIPES_API_KEY = process.env.RECIPES_API_KEY;

// Fetch detailed recipe information
const getRecipeDetails = async (req, res) => {
    try {
        // Check for API key
        if (!RECIPES_API_KEY) {
            return res.status(401).json({ message: 'API key is missing' });
        }

        const recipeId = req.params.id;
        
        if (!recipeId) {
            return res.status(400).send('Recipe ID is required');
        }

        // Fetch recipe details from the API
        const recipe = await fetchRecipeInformation(recipeId, RECIPES_API_KEY);
        if (!recipe) {
            return res.status(400).send('Invalid recipe ID');
        }

        // Validate recipe data
        if (!recipe.title || !recipe.image || !recipe.servings || !recipe.readyInMinutes || !recipe.instructions || !Array.isArray(recipe.extendedIngredients)) {
            return res.status(500).send('Recipe data is incomplete');
        }

        // Render the recipe details page
        res.render('recipeInfo', {
            recipe: {
                title: recipe.title,
                image: recipe.image,
                servings: recipe.servings,
                readyInMinutes: recipe.readyInMinutes,
                instructions: recipe.instructions,
                ingredients: recipe.extendedIngredients
            }
        });
    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).send('Recipe not found');
        }
        res.status(500).send('Error fetching recipe details');
    }
};



module.exports = {
    getRecipeDetails, 
};
