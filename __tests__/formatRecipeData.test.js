const formatRecipeData = require('../utils/formatRecipeData');

describe('formatRecipeData', () => {
  it('formats a full recipe payload', () => {
    const recipe = {
      id: 12345,
      title: 'Chicken Soup',
      image: 'https://example.com/chicken-soup.jpg',
      instructions: 'Boil and serve.',
      servings: 4,
      readyInMinutes: 35,
      extendedIngredients: [
        { name: 'chicken', amount: 1, unit: 'lb' },
        { name: 'water', amount: 4, unit: 'cups' }
      ]
    };

    const result = formatRecipeData(recipe);

    expect(result).toEqual({
      id: '12345',
      spoonacularId: '12345',
      title: 'Chicken Soup',
      image: 'https://example.com/chicken-soup.jpg',
      instructions: 'Boil and serve.',
      servings: 4,
      readyInMinutes: 35,
      ingredients: [
        { name: 'chicken', amount: 1, unit: 'lb' },
        { name: 'water', amount: 4, unit: 'cups' }
      ],
      numberOfIngredients: 2
    });
  });

  it('uses defaults when optional fields are missing', () => {
    const recipe = {
      id: 999,
      title: 'Minimal Recipe',
      image: null,
      servings: 1,
      readyInMinutes: 5
    };

    const result = formatRecipeData(recipe);

    expect(result.instructions).toBe('');
    expect(result.ingredients).toEqual([]);
    expect(result.numberOfIngredients).toBe(0);
    expect(result.id).toBe('999');
    expect(result.spoonacularId).toBe('999');
  });
});
