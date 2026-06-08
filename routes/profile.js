const express = require("express");
const router = express.Router();
const profileController = require('../controllers/profile');
const createController = require("../controllers/create");
const upload = require('../middleware/multer');
const { readLimiter, mutationLimiter } = require('../middleware/rateLimit');
 const { ensureAuth } = require("../middleware/auth");


// Get user profile
router.get('/', readLimiter, ensureAuth, profileController.getProfile);

// Update profile image
router.post('/updateProfileImage', mutationLimiter, ensureAuth, upload.single('profileImage'), profileController.updateProfileImage);


// Like Recipe
router.put('/likeRecipe/:id', mutationLimiter, profileController.likeRecipe);


// Delete Recipe
router.delete('/recipe/favoriteRecipe/:id', mutationLimiter, ensureAuth, profileController.deleteFavorite);



// Toggle add/remove favorite by Spoonacular ID
router.post('/recipe/favoriteRecipe/:id', mutationLimiter, ensureAuth, profileController.toggleFavorite);

// Fetch  Triva Questions
router.get('/profile', readLimiter, ensureAuth, createController.foodFacts);

 //Enables user to create post w/ cloudinary for media uploads
 router.post('/createRecipe', mutationLimiter, ensureAuth, upload.single('file'), profileController.createRecipe);


module.exports = router;