const cloudinary = require("cloudinary").v2;

require("dotenv").config({ path: "./config/.env" });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  
});

// It's best practice to avoid logging sensitive credentials in production.
// Only log whether required variables are present (not their values).
if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
  console.warn('Cloudinary configuration is missing required environment variables.');
}

module.exports = cloudinary;