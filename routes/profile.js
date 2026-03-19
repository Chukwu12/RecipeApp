const express = require("express");
const router = express.Router();
const profileController = require('../controllers/profile');
const createController = require("../controllers/create");
const upload = require('../middleware/multer');
 const { ensureAuth } = require("../middleware/auth");


// Get user profile
router.get("/", ensureAuth, profileController.getProfile);

// Update profile image
router.post("/updateProfileImage", ensureAuth, upload.single("profileImage"), profileController.updateProfileImage);


// Like Recipe
router.put("/likeRecipe/:id", profileController.likeRecipe);


// Delete Recipe
router.delete('/recipe/favoriteRecipe/:id', ensureAuth, profileController.deleteFavorite);



// Toggle add/remove favorite by Spoonacular ID
router.post("/recipe/favoriteRecipe/:id", ensureAuth, profileController.toggleFavorite);

// Fetch  Triva Questions
router.get('/profile', ensureAuth, createController.foodFacts);

 //Enables user to create post w/ cloudinary for media uploads
 router.post("/createRecipe", upload.single("file"), profileController.createRecipe);


module.exports = router;