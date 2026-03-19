const axios = require('axios');

// SECURE: Proxy endpoint for search suggestions (API key never exposed)
exports.searchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const apiKey = process.env.RECIPES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API configuration error' });
    }

    const response = await axios.get('https://api.spoonacular.com/recipes/autocomplete', {
      params: {
        query: query.trim(),
        number: 5,
        apiKey: apiKey
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Search suggestions error:', error.message);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};


