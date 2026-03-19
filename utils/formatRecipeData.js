// utils/formatRecipeData.js

function formatRecipeData(recipe) {
    return {
      id: recipe.id.toString(),
      spoonacularId: recipe.id.toString(),
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions || '',
      servings: recipe.servings,
      readyInMinutes: recipe.readyInMinutes,
      ingredients: recipe.extendedIngredients?.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      })) || [],
      numberOfIngredients: recipe.extendedIngredients ? recipe.extendedIngredients.length : 0
    };
  }
  
  module.exports = formatRecipeData;
  