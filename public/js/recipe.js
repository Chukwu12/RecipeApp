// ===================================like button models =====================================//
// Function to handle the "Like" button click and form submission

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-like-recipe-id]').forEach(button => {
    button.addEventListener('click', () => {
      const recipeId = button.getAttribute('data-like-recipe-id');
      likeRecipe(recipeId, button);
    });
  });
});

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';


function likeRecipe(recipeId, button) {
  const actionUrl = `/recipe/likeRecipe/${recipeId}`;

  fetch(actionUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({})
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to like recipe');
      return res.json();
    })
    .then(data => {
      Swal.fire({
        title: 'Liked!',
        text: data.message || 'Recipe liked successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      // ✅ Update the like button in the DOM
      const btn = document.querySelector(`button[onclick="likeRecipe('${recipeId}')"]`);
      if (btn) {
        btn.classList.add('liked'); // optional: CSS class
        btn.disabled = true;

        // Update heart icon color
        const heartIcon = btn.querySelector('i');
        if (heartIcon) {
          heartIcon.classList.remove('custom-icon2');
          heartIcon.classList.add('text-danger'); // or your liked color
        }

        // Optional: replace onclick to prevent accidental clicks
        btn.removeAttribute('onclick');
      }
    })
    .catch(err => {
      console.error('Like error:', err);
      Swal.fire({
        title: 'Error',
        text: 'There was an error liking this recipe.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    });
}

  
  
  
  
  
  // Function to handle the "Favorite" button click and form submission
  function favoriteRecipe(recipeId) {
      const button = document.querySelector(`#favorite-form-${recipeId} button`);
      const icon = button.querySelector('i');
  
      // Disable button to prevent multiple clicks
      button.disabled = true;
  
      fetch(`/recipe/favoriteRecipe/${recipeId}`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': csrfToken,
          },
      })
          .then(response => response.json())
          .then(data => {
              if (data.message) {
                  Swal.fire({
                      title: 'Success!',
                      text: data.message,
                      icon: 'success',
                      confirmButtonText: 'OK'
                  });
                  // Update the icon to show it's favorited (gold star)
                  icon.classList.remove('fa-star');           // regular star
                  icon.classList.add('fa-star', 'text-warning'); // filled star with gold/yellow color
              } else {
                  // Re-enable the button if something went wrong
                  button.disabled = false;
              }
          })
          .catch(error => {
              console.error('Error:', error);
              Swal.fire({
                  title: 'Error',
                  text: 'There was an error adding this recipe to your favorites. Please try again.',
                  icon: 'error',
                  confirmButtonText: 'OK'
              });
  
              // Re-enable the button so user can try again
              button.disabled = false;
          });
  }

