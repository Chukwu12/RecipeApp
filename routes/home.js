// routes/home.js
const express = require('express')
const router = express.Router()
const authController = require("../controllers/auth");
const homeController = require('../controllers/home');
const profileController = require("../controllers/profile");
const mainController = require("../controllers/main");
 const { ensureAuth } = require("../middleware/auth");
 

// Home Route
router.get('/', homeController.getIndex);


// Recipe Route - Combined Data
router.get("/main",  ensureAuth, mainController.combinedData); // Ensure the user is authenticated


// Login Routes

router.get("/login", authController.getLogin);
// Updated POST /login route with detailed error handling
router.post("/login", authController.postLogin);
// Logout Route
 router.get("/logout", authController.logout);
// Signup Routes
 router.get("/signup", authController.getSignup);
 router.post("/signup", authController.postSignup);

module.exports = router