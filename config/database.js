// config/database.js
const mongoose = require("mongoose");

// useCreateIndex, useNewUrlParser, useUnifiedTopology were removed in Mongoose 6+
// and no longer need to be set.

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_STRING);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
