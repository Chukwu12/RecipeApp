const axios = require('axios');
// Define the trivia API URL
const TRIVA_API_URL = 'https://api.spoonacular.com/food/trivia/random';
const RECIPES_API_KEY  = process.env.RECIPES_API_KEY ;

const LOCAL_TRIVIA_FACTS = [
    'Tomatoes are botanically a fruit, but they are used as a vegetable in cooking.',
    'Honey is the only food that never spoils when stored properly.',
    'Peanuts are legumes, not true nuts.',
    'Cinnamon was once more valuable than gold in some ancient societies.',
    'Potatoes were the first food grown in space.',
    'Apples float in water because they are about 25 percent air.',
    'Chocolate was once used as currency by the Aztecs.',
    'Wasabi is often served as a paste because fresh wasabi is hard to preserve.',
];

const randomTriva = async (req, res) => {
    try {
        let triviaText = null;

        if (RECIPES_API_KEY) {
            try {
                // Fetch random trivia from the API
                const response = await axios.get(TRIVA_API_URL, {
                    params: {
                        apiKey: RECIPES_API_KEY
                    }
                });

                triviaText = response.data?.text || null;
            } catch (apiError) {
                console.warn('Spoonacular trivia failed, using local fallback:', apiError.response?.status || apiError.message);
            }
        }

        if (!triviaText) {
            triviaText = LOCAL_TRIVIA_FACTS[Math.floor(Math.random() * LOCAL_TRIVIA_FACTS.length)];
        }

        // Send the trivia text as the response
        res.json({ trivia: triviaText });
    } catch (error) {
        console.error('Error fetching trivia:', error.message);
        const triviaText = LOCAL_TRIVIA_FACTS[Math.floor(Math.random() * LOCAL_TRIVIA_FACTS.length)];
        res.status(200).json({ trivia: triviaText });
    }
};

module.exports = {
    randomTriva
};