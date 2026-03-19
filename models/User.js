const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  profileImage: { type: String, default: null }, // 🆕 Add profile image field

  // 🆕 Add this field to track liked recipes
  likedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }]
});

// Password hash middleware
UserSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

// Helper method for validating user's password
UserSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  if (typeof cb !== 'function') {
    return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) {
          reject(err);
        } else {
          resolve(isMatch);
        }
      });
    });
  }
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
