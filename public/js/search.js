// --------------------------------------  SearchBar ----------------------------------//

document.addEventListener('DOMContentLoaded', () => {
    const inputBox = document.getElementById('input-box');
    const suggestionsBox = document.getElementById('suggestions');
    const searchButton = document.getElementById('search-button');
    if (!inputBox || !suggestionsBox || !searchButton) return;

    let timeoutId;
    let currentSuggestions = [];

    // Debounce function to limit the number of API calls
    function debounce(func, delay) {
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const openSuggestions = () => {
        suggestionsBox.classList.add('show');
        suggestionsBox.style.display = 'block';
        inputBox.setAttribute('aria-expanded', 'true');
    };

    const closeSuggestions = () => {
        suggestionsBox.classList.remove('show');
        suggestionsBox.style.display = 'none';
        inputBox.setAttribute('aria-expanded', 'false');
    };

    const navigateToRecipe = (id) => {
        window.location.href = `/recipes/${id}/information`;
    };

    // Function to fetch and display suggestions using the SECURE proxy endpoint
    const fetchSuggestions = async () => {
        const query = inputBox.value.trim();
        if (query.length < 2) {
            closeSuggestions();
            currentSuggestions = [];
            return;
        }

        suggestionsBox.innerHTML = '<div class="search-status">Searching...</div>';
        openSuggestions();

        try {
            // SECURE: Call our backend proxy endpoint (API key never exposed to frontend)
            const response = await axios.get('/search-suggestions', {
                params: {
                    query: query
                }
            });

            const data = response.data;

            // Clear previous suggestions
            suggestionsBox.innerHTML = '';
            currentSuggestions = Array.isArray(data) ? data : [];

            // Populate new suggestions
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(item => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    suggestionItem.textContent = item.title;
                    suggestionItem.tabIndex = 0;
                    suggestionItem.setAttribute('role', 'option');
                    suggestionItem.addEventListener('click', () => {
                        navigateToRecipe(item.id);
                    });
                    suggestionItem.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            navigateToRecipe(item.id);
                        }
                    });
                    suggestionsBox.appendChild(suggestionItem);
                });
                openSuggestions();
            } else {
                suggestionsBox.innerHTML = '<div class="error-message">No suggestions found</div>';
                openSuggestions();
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsBox.innerHTML = '<div class="error-message">Failed to load suggestions.</div>';
            openSuggestions();
        }
    };

    // Apply debounce to input event
    inputBox.addEventListener('input', debounce(fetchSuggestions, 300));

    // Fetch suggestions when the search button is clicked
    searchButton.addEventListener('click', async () => {
        await fetchSuggestions();
        if (currentSuggestions.length > 0) {
            navigateToRecipe(currentSuggestions[0].id);
        }
    });

    // Enter key goes to the first match for a quick-search flow.
    inputBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSuggestions.length > 0) {
                navigateToRecipe(currentSuggestions[0].id);
            }
        }
    });

    // Hide suggestions when the input loses focus
    inputBox.addEventListener('blur', () => {
        setTimeout(() => {
            closeSuggestions();
        }, 200);
    });

    inputBox.addEventListener('focus', () => {
        if (suggestionsBox.children.length > 0) {
            openSuggestions();
        }
    });
});
