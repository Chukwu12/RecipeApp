const axios = require('axios');
const { searchSuggestions } = require('../controllers/search');

jest.mock('axios');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('searchController.searchSuggestions', () => {
  const originalApiKey = process.env.RECIPES_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RECIPES_API_KEY = 'test-api-key';
  });

  afterAll(() => {
    process.env.RECIPES_API_KEY = originalApiKey;
  });

  it('returns 400 when query is missing', async () => {
    const req = { query: {} };
    const res = createRes();

    await searchSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Query must be at least 2 characters' });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns 400 when query is shorter than 2 chars after trim', async () => {
    const req = { query: { query: ' a ' } };
    const res = createRes();

    await searchSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Query must be at least 2 characters' });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns 500 when API key is missing', async () => {
    process.env.RECIPES_API_KEY = '';
    const req = { query: { query: 'chicken' } };
    const res = createRes();

    await searchSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'API configuration error' });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns suggestions on success', async () => {
    const req = { query: { query: '  pasta  ' } };
    const res = createRes();
    const suggestions = [{ id: 1, title: 'Pasta' }];

    axios.get.mockResolvedValue({ data: suggestions });

    await searchSuggestions(req, res);

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spoonacular.com/recipes/autocomplete',
      {
        params: {
          query: 'pasta',
          number: 5,
          apiKey: 'test-api-key'
        }
      }
    );
    expect(res.json).toHaveBeenCalledWith(suggestions);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 500 when axios request fails', async () => {
    const req = { query: { query: 'salad' } };
    const res = createRes();

    axios.get.mockRejectedValue(new Error('Network failure'));

    await searchSuggestions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch suggestions' });
  });
});
