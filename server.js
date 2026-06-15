// server.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const flash = require('express-flash');
const csurf = require('@dr.pogodin/csurf');
const logger = require('morgan');
const connectDB = require('./config/database');
const methodOverride = require("method-override");

const path = require('path');


// Import routes
const homeRoutes = require('./routes/home');
const recipeRoutes = require('./routes/recipe');
const healthRoutes = require('./routes/health');
const dessertRoutes = require('./routes/dessert');
// const recipeInfoRoutes = require('./routes/recipeInfo');
const mainRoutes = require('./routes/main');
const profileRoutes = require('./routes/profile');
const cuisineRoutes = require('./routes/cuisine');
const createRoutes = require('./routes/create');
const wineRoutes = require('./routes/wine');
const triviaRoutes = require('./routes/trivia');
const searchRoutes = require('./routes/searchbar');





// Load environment variables
require('dotenv').config({ path: './config/.env' });


// Passport config
require("./config/passport")(passport);


// Connect to database
connectDB();

// Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging
app.use(logger("dev"));

const isProduction = process.env.NODE_ENV === 'production';
// Always trust the proxy (Railway, Heroku, etc.) so req.secure reflects the external HTTPS connection
app.set('trust proxy', 1);

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET, // used to sign the session ID cookie
    resave: false, // forces session to be saved back to the session store
    saveUninitialized: false, // saves a new session, even if uninitialized
    store: MongoStore.create({
      mongoUrl: process.env.DB_STRING,  // Use environment variable for MongoDB URI
      // collectionName: 'sessions' // Optional: Define the collection name for storing sessions
    }),
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction, // Only require HTTPS in production; allows local HTTP dev
    },
  })
);


// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public')); // Serve static files
app.use(methodOverride("_method")); // Comment out if not needed

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Use flash messages for errors, info, etc...
app.use(flash());

// CSRF protection for session-authenticated requests.
const csrfProtection = csurf({
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Routes
app.use('/', homeRoutes);
app.use('/recipe', recipeRoutes);
app.use('/dessert', dessertRoutes);
app.use('/health', healthRoutes);
app.use('/recipeInfo', recipeRoutes);
app.use('/cuisine', cuisineRoutes);
app.use('/', mainRoutes);
app.use('/profile', profileRoutes); // 🛠️ Changed from '/' to '/profile'
app.use('/', wineRoutes);
app.use('/trivia', triviaRoutes);
app.use('/', searchRoutes);




// Global error handling middleware (optional)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    if (req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest') {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    return res.status(403).send('Invalid CSRF token');
  }

  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running, you better catch it!');
});
