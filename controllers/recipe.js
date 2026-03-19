// controllers/recipe.js
const axios = require('axios');
const Favorite = require("../models/Favorite");
const Recipe = require("../models/Recipe"); // Assuming you have a Recipe model
// const User = require('../models/User');
const formatRecipeData = require('../utils/formatRecipeData.js');
const RECIPES_API_KEY = process.env.RECIPES_API_KEY;
const RECIPES_API_URL = 'https://api.spoonacular.com/recipes/random';
const RECIPE_DETAILS_API_URL = 'https://api.spoonacular.com/recipes/{id}/information';
// const API_KEY = process.env.API_KEY;


// Helper: Ensure a recipe has a populated ingredients array
const ensureIngredients = async (recipe) => {
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    const id = recipe.spoonacularId || recipe.id;
    if (!id) return recipe;

    try {
      const response = await axios.get(RECIPE_DETAILS_API_URL.replace('{id}', id), {
        params: { apiKey: RECIPES_API_KEY }
      });

      const apiIngredients = (response.data.extendedIngredients || []).map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit || ""
      }));

      if (apiIngredients.length > 0) {
        await Recipe.updateOne({ _id: recipe._id }, { $set: { ingredients: apiIngredients } });
        recipe.ingredients = apiIngredients;
      }
    } catch (error) {
      console.warn(`Could not enrich recipe ${id} with ingredients:`, error.message);
    }
  }

  return recipe;
};

const getRandomRecipes = async () => {
    try {
        const requiredRecipes = 5;

        // Step 1: Fetch recipes from MongoDB
        let recipes = await Recipe.aggregate([
            { $match: { image: { $exists: true, $ne: null } } }, // Ensure recipes have an image
            { $sample: { size: requiredRecipes } }              // Get a random sample
        ]);

        // Step 2: If MongoDB doesn't have enough recipes, fetch from the API
        if (recipes.length < requiredRecipes) {
            console.log(`Found ${recipes.length} recipes in MongoDB. Fetching more from API...`);

            const remainingCount = requiredRecipes - recipes.length;

            const response = await axios.get(RECIPES_API_URL, {
                params: {
                    apiKey: RECIPES_API_KEY,
                    number: remainingCount,
                    includeNutrition: true,
                    limitLicense: true,
                }
            });
            const apiRecipes = response.data.recipes.filter(recipe => recipe.image);
            const formattedApiRecipes = apiRecipes.map(formatRecipeData);
      
            await Recipe.insertMany(formattedApiRecipes, { ordered: false });
            recipes = recipes.concat(formattedApiRecipes);
        }

        // Ensure each recipe has ingredients for display
        recipes = await Promise.all(recipes.map(ensureIngredients));

        // Step 3: Return the final combined list of recipes
        return recipes;
    } catch (error) {
        console.error('Error fetching random recipes:', error.message);
        throw new Error(error.message);
    }
};


module.exports = { getRandomRecipes };




// Fetch detailed recipe information
const getRecipeDetails = async (req, res) => {
    try {
         console.log('Fetching recipe with ID:', req.params.id); 
        // Check for API key
        if (!RECIPES_API_KEY) {
            return res.status(401).json({ message: 'API key is missing' });
        }
        const recipeId = req.params.id;

        if (!recipeId) {
            return res.status(400).send('Recipe ID is required');
        }

        // Fetch recipe details from the API
        const response = await axios.get(RECIPE_DETAILS_API_URL.replace('{id}', recipeId), {
            params: {
                apiKey: RECIPES_API_KEY,
            }
        });

        const recipe = response.data;


        // Validate that the recipe data contains the expected fields
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
        res.status(500).send('Error fetching recipe details');
    }
};


const favoriteRecipe = async (req, res) => {
    try {
        const userId = req.user?.id;
        const  recipeId  = req.params.id;

        console.log('🔸 User ID:', userId);
        console.log('🔸 Recipe ID Param:', recipeId);

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 1. Look up recipe by spoonacularId
        let recipe = await Recipe.findOne({ spoonacularId: recipeId });

        // 2. If not found, fetch from Spoonacular API and save locally
        if (!recipe) {
            const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
                params: { apiKey: RECIPES_API_KEY },
            });

            if (response && response.data) {
                const apiRecipe = response.data;

                // Create and save new recipe
                recipe = await Recipe.create({
                    spoonacularId: apiRecipe.id.toString(), // Ensure it's a string
                    title: apiRecipe.title,
                    name: apiRecipe.title, // Used because 'name' is required by schema
                    image: apiRecipe.image,
                    instructions: apiRecipe.instructions || '',
                    directions: apiRecipe.instructions || '',
                    servings: apiRecipe.servings,
                    readyInMinutes: apiRecipe.readyInMinutes,
                    ingredients: apiRecipe.extendedIngredients?.map(ing => ({
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit || "" 
                    })) || [],
                });
            } else {
                return res.status(404).json({ message: 'Recipe not found in Spoonacular API' });
            }
        }

        // 3. Check if favorite already exists
        const existingFavorite = await Favorite.findOne({
            user: userId,
            spoonacularId: recipe.spoonacularId,
        });

        if (existingFavorite) {
            return res.status(400).json({ message: 'You have already favorited this recipe' });
        }

        // 4. Create new favorite
        const favorite = await Favorite.create({
            user: userId,
            recipe: recipe._id,
            spoonacularId: recipe.spoonacularId,
        });

        res.status(201).json({
            message: 'Recipe has been added to favorites!',
            favorite,
        });
    } catch (error) {
        console.error('Error adding favorite:', error.message);
        res.status(500).json({ message: 'Server error while favoriting recipe' });
    }
};


