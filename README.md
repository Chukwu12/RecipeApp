# Recipe App 🍽️

Discover, save, and create recipes with a full-stack Node.js app powered by Spoonacular and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/View%20Engine-EJS-B4CA65?style=for-the-badge)
![Bootstrap](https://img.shields.io/badge/UI-Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Spoonacular API](https://img.shields.io/badge/API-Spoonacular-EF6C00?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

[![Stars](https://img.shields.io/github/stars/Chukwu12/RecipeApp?style=social)](https://github.com/Chukwu12/RecipeApp/stargazers)
[![Forks](https://img.shields.io/github/forks/Chukwu12/RecipeApp?style=social)](https://github.com/Chukwu12/RecipeApp/network/members)

![Recipe App Logo](public/image/onice-logo.png)

## ✨ Highlights

- 🔐 Authentication with Passport (signup, login, sessions)
- 🎲 Random recipe discovery
- 🥗 Health-focused recipe browsing
- 🍰 Dessert category browsing
- 🌍 Cuisine-based recipe exploration (African, American, Asian, Mexican)
- 🔎 Recipe search powered by Spoonacular
- ❤️ Favorite and like recipes
- 🧾 View full recipe details (ingredients + instructions)
- 👤 User profile with custom recipe creation and image upload

## 🧱 Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Auth & Sessions:** Passport, express-session, connect-mongo
- **Templating:** EJS
- **Styling:** CSS/SCSS, Bootstrap, animate.css
- **Media Uploads:** Multer + Cloudinary
- **External Data:** Spoonacular API

## 🚀 Getting Started

### 1) Prerequisites

- Node.js 20.x
- npm
- MongoDB connection string (Atlas or local)
- Spoonacular API key
- Cloudinary account (for image uploads)

### 2) Install dependencies

```bash
npm install
```

### 3) Create environment file

Create `config/.env` and add:

```env
PORT=3000
DB_STRING=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
RECIPES_API_KEY=your_spoonacular_api_key

# Cloudinary
CLOUD_NAME=your_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### 4) Start the app

```bash
npm run dev
```

For production:

```bash
npm start
```

App runs at `http://localhost:3000`.

## ☁️ Deployment

This project includes a Procfile and works well on platforms like Heroku or Render.

### Deploy on Render (recommended)

1. Push your repository to GitHub
2. Create a new Web Service in Render
3. Use Build Command: `npm install`
4. Use Start Command: `npm start`
5. Add environment variable `DB_STRING`
6. Add environment variable `SESSION_SECRET`
7. Add environment variable `RECIPES_API_KEY`
8. Add environment variable `CLOUD_NAME`
9. Add environment variable `API_KEY`
10. Add environment variable `API_SECRET`
11. Add environment variable `PORT` (optional, Render sets this automatically)

### Deploy on Heroku

1. Create a Heroku app and connect this repo
2. Set all required environment variables in Config Vars
3. Deploy from the `main` branch

The `Procfile` already defines:

```procfile
web: node server.js
```

## 🛠️ Available Scripts

- `npm start` - Run the production server (`node server.js`)
- `npm run dev` - Run with nodemon
- `npm run watch:sass` - Watch and compile SCSS

## 🧭 Route Reference

Below is a quick route map for the main HTTP endpoints.

### Auth and Pages

- `GET /` - Landing page
- `GET /main` - Combined dashboard data (auth required)
- `GET /login` - Login page
- `POST /login` - Login submit
- `GET /signup` - Signup page
- `POST /signup` - Signup submit
- `GET /logout` - Logout user
- `GET /recipe` - Main recipe experience (auth required)
- `GET /profile` - User profile (auth required)

### Recipes and Favorites

- `GET /recipe/:id` - Recipe details by ID
- `PUT /recipe/likeRecipe/:id` - Like recipe
- `POST /recipe/favoriteRecipe/:id` - Add favorite recipe
- `DELETE /recipe/recipe/favoriteRecipe/:id` - Delete favorite recipe
- `GET /recipe/recipe/spoonacular/:id` - Fetch by Spoonacular ID
- `POST /profile/updateProfileImage` - Update profile image
- `POST /profile/createRecipe` - Create custom recipe

### Search and Info

- `GET /search-suggestions` - Server-side recipe search suggestions
- `GET /recipes/:id/information` - Recipe information view

### Category Endpoints

- `GET /dessert/recipeInfo/:id` - Dessert recipe details
- `GET /health/recipeInfo/:id` - Healthy recipe details
- `GET /cuisine/:type` - Cuisine recipes by type
- `GET /cuisine/details/:id` - Cuisine recipe details

### Extras

- `GET /random-wine-pairing` - Random wine pairing data
- `GET /trivia/random` - Random food trivia

## 📁 Project Structure

```text
RecipeApp/
├── config/          # DB, passport, API configuration
├── controllers/     # Route handlers and business logic
├── middleware/      # Auth, uploads, cloudinary utilities
├── models/          # Mongoose models
├── public/          # Static assets (css, js, images)
├── routes/          # Express routes
├── views/           # EJS templates
└── server.js        # App entrypoint
```

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## 📄 License

This project is licensed under the **ISC** license.
