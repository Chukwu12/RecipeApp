// --------------------------------Profile Card ---------------------------------------------------------//
const header = document.getElementById('header');

if (header) {
  window.addEventListener('wheel', (event) => {
    let delta = (event.deltaY + 3) * -1;
    animate(delta > 0, delta);
  });
}

const animate = (check, delta) => {
  const MIN_HEIGHT = 80;
  const HEIGHT = 150;
  const MAX_ZOOM = 3;
  const MAX_BLUR = 3;

    if (check) {
        let blur = 1 + delta / 150 < MAX_BLUR ? Math.ceil(1 + delta / 150) : MAX_BLUR;
        let height = HEIGHT - delta / 10 > MIN_HEIGHT ? Math.ceil(HEIGHT - delta / 10) : MIN_HEIGHT;
        let zoom = 1 + delta / 200 <= MAX_ZOOM ? 1 + delta / 200 : MAX_ZOOM;
        requestAnimationFrame(() => transform(header, blur, height, zoom));
    } else {
        requestAnimationFrame(() => transform(header, 0, 150, 1));
    }
};

const transform = (element, blur, height, zoom) => {
    element.style.filter = `blur(${blur}px)`;
    element.style.height = `${height}px`;
    element.style.transform = `scale(${zoom}, ${zoom})`;
};



// =================================triva button====================//
const nextTriviaBtn = document.getElementById('next-trivia');
if (nextTriviaBtn) {
  nextTriviaBtn.addEventListener('click', async function() {
    try {
      const response = await fetch('/trivia/random');

      // If the response is not OK (i.e., status code is not 2xx), throw an error
      if (!response.ok) {
        throw new Error(`Failed to fetch trivia: ${response.statusText}`);
      }

      const data = await response.json();
      const triviaEl = document.querySelector('.trivia-question');
      if (triviaEl) triviaEl.textContent = data.trivia;
    } catch (error) {
      console.error('Error fetching trivia:', error);
      const triviaEl = document.querySelector('.trivia-question');
      if (triviaEl) triviaEl.textContent = 'Oops! Something went wrong. Please try again.';
    }
  });
}

//============================JS for uploading and saving profile image ====================//
// Function to handle profile image upload
async function uploadProfileImage(event) {
  const file = event.target.files[0];

  if (!file) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    Swal.fire({
      title: 'Invalid File Type',
      text: 'Please select a JPEG, JPG, or PNG image.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire({
      title: 'File Too Large',
      text: 'Please select an image smaller than 5MB.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }

  // Show loading state
  Swal.fire({
    title: 'Uploading...',
    text: 'Please wait while we upload your profile image.',
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('profileImage', file);

    // Upload to server
    const response = await fetch('/profile/updateProfileImage', {
      method: 'POST',
      body: formData
    });

    // Check if response is JSON or HTML (redirect)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Likely a redirect due to authentication failure
      throw new Error('Authentication required. Please log in again.');
    }

    const result = await response.json();

    if (response.ok) {
      // Update the displayed image with the new URL
      const imagePreview = document.getElementById('profile-image-display');
      imagePreview.src = result.profileImage;

      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Your profile image has been updated.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (result.message) {
        throw new Error(result.message);
      } else {
        throw new Error('Upload failed');
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
    Swal.fire({
      title: 'Upload Failed',
      text: error.message || 'There was an error uploading your image. Please try again.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

// add event listeners to the input element
const fileInput = document.getElementById('profile-image-upload');
if (fileInput) {
  fileInput.addEventListener('change', uploadProfileImage);
}
//=======================================================edit profile button ===================================================================//

Swal.mixin({
  customClass: {
    popup: 'custom-popup',
    title: 'custom-title',
    confirmButton: 'custom-confirm-btn',
    cancelButton: 'custom-cancel-btn'
  },
  buttonsStyling: false,
  background: '#fdf6f0',
  color: '#333',
  confirmButtonColor: '#8a1538'
});




//=======================================================delete favorite button ===================================================================//
 document.querySelectorAll('.remove-fav-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;

      const confirmed = await Swal.fire({
        title: 'Are you sure?',
        text: 'Remove this recipe from favorites?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'Cancel',
      });

      if (confirmed.isConfirmed) {
        try {
          const response = await fetch(`/profile/recipe/favoriteRecipe/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            Swal.fire('Removed!', 'Recipe has been removed from your favorites.', 'success')
              .then(() => window.location.reload());
          } else {
            throw new Error('Delete failed');
          }
        } catch (error) {
          Swal.fire('Error', 'Failed to remove the recipe.', 'error');
        }
      }
    });
  });
  // --------------------------------------------------------View recipe btn---------------------------------------------------//

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.view-recipe-btn').forEach(button => {
      button.addEventListener('click', () => {
        const recipe = JSON.parse(button.getAttribute('data-recipe'));
  
        Swal.fire({
          title: recipe.title,
          html: `
            <img src="${recipe.image}" alt="${recipe.title}" style="width: 100%; border-radius: 8px; margin-bottom: 10px;">
            <p><strong>Servings:</strong> ${recipe.servings}</p>
            <p><strong>Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
            <p><strong>Ingredients:</strong></p>
            <ul style="text-align: left; max-height: 150px; overflow-y: auto;">
              ${recipe.ingredients.map(ing => `
                <li>${ing.amount || ''} ${ing.unit || ''} ${ing.name || ing}</li>
              `).join('')}
            </ul>
            <p><strong>Instructions:</strong> ${recipe.instructions || 'No instructions available.'}</p>
          `,
          width: 600,
          confirmButtonText: 'Close',
          showCloseButton: true
        });
      });
    });
  });
  
// ==============================================================favoriteGlife===================================================//
// Include Glide.js library
  // Initialize Glide
    document.addEventListener('DOMContentLoaded', function () {
      const favoriteSlides = document.querySelectorAll('.favorite-glide .glide__slide');
      if (favoriteSlides.length > 0) {
        new Glide('.favorite-glide', {
          type: 'carousel',
          startAt: 0,
          perView: 3,
          autoplay: 3000,
          hoverpause: true,
          breakpoints: {
            1200: { 
              perView: 3 },
            992: {
              perView: 2 // For tablets and small laptops
            },
            768: {
              perView: 1 // For mobile and small tablets
            }
          }
        }).mount();
      }
    });

//========================================================Create Recipe===================================================================//

  function addIngredient() {
    const list = document.getElementById("ingredientsList");
    const input = document.createElement("input");
    input.type = "text";
    input.name = "ingredients[]";
    input.placeholder = "e.g., Ingredient";
    input.className = "form-control mb-2";
    input.required = true;
    list.appendChild(input);
  }

  // Optional: Submit loader + disable button
  document.getElementById("recipeForm").addEventListener("submit", function (e) {
    Swal.fire({
      title: "Creating Recipe...",
      html: "Please wait while we save your recipe.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  });

   // ✅ Show success or error alert after redirect
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  const error = params.get('error');

  if (success) {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: success
    });
  }

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error
    });
  }

  // 🚿 Clean the URL so the message doesn't show again on refresh
  if (success || error) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
