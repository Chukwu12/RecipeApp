// --------------------------------------  SearchBar ----------------------------------//

document.addEventListener('DOMContentLoaded', () => {
    const inputBox = document.getElementById('input-box');
    const suggestionsBox = document.getElementById('suggestions');
    const searchButton = document.getElementById('search-button');
    let timeoutId;

    // Debounce function to limit the number of API calls
    function debounce(func, delay) {
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Function to fetch and display suggestions using the SECURE proxy endpoint
    const fetchSuggestions = async () => {
        const query = inputBox.value.trim();
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

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

            // Populate new suggestions
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(item => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    suggestionItem.textContent = item.title;
                    suggestionItem.tabIndex = 0;
                    suggestionItem.addEventListener('click', () => {
                          window.location.href = `/recipes/${item.id}/information`;
                    });
                    suggestionItem.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                             window.location.href = `/recipes/${item.id}/information`;
                        }
                    });
                    suggestionsBox.appendChild(suggestionItem);
                });
                suggestionsBox.style.display = 'block';
            } else {
                suggestionsBox.innerHTML = '<div class="error-message">No suggestions found</div>';
                suggestionsBox.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            suggestionsBox.innerHTML = '<div class="error-message">Failed to load suggestions.</div>';
            suggestionsBox.style.display = 'block';
        }
    };

    // Apply debounce to input event
    inputBox.addEventListener('input', debounce(fetchSuggestions, 300));

    // Fetch suggestions when the search button is clicked
    searchButton.addEventListener('click', fetchSuggestions);

    // Hide suggestions when the input loses focus
    inputBox.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsBox.style.display = 'none';
        }, 200);
    });
});
