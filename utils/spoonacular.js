const axios = require('axios');

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

const normalizeRecipeId = (value) => {
  const id = String(value || '').trim();
  return /^\d{1,12}$/.test(id) ? id : null;
};

const buildRecipeInfoUrl = (recipeId) => {
  const normalized = normalizeRecipeId(recipeId);
  if (!normalized) {
    return null;
  }

  return new URL(`/recipes/${normalized}/information`, SPOONACULAR_BASE_URL).toString();
};

const fetchRecipeInformation = async (recipeId, apiKey) => {
  const url = buildRecipeInfoUrl(recipeId);
  if (!url) {
    return null;
  }

  const response = await axios.get(url, {
    params: { apiKey },
  });

  return response.data;
};

module.exports = {
  normalizeRecipeId,
  buildRecipeInfoUrl,
  fetchRecipeInformation,
};