const fetchFavorite = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure the user is authenticated

        // Fetch the user's favorite recipes
        const favorites = await Favorite.find({ user: userId })
            .populate('recipe', 'title image ingredients readyInMinutes servings')
            .select('createdAt spoonacularId');
        console.log(favorites);

        

        // Optional: filter out null recipes (just in case)
        const validFavorites = favorites.filter(fav => fav.recipe);

        // Render the profile page with the fetched favorites
        res.render('profile', { user: req.user, validFavorites }); // Pass `favorites` to the template
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Server error while favoriting recipe' });
    }
};



// const likeRecipe = async (req, res) => {
//     try {
//         const recipeId = req.params.id;
//         const recipe = await Recipe.findById(recipeId);

//         if (!recipe) {
//             return res.status(404).json({ message: 'Recipe not found' });
//         }

//         // Increment the like count (if likes field exists)
//         recipe.likes = (recipe.likes || 0) + 1;
//         await recipe.save();

//         res.status(200).json({ message: 'Recipe liked successfully!' });
//     } catch (error) {
//         console.error('Error liking recipe:', error);
//         res.status(500).json({ message: 'Error liking recipe' });
//     }
// };





const saveRecipe = async (recipeData) => {
    const { id, servings, readyInMinutes, instructions, ingredients, likes = 0, user, createdAt = new Date() } = recipeData;

    // Create a new Recipe instance
    const newRecipe = new Recipe({
        spoonacularId: id, // Store the Spoonacular ID as a reference
        servings,
        readyInMinutes,
        instructions,
        ingredients, // Directly assign the ingredients array
        likes,
        user,
        createdAt,
        // Other fields can be added here if needed
    });

    try {
        const savedRecipe = await newRecipe.save(); // Save to the database
        console.log('Recipe saved successfully:', savedRecipe);
        return savedRecipe; // Return the saved recipe with MongoDB's _id
    } catch (error) {
        console.error('Error saving recipe:', error.message);
        throw new Error('Could not save recipe'); // Rethrow for further handling
    }
};



// Function to get a recipe by Spoonacular ID
const getRecipeBySpoonacularId = async (spoonacularId) => {
    try {
        // Check MongoDB for the recipe first
        let recipe = await Recipe.findOne({ spoonacularId });

        if (!recipe) {
            console.log('Recipe not found in database. Fetching from API...');

            // Fetch the recipe from the API
            const response = await axios.get(`https://api.spoonacular.com/recipes/${spoonacularId}/information`, {
                params: {
                    apiKey: RECIPES_API_KEY,
                }
            });

            if (response && response.data) {
                const apiRecipe = response.data;

                // Save the recipe to MongoDB
                recipe = new Recipe({
                    spoonacularId: apiRecipe.id,
                    title: apiRecipe.title,
                    image: apiRecipe.image,
                    instructions: apiRecipe.instructions,
                    servings: apiRecipe.servings,
                    readyInMinutes: apiRecipe.readyInMinutes,
                    ingredients: apiRecipe.extendedIngredients.map(ing => ing.original),
                });

                await recipe.save();
                console.log('Recipe saved to database');
            } else {
                throw new Error('Recipe not found from API');
            }
        }

        return recipe;
    } catch (error) {
        console.error('Error retrieving recipe:', error.message);
        throw new Error(error.message);
    }
};


const deleteFavoriteRecipe = async (req, res) => {
  try {
    const { id } = req.params; // spoonacularId
    const userId = req.user._id;

    const result = await Favorite.findOneAndDelete({
      spoonacularId: id,
      user: userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (err) {
    console.error('Error deleting favorite:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};









module.exports = {
    getRandomRecipes,
    getRecipeDetails,
    favoriteRecipe,
    fetchFavorite,
    saveRecipe,
    getRecipeBySpoonacularId,
    deleteFavoriteRecipe,
};